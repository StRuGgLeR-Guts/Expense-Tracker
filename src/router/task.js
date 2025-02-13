const express = require("express")
const router = new express.Router()
const auth = require("../middleware/auth")
const TASKS = require("../models/tasks")

router.post("/tasks",auth,async(req,res)=>{
    const tasks=new TASKS({
        ...req.body,
        owner:req.user._id
    })
    try{
        await tasks.save()
        res.status(201).send(tasks)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.get("/tasks", auth, async (req, res) => {
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
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        })
        if (!req.user.tasks) {
            return res.send({ error: "No tasks" })
        }
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }
})


router.get("/tasks/:id",auth,async(req,res)=>{
    try{
        const _id=req.params.id
        if(_id.length!=24){
            return res.status(404).send({error:"Invalid id"})
        }
        const task= await TASKS.findOne({_id,owner:req.user._id})
        if(!task){
            return res.send({error:"No Tasks found"})
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.patch("/tasks/:id",auth,async(req,res)=>{
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

        const tasks= req.body
        const updateTask = await TASKS.findOne({_id,owner:req.user._id})
       
        if(!updateTask){
            return res.status(404).send({error:"No task found"})
        }

        input.forEach((input)=>updateTask[input]=tasks[input])
        await updateTask.save()

        res.status(201).send(updateTask)
    }
    catch(e){
        res.status(500).send(e)
    }
    

})

router.delete("/tasks/:id",auth,async(req,res)=>{
    try{
        const _id = req.params.id
        if(_id.length!=24){
            return res.status(404).send({error:"Invalid id"})
        }
        const deleteTask= await TASKS.findOneAndDelete({_id,owner:req.user._id})
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