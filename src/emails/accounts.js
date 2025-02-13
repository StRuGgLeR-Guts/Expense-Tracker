const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_key)
const sendWelEmail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: "sanpreethhost@gmail.com",
            subject: "Being your bf",
            html: `<h1>I love you  so much Bathakk....Mwaahhhhhh!!!</h1>`,
        })
        console.log("Welcome Email sent successfully!");
    } catch (error) {
        console.error("SendGrid Error:", error.response?.body || error)
    }
}
const sendCanEmail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: "sanpreethhost@gmail.com",
            subject: "Due to cancellation",
            html: `<h1>If any sorry for the inconvience caused...Kindly get in contact with the customer care if any help needed!!!!Thank you for your cooperation</h1>`,
        })
        console.log("Cancellation Email sent successfully!")
    } catch (error) {
        console.error("SendGrid Error:", error.response?.body || error)
    }
}


module.exports={
    sendWelEmail,
    sendCanEmail
}
