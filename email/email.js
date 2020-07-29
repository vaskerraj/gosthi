const nodemailer = require('nodemailer');
const ejs = require('ejs');
const app = require('express')();

app.set('views', __dirname  + '/views');

const { EMAIL_SMTP_ADD, EMAIL_SMTP_PORT, EMAIL_SMTP_USER, EMAIL_SMTP_PASS } = require('../config/index');

const emailHandler = async (emails, meeting_id, meeting_title, meeting_DateTime, meeting_link)=> {
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: EMAIL_SMTP_ADD,
      port: EMAIL_SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: EMAIL_SMTP_USER, // generated ethereal user
        pass: EMAIL_SMTP_PASS, // generated ethereal password
      },
    });

    const emailBody = await ejs.renderFile(__dirname+"/meetingInvitation.ejs", 
                        { 
                            id: meeting_id,
                            title : meeting_title,
                            inv_date : meeting_DateTime,
                            link : meeting_link
                        }
                    );


    let info = await transporter.sendMail({
        from: '"Gosthi" <no-reply@gosthi.com>', // sender address
        to: emails, // list of receivers
        subject: `Invitation: ${meeting_title}@Gosthi.online`, // Subject line
        html: emailBody, // html body
      });
    
      console.log("Message sent: %s", info.messageId);
}

module.exports = {
    emailHandler
}