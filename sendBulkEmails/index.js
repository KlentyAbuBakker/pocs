const nodemailer = require("nodemailer");

async function sendMail (mailDetails){
  let mailTransporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "pipedriveauthtest@gmail.com",
      pass: "<SMTP_password>"
    }
  });

  await mailTransporter.sendMail(mailDetails, (err, data) => {
    if (err) console.log(err);
    console.log(data);
  });
  console.log("Hello World");
}
(async() => {
    for(let i = 0; i< 20; i ++) {
        console.log("Iteration " + i);
        const mailDetails = {
            from: "pipedriveauthtest@gmail.com",
            to: "klentyreply@outlook.com",
            subject: `Test mail Iteration-${i}`,
            text: `Iteration - ${i} Testing mail from nodemailer`
          };
        
        await sendMail(mailDetails);
    }
})()

