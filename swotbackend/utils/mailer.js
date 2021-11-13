const nodemailer = require('nodemailer');
const jwt = require ('jsonwebtoken');
require('dotenv').config();

const mailTransport = nodemailer.createTransport(
  {
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  }
);

const mailSender = (to, subject, body)=>{
  const mailOptions = {
    "from": 'process.env.MAIL_USER',
    "to": to,
    "subject": subject,
    //"text": body
    "html": body
  }

  mailTransport.sendMail( mailOptions, (err, info)=>{
    if(err){
      console.log(err);
    } else {
      console.log(`Email Sent: ${info.response}`);
    }
  });
}

const ForgotPassword = {
  async sendMail(req,res){
    res.status(400).send({
      message : "El email es requerido"
    })
  }

  
}

module.exports = mailSender;