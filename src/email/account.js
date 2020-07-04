const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'phenomforever92@gmail.com',
        subject: 'Welcome to the App',
        text: `Welcome to the app ${name}. Let me know how you get along with the app.`
    })
}

const sendExitEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'phenomforever92@gmail.com',
        subject: 'Thanks for being with us',
        text: `Thanks for your time ${name}. Let me know how we can improve.`
    })
}

module.exports = { sendWelcomeEmail, sendExitEmail }