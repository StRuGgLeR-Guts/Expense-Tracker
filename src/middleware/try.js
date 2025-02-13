const jwt = require("jsonwebtoken")
const USER = require("../models/users")

const auth =async(req,res,next)=>{
    try{
        const token = req.header("Authorization").replace("Bearer","").trim()
        const decoded = jwt.verify(token,"ilovebathakk")
        const user = await USER.findOne({_id:decoded._id,"tokens.token":token})
        if(!user){
            throw new Error()
        }
        req.user=user
        next()
    }
    catch(e){
        res.status(403).send({error:"Please authenticate"})
    }
    
}
module.exports = auth
