const express = require("express")
const router = new express.Router()
const auth = require("../middleware/auth")
const INPUTS = require("../models/inputs")

router.post("/inputs",auth,async(req,res)=>{
    const inputs=new INPUTS({
        ...req.body,
        owner:req.user._id
    })
    try{
        await inputs.save()
        res.status(201).send(inputs)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.get("/inputs", auth, async (req, res) => {
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
            path:'inputs',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        })
        if (!req.user.inputs) {
            return res.send({ error: "No inputs" })
        }
        res.send(req.user.inputs);
    } catch (e) {
        res.status(500).send(e);
    }
})


router.get("/inputs/:id",auth,async(req,res)=>{
    try{
        const _id=req.params.id
        if(_id.length!=24){
            return res.status(404).send({error:"Invalid id"})
        }
        const task= await INPUTS.findOne({_id,owner:req.user._id})
        if(!task){
            return res.send({error:"No Tasks found"})
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.patch("/inputs/:id",auth,async(req,res)=>{
    try{
        const input = Object.keys(req.body)
        const allowedInputs = ["description","completed"]
        const isValid = input.every((input)=>allowedInputs.includes(input))
        if(!isValid){
            return res.status(404).send({error:"Invalid field(s)"})
        }

        const _id= req.params.id
        if(_id.length!=24){
               return res.status(404).send({error:"Invalid id"})
        }

        const inputs= req.body
        const updateTask = await INPUTS.findOne({_id,owner:req.user._id})
       
        if(!updateTask){
            return res.status(404).send({error:"No task found"})
        }

        input.forEach((input)=>updateTask[input]=inputs[input])
        await updateTask.save()

        res.status(201).send(updateTask)
    }
    catch(e){
        res.status(500).send(e)
    }
    

})

router.delete("/inputs/:id",auth,async(req,res)=>{
    try{
        const _id = req.params.id
        if(_id.length!=24){
            return res.status(404).send({error:"Invalid id"})
        }
        const deleteTask= await INPUTS.findOneAndDelete({_id,owner:req.user._id})
        if(!deleteTask){
            return res.status(404).send({error:"No task found"})
        }
        res.send(deleteTask)
    }
    catch(e){
        res.status(500).send(e)
    }
    
})

module.exports = router