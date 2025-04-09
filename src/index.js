const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());
// Database connection
require("./db/mongoose.js");

// Routers
const userRouter = require("./router/user.js");
const inputRouter = require("./router/inputs.js");
const expenseRouter = require("./router/expenses.js");
const { router: chatRouter } = require("./router/chat.js");

// Middleware
app.use(express.json());

// API Routes
app.use(userRouter);
app.use(inputRouter);
app.use(expenseRouter);
app.use(chatRouter); // Includes /api/chat

// Start server
app.listen(port, () => {
    console.log("✅ API Server running at port:", port);
});
