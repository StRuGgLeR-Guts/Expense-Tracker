const mongoose = require('mongoose');

const uri = process.env.Mongo_URL; // Use 'URL' instead of 'MONGO_URI'

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,  // Ensure TLS is enabled
    tlsAllowInvalidCertificates: false, // Reject invalid certs
    serverSelectionTimeoutMS: 5000, // Timeout if MongoDB isn't responding
}).then(() => {
    console.log("✅ Connected to MongoDB Atlas");
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
});
