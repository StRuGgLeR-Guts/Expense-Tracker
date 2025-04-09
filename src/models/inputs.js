const mongoose =require("mongoose")

const inputSchema = new mongoose.Schema({
    Income:{
    type:Number,
    required:true,
    trim:true
},
Limit:{
    type:Number,
    required:true
},
owner:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"users"
}

},{
    timestamps:true
})

const Inputs=mongoose.model("inputs",inputSchema)
module.exports=Inputs