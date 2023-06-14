const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');
const { request } = require('express');
const nodemailer = require('nodemailer');

console.log('hola')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'alenjhon9@gmail.com',
      pass: '126711jalenhidalgo'
    }
  });

  let mailOptions = {
    from: 'alenjhon9@gmail.com',
    to: 'alenjhon9@gmail.com',
    subject: 'Correo de prueba',
    text: 'Este es un correo de prueba enviado desde Node.js con nodemailer.'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado correctamente:', info.response);
    }
  });

  module.exports = router;