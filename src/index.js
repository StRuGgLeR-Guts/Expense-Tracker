const express=require("express")
const app=express()
const port = process.env.PORT

require("./db/mongoose.js")
const userRouter = require("./router/user.js")
const taskRouter =require("./router/task.js")


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
    console.log("Server running at port :"+port)
})


