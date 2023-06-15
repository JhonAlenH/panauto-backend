const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');
const { request } = require('express');
const nodemailer = require('nodemailer');

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
      from: 'alenjhon9@gmail.com',
      to: 'alenjhon9@gmail.com',
      subject: '!Bienvenido a Panauto¡',
      html: `
        <html>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="text-align: center;">
              <img src="https://i.ibb.co/YXWxSk5/panauto.png" alt="Logo" style="width: 250px; height: auto;">
              <h2>Hola <span style="color: #0070C0;">YVES HOENEN</span>,</h2>
              <h4 style="color: #0070C0;">¡Te damos la bienvenida al Club PanAuto!</h4>
              <h4>Ahora podrás disfrutar de todos los beneficios de PanAuto, tu plataforma online.</h4>
              <h4>Para acceder a nuestro canal de autogestión online, puedes hacerlo con:</h4>
              <h4>Correo electrónico</h4>
              <h2 style="color:#0070c0;margin-top: -17px;">yveshoenen@gmail.com</h2>
              <h4>Contraseña</h4>
              <h2 style="color:#0070c0;margin-top: -17px;">Yh654321*</h2>
              <h4>¿Qué ventajas tienes como usuario registrado?</h4>
              <p>Realizar trámites y consultas desde el lugar donde estés, acceder y agendar todos los servicios de forma digital asociados a tu perfil.</p>
              <h4>Conoce lo que puedes hacer <a href="https://www.panautoclub.com/">aquí</a>.</h4>
              <p style="font-size: 18px; font-style: italic; border-radius: 10px; background-color: lightgray; padding: 10px;">Conduce tu vehículo, del resto nos encargamos nosotros.</p>
            </div>
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

module.exports = router;