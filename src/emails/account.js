const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    //send is async and returns a promise and then in the user router we could use await
    //there is no need to do that though because we dont need node to wait for that to complete
    sgMail.send({
        to: email,
        from: 'jonathanhuertas96@yahoo.com',
        subject: 'Welcome to the Task manager',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app!`
    })
}

const sendCancelationEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'jonathanhuertas96@yahoo.com',
        subject: 'Sorry you are leaving the Task manager',
        text: `Sorry to see you go ${name}. Please let us know what we could have done better. `
    })
}


module.exports = {
    sendWelcomeEmail: sendWelcomeEmail,
    sendCancelationEmail: sendCancelationEmail
}