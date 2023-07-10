const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');
const { request } = require('express');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');
const { Vonage } = require('@vonage/server-sdk')


router.route('/emailService').post((req, res) => {
  if(!req.header('Authorization')){
      res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
      return;
  }else{
      operationEmailService(req.header('Authorization'), req.body).then((result) => {
          if(!result.status){
              res.status(result.code).json({ data: result });
              return;
          }
          res.json({ data: result });
      }).catch((err) => {
          res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationEmailService' } });
      });
  }
});

const operationEmailService = async(authHeader, requestBody) => {
  if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
  let dataNotifications = await bd.companyValrepQuery().then((res) => res);
  if(dataNotifications.error){ return { status: false, code: 500, message: dataNotifications.error }; }
  if(dataNotifications.result.rowsAffected > 0){
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'alenjhon9@gmail.com',
        pass: 'nnvwygxnvdpjegbj'
      }
    });
  
    let mailOptions = {
      from: 'Jhon Alen',
      to: 'jalen@compuamerica.com.ve',
      subject: '¡Bienvenido a Panauto!',
      html: `
        <html>
          <body>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <img src="https://i.ibb.co/YXWxSk5/panauto.png" alt="Logo" style="width: 250px; height: auto;">
                  <h2>Hola <span style="color: #0070C0;">Jhon Alen</span>,</h2>
                  <h4 style="color: #0070C0;">¡Te damos la bienvenida al Club PanAuto!</h4>
                  <h4>Ahora podrás disfrutar de todos los beneficios de PanAuto, tu plataforma online.</h4>
                  <h4>Para acceder a nuestro canal de autogestión online, puedes hacerlo con:</h4>
                  <h4>Correo electrónico</h4>
                  <h2 style="color:#0070c0;margin-top: -17px;">alenjhon9@gmail.com</h2>
                  <h4>Contraseña</h4>
                  <h2 style="color:#0070c0;margin-top: -17px;">126711</h2>
                  <h4>¿Qué ventajas tienes como usuario registrado?</h4>
                  <p>Realizar trámites y consultas desde el lugar donde estés, acceder y agendar todos los servicios de forma digital asociados a tu perfil.</p>
                  <h4>Conoce lo que puedes hacer <a href="https://www.panautoclub.com/">aquí</a>.</h4>
                  <p style="font-size: 18px; font-style: italic; border-radius: 10px; background-color: lightgray; padding: 10px;">Conduce tu vehículo, del resto nos encargamos nosotros.</p>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <img src="https://www.es.kayak.com/news/wp-content/uploads/sites/47/2017/07/coches-2.gif" alt="GIF" style="width: 246px; height: auto;">
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    };
    
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log('Error al enviar el correo:', error);
      } else {
        console.log('Correo enviado correctamente:', info.response);
        return {status: true}
      }
    });
  }
}

router.route('/sms').post((req, res) => {
  if(!req.header('Authorization')){
      res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
      return;
  }else{
      operationTelegramService(req.header('Authorization'), req.body).then((result) => {
          if(!result.status){
              res.status(result.code).json({ data: result });
              return;
          }
          res.json({ data: result });
      }).catch((err) => {
          res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationTelegramService' } });
      });
  }
});

const operationTelegramService = async(authHeader, requestBody) => {
  if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }

// Configuración de la API de Nexmo
const vonage = new Vonage({
  apiKey: "bf884f3a",
  apiSecret: "EgFUI84w8TJxQdFt"
})

const from = "Vonage APIs"
const to = "573174290143"
const text = 'Hola Yaneidy'

async function sendSMS() {
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

sendSMS();
}

module.exports = router;