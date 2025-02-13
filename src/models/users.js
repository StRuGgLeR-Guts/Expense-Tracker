const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("./tasks")
const node = require("debug/src/node")

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,

    },
    password:{
        type:String,
        minlength:6,
        trim:true,
        required:true,
        validate:{
        validator(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("The password cant be 'password'")
            }
        }
    }
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.methods.toJSON = function(){
    
    const user= this
    const userObject = user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    //delete userObject._id
    
    return userObject
}
userSchema.virtual('tasks',{
    ref:"tasks",
    localField:"_id",
    foreignField:"owner"
})


userSchema.methods.makeToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.TOKEN)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (username,password)=>{
    const user = await User.findOne({username})
    if(!user){
        throw new Error("Unable to login")
    }
    const isValid = await bcrypt.compare(password,user.password)
    if(!isValid){
        throw new Error("Unable to login")
    }
    return user
}

//hashing assword before saving for security
userSchema.pre('save',async function(next) {
    const user =this
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

//Deleting tasks when the coressponding user is deleted
userSchema.pre('deleteOne', { document: true }, async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
  })

const User= mongoose.model("users",userSchema)
module.exports= User