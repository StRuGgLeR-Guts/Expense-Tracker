const express =require("express")
const router = new express.Router()
const USER =require("../models/users")
const auth = require("../middleware/auth")
const jwt = require('jsonwebtoken');
const {sendWelEmail,sendCanEmail} = require("../emails/accounts")


router.post("/users", async(req,res)=>{
    const user=new USER(req.body)
    try{
        //const token =await user.makeToken()
        const token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN);

        // Push token to tokens array
        user.tokens = user.tokens.concat({ token });
        await user.save();

         
        sendWelEmail(user.email,user.username)     
        res.status(201).send({user,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.post("/users/login",async(req,res)=>{
    try{
        const user= await USER.findByCredentials(req.body.username,req.body.password)
        const token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN);
        user.tokens = user.tokens.concat({ token });
        await user.save();

        res.send({user,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})
router.post("/users/logout",auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send({Message:"Logged out succesfully"})
    }
    catch(e){
        res.status().send(e)
    }
})

router.post("/users/logoutall",auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send({Message:"Logged out"})
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.get("/users/me",auth,async(req,res)=>{
   res.send(req.user)
})

router.patch("/users/me",auth,async(req,res)=>{
    try{
        const input=Object.keys(req.body)
        const allowedinputs =["username","password"]
        const isValid = input.every((input)=>allowedinputs.includes(input))
        if(!isValid){
            return res.status(400).send({error:"Invalid field(s)"})
        }
        
        input.forEach((input)=> req.user[input]=req.body[input])
        await req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }    
})

router.delete('/users/me', auth, async (req, res) => {
    try {
    await req.user.deleteOne()
    sendCanEmail(req.user.email,req.user.username)
    res.send(req.user)
    } catch (err) {
      res.status(500).send(err.message)
    }
  })



module.exports = router