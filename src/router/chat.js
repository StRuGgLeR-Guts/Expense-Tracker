const express = require("express");
const router = express.Router();
const EXPENSE = require("../models/expenses")
const INPUT = require("../models/inputs")
const auth = require("../middleware/auth")
const { getChatbotResponse } = require("./utils/messages"); // Example function

// POST /api/chat — for React Native frontend
router.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Send to Chatbase/Gemini or return a dummy response
        const botReply = await getChatbotResponse(userMessage);

        res.json({ reply: botReply });
    } catch (err) {
        console.error("Chat error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/api/chatmonth",auth,async(req,res)=>{
    const days = 30
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days)
        const inputData = await INPUT.findOne({ owner: req.user._id }); // userId is the ObjectId of the user
        const limit = inputData.Limit;

        const result = await EXPENSE.aggregate([
            {
                $match: {
                    owner: req.user._id,
                    createdAt: { $gte: daysAgo }
                }
            },
            {
                $facet: {
                    byCategory: [
                        { $group: { _id: "$Item", total: { $sum: "$expense" } } }
                    ],
                    overallTotal: [
                        { $group: { _id: null, total: { $sum: "$expense" } } }
                    ]
                }
            }
        ])
        const totalSpent = result[0].overallTotal[0]?.total || 0;
            if (limit < totalSpent)
            {
                const itemsSummary = result[0].byCategory
                    .map(item => `${item._id}: ₹${item.total}`)
                    .join(", ");
            
                const msg = `Let them know that their monthly spending as exceeded than their monthly limit in a specific way so that they get alerted also mention their limit:${limit} and MonthExpense:${totalSpent}and give tips for saving money and on which items to spend carefully. Items: ${itemsSummary}...Use this ₹ infront of money values`;
                const botReply = await getChatbotResponse(msg);
                return res.json({ reply: botReply });
            }
            const msg=`Start by congratulating the user that your monthly spending is less than what your limit was  also mention their limit:${limit} and MonthExpense:${totalSpent} and motivate them to do the same or better...Use this ₹ infront of money values`
            const botReply = await getChatbotResponse(msg)
            res.json({ reply: botReply })

})

router.post("/api/chatday",auth,async(req,res)=>{
    
    try{
        const days = 1
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days)

        const result = await EXPENSE.aggregate([
            {
                $match: {
                    owner: req.user._id,
                    createdAt: { $gte: daysAgo }
                }
            },
            {
                $facet: {
                    byCategory: [
                        { $group: { _id: "$Item", total: { $sum: "$expense" } } }
                    ],
                    overallTotal: [
                        { $group: { _id: null, total: { $sum: "$expense" } } }
                    ]
                }
            }
        ])
        const totalSpent = result[0].overallTotal[0]?.total || 0
                const itemsSummary = result[0].byCategory
                    .map(item => `${item._id}: ₹${item.total}`)
                    .join(", ");
            
                    const msg = `Let them know that their daily spending and give tips for saving money and on which items to spend carefully. Items: ${itemsSummary}...Use this ₹ infront of money values....prioritize on talking about the items`;
                    const botReply = await getChatbotResponse(msg);
                    return res.json({ reply: botReply });

    }
    catch(e){
        res.status(404).send(e)
    }
        
})

module.exports = { router };
