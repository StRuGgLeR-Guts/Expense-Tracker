const express = require("express")
const cron = require("node-cron")
const router = new express.Router()
const auth = require("../middleware/auth")
const INPUT = require("../models/inputs")
const EXPENSE = require("../models/expenses")

router.post("/expense",auth,async(req,res)=>{
    const expense=new EXPENSE({
        ...req.body,
        owner:req.user._id
    })
    try{
        await expense.save()
        res.status(201).send(expense)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.get("/expense", auth, async (req, res) => {
    const match={}
    const sort ={}
    
    if(req.query.completed){
        match.completed = req.query.completed ==='true'
    }
    if(req.query.sortby){
        const parts = req.query.sortby.split(':')
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path:'expenses',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        })
        if (!req.user.expenses) {
            return res.send({ error: "No expense" })
        }
        res.send(req.user.expenses);
    } catch (e) {
        res.status(500).send(e);
    }
})


router.get("/expense/:id",auth,async(req,res)=>{
    try{
        const _id=req.params.id
        if(_id.length!=24){
            return res.status(404).send({error:"Invalid id"})
        }
        const expense= await EXPENSE.findOne({_id,owner:req.user._id})
        if(!expense){
            return res.send({error:"No Tasks found"})
        }
        res.send(expense)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.patch("/expense/:id",auth,async(req,res)=>{
    try{
        const input = Object.keys(req.body)
        const allowedInputs = ["Item","expense"]
        const isValid = input.every((input)=>allowedInputs.includes(input))
        if(!isValid){
            return res.status(404).send({error:"Invalid field(s)"})
        }

        const _id= req.params.id
        if(_id.length!=24){
               return res.status(404).send({error:"Invalid id"})
        }

        const expense= req.body
        const updateExpense = await EXPENSE.findOne({_id,owner:req.user._id})
       
        if(!updateExpense){
            return res.status(404).send({error:"No expense found"})
        }

        input.forEach((input)=>updateExpense[input]=expense[input])
        await updateExpense.save()

        res.status(201).send(updateExpense)
    }
    catch(e){
        res.status(500).send(e)
    }
    

})

router.get("/totalexpense", auth, async (req, res) => {
    try {
      const result = await EXPENSE.aggregate([
        {
          $match: {
            owner: req.user._id,
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
      ]);
      res.send({
        byCategory: result[0].byCategory.length ? result[0].byCategory : "No items and expenses",
        overallTotal: result[0].overallTotal[0]?.total || 0
      });
    } catch (error) {
      console.error("Error fetching total expense:", error);
      res.status(400).send({ error: "Cannot get the total expense" });
    }
  });  

  router.get("/range_expense", auth, async (req, res) => {
    try {
        const { days } = req.query;
        const numDays = parseInt(days) || 6;

        // End date: today at 23:59:59
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        // Start date: (n - 1) days ago at 00:00:00
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(endDate.getDate() - numDays + 1);

        const result = await EXPENSE.aggregate([
            {
                $match: {
                    owner: req.user._id,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $facet: {
                    byCategory: [
                        { $group: { _id: "$Item", total: { $sum: "$expense" } } }
                    ],
                    overallTotal: [
                        { $group: { _id: null, total: { $sum: "$expense" } } }
                    ],
                    byDay: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                                },
                                total: { $sum: "$expense" }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ]);

        // Fill in missing days with total = 0
        const dayTotals = {};
        result[0].byDay.forEach(entry => {
            dayTotals[entry._id] = entry.total;
        });

        const fullByDay = [];
        const current = new Date(startDate);

        for (let i = 0; i < numDays; i++) {
            const dateStr = current.toISOString().split("T")[0];
            fullByDay.push({
                _id: dateStr,
                total: dayTotals[dateStr] || 0
            });
            current.setDate(current.getDate() + 1);
        }

        res.status(200).json({
            byCategory: result[0].byCategory,
            overallTotal: result[0].overallTotal[0]?.total || 0,
            byDay: fullByDay
        });

    } catch (err) {
        console.error("Error in /range_expense:", err);
        res.status(500).json({ error: "Server error" });
    }
});


router.get("/balance", auth, async (req, res) => {
    try {
      const result = await EXPENSE.aggregate([
        { $match: { owner: req.user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: "$expense" },
          },
        },
      ]);
  
      const total = result[0]?.total || 0;
  
      const input = await INPUT.findOne({ owner: req.user._id }).sort({ createdAt: -1 });
      if (!input || input.Limit == null) {
        return res.status(400).send({ error: "No spending limit set for this user." });
      }
  
      const limit = input.Limit;
      const balance = limit - total;
  
      res.send({ balance });
    } catch (e) {
      console.error("❌ Balance route error:", e);
      res.status(500).send({ error: "Failed to calculate balance", message: e.message });
    }
  });
  


router.delete("/expense/:id",auth,async(req,res)=>{
    try{
        const _id = req.params.id
        if(_id.length!=24){
            return res.status(404).send({error:"Invalid id"})
        }
        const deleteExpense= await EXPENSE.findOneAndDelete({_id,owner:req.user._id})
        if(!deleteExpense){
            return res.status(404).send({error:"No expense found"})
        }
        res.send(deleteTask)
    }
    catch(e){
        res.status(500).send(e)
    }
    
})


// ✅ Cron Job to Run Automatically Every Day at Midnight
// cron.schedule("0 0 * * *", async () => {
//     try {
//         const days = 6
//         const daysAgo = new Date();
//         daysAgo.setDate(daysAgo.getDate() - days);

//         const result = await EXPENSE.aggregate([
//             {
//                 $match: {
//                     owner: req.user._id,
//                     createdAt: { $gte: daysAgo }
//                 }
//             },
//             {
//                 $facet: {
//                     byCategory: [
//                         { $group: { _id: "$Item", total: { $sum: "$expense" } } }
//                     ],
//                     overallTotal: [
//                         { $group: { _id: null, total: { $sum: "$expense" } } }
//                     ]
//                 }
//             }
//         ])

//         res.send({
//             byCategory: result[0].byCategory.length ? result[0].byCategory : "No items and expenses",
//             overallTotal: result[0].overallTotal[0]?.total || 0
//         })

//     } catch (error) {
//         res.send("🚨 Cron Job Error:", error);
//     }
// });

module.exports = router