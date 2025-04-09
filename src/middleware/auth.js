const jwt = require("jsonwebtoken");
const USER = require("../models/users");

const auth = async (req, res, next) => {
    try {
        // Correctly extract the token from the Authorization header
        const token = req.header("Authorization").replace("Bearer ", "").trim();
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.TOKEN);
        
        // Find the user associated with the token
        const user = await USER.findOne({ _id: decoded._id, "tokens.token": token });
        
        // If user is not found, throw an error
        if (!user) {
            return res.status(401).send({ error: "Authentication failed: User not found." });
        }
        
        // Attach token and user to the request object
        req.token = token;
        req.user = user;
        
        // Call the next middleware
        next();
    } catch (e) {
        // Handle errors and send a response
        res.status(401).send({ error: "Authentication failed: Invalid token." });
    }
};

module.exports = auth;