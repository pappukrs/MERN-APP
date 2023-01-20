const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "77f8d9b555f176",
      pass: "2ad3d88a4b16f9",
    },
  });

  const mailOptions = {
    from: "",
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  await transporter.send(mailOptions);
};
