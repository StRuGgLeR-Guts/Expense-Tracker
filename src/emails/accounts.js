const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_key)
const sendWelEmail = async (email, name) => {
        await sgMail.send({
            to: email,
            from: "sanpreethhost@gmail.com",
            subject: "Joining",
            html: `<h1>hII ${name} thanks for choosing us...have a stable future by using our app!!!</h1>`,
        })
}
const sendCanEmail = async (email, name) => {
        await sgMail.send({
            to: email,
            from: "sanpreethhost@gmail.com",
            subject: "Due to cancellation",
            html: `<h1>We are deeply sorry ${name} if any  inconvience caused...Kindly get in contact with the customer care if any help needed!!!!Thank you for your cooperation</h1>`,
        })
}


module.exports={
    sendWelEmail,
    sendCanEmail
}
