const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        auth: {
            user: "1905398@kiit.ac.in",
            pass: "afjhjhimdajbcfsa"
        }
    }
)

const options = {
    from: "rayanshuman2000@gmail.com", 
    subject: "Email Verification"
}

function sendMail(user) {
    console.log(user);
    options.to = user.to;
    options.text = user.text;
    transporter.sendMail(options, function(err, info) {
        if(err) {
            console.log(err);
            return err;
        }
        console.log("sent: " + info.response);
        return;
    })
}

module.exports = sendMail;