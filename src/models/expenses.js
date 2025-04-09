const mongoose =require("mongoose")

const expenseSchema = new mongoose.Schema({
    Item:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    expense:{
    type:Number,
    required:true,
    trim:true
},Title:{
    type:String,
    trim:true,
    lowercase:true
},owner:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"users"
}
},{
    timestamps:true
})

const Expenses=mongoose.model("expenses",expenseSchema)
module.exports=Expenses