const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  return sgMail.send({
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Let me know how you get along the app.`,
  });
};

const sendCancellationEmail = (email, name) => {
  return sgMail.send({
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject: 'Cancel from the app',
    text: `Thanks for using our app. We hope we will see again, ${name}`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
