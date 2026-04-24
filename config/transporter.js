require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service:'yahoo',
    secure : false,
    auth : {
        user : process.env.AUTH_MAIL,
        pass : process.env.AUTH_PASS
    }
});

transporter.verify((err, succ) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Can send emails (Verified): ${succ}`);
        console.log(`Ready to send emails from ${process.env.AUTH_MAIL}`);
    }
});

module.exports = transporter;