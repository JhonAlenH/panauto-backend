const cron = require('node-cron');
const nodemailer = require('nodemailer');
const XlsxPopulate = require('xlsx-populate');
const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');
const { request } = require('express');
let sendEmailListData = []

function changeDateFormat (date) {
    let dateArray = date.toISOString().substring(0,10).split("-");
    return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
  }

async function executeContractSendEmailDataQuery() {
    
    try {
      let getContractSendEmailData = await bd.getContractSendEmailDataQuery();
      return getContractSendEmailData;
    } catch (error) {
      return { status: false, code: 500, message: error };
    }
  }
  
  executeContractSendEmailDataQuery()
 
    .then((result) => {
      if(result.result.rowsAffected > 0){
        for(let i = 0; i < result.result.recordset.length; i++){
            sendEmailListData.push({
                plan: result.result.recordset[i].PLAN,
                membresia: result.result.recordset[i].MEMBRESIA,
                nombreparteno: result.result.recordset[i].NOMBREPATERNO,
                apellidopaterno: result.result.recordset[i].APELLIDOPATERNO,
                fechaInicioPoliza: changeDateFormat(result.result.recordset[i].FECHAINICIOPOLIZA),
                FechaFinPoliza: changeDateFormat(result.result.recordset[i].FECHAFINPOLIZA),
                marca: result.result.recordset[i].MARCA,
                modelo: result.result.recordset[i].MODELO,
                xano: result.result.recordset[i].XANO,
                placa: result.result.recordset[i].PLACA,
                color: result.result.recordset[i].COLOR,
                grua: result.result.recordset[i].GRUA,
                diasvigentes: result.result.recordset[i].DIASVIGENTES,
                cpf: result.result.recordset[i].CPF,
                cobertura: result.result.recordset[i].COBERTURA,
                tipo: result.result.recordset[i].TIPO,
                endoso: result.result.recordset[i].ENDOSO,
            })
        }
      }
    })
    .catch((error) => {
      // Maneja el error aquí
    });

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'alenjhon9@gmail.com',
    pass: 'nnvwygxnvdpjegbj'
  }
});
  
// Programar el envío del correo a las 2:08 PM
cron.schedule('51 15 * * *', async () => {
    try {
      // Obtener los datos para la tabla y el archivo de Excel
      const sendEmailList = sendEmailListData; // Obtén tus datos aquí
  
      // Generar el contenido de la tabla HTML
      const tableHtml = generateTableHtml(sendEmailList);
  
      // Generar el archivo de Excel
      const excelBuffer = await generateExcel(sendEmailList);
  
      // Configurar las opciones del correo
      const mailOptions = {
        from: 'alenjhon9@gmail.com',
        to: 'alenjhon9@gmail.com',
        subject: 'Datos de la tabla y archivo adjunto',
        html: tableHtml,
        attachments: [
          {
            filename: 'emisiones_excel.xlsx',
            content: excelBuffer
          }
        ]
      };
  
      // Enviar el correo
      const info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado:', info.response);
    } catch (error) {
      console.log('Error al enviar el correo:', error);
    }
  });
  
// Función para generar el contenido de la tabla HTML
function generateTableHtml(sendEmailList) {
    let tableHtml = `
    <div style="text-align: center;">
    <img src="https://i.ibb.co/YXWxSk5/panauto.png" alt="Logo" style="width: 250px; height: auto;">
    <h2>Esto es un resumen de la tabla completa.</h2>
    </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background-color: #94A6FA;">
          <tr>
            <th style="border: 1px solid #20317F; padding: 8px; font-weight: bold;">Plan</th>
            <th style="border: 1px solid #20317F; padding: 8px; font-weight: bold;">Nombre</th>
            <th style="border: 1px solid #20317F; padding: 8px; font-weight: bold;">Apellido</th>
            <th style="border: 1px solid #20317F; padding: 8px; font-weight: bold;">Marca</th>
            <th style="border: 1px solid #20317F; padding: 8px; font-weight: bold;">Modelo</th>
            <th style="border: 1px solid #20317F; padding: 8px; font-weight: bold;">Días vigentes</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    for (let i = 0; i < sendEmailList.length; i++) {
      let marca;
      let modelo;
  
      if (sendEmailList[i].marca == null || sendEmailList[i].marca == undefined) {
        marca = 'N/A';
      } else {
        marca = sendEmailList[i].marca;
      }
  
      if (sendEmailList[i].modelo == null || sendEmailList[i].modelo == undefined) {
        modelo = 'N/A';
      } else {
        modelo = sendEmailList[i].modelo;
      }
  
      tableHtml += `
        <tr>
          <td style="border: 1px solid #20317F; padding: 8px;">${sendEmailList[i].plan}</td>
          <td style="border: 1px solid #20317F; padding: 8px;">${sendEmailList[i].nombreparteno}</td>
          <td style="border: 1px solid #20317F; padding: 8px;">${sendEmailList[i].apellidopaterno}</td>
          <td style="border: 1px solid #20317F; padding: 8px;">${marca}</td>
          <td style="border: 1px solid #20317F; padding: 8px;">${modelo}</td>
          <td style="border: 1px solid #20317F; padding: 8px;">${sendEmailList[i].diasvigentes}</td>
        </tr>
      `;
    }
  
    tableHtml += `
        </tbody>
      </table>
      <br>
      <h3>Adicionalmente, se adjunta en formato excel, todas las emisiones registradas el día de hoy.</h3>
    `;
  
    return tableHtml;
  }
  
  // Función para generar el archivo de Excel
  async function generateExcel(sendEmailList) {
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0);
    
    // Escribir encabezados
    const headers = [
      "Plan",
      'Membresia',
      'Nombre',
      'Apellido',
      'F. Inicio',
      'F. Final',
      'Marca',
      'Modelo',
      'Año',
      'Placa',
      'Color',
      'Grua',
      'Días vigentes',
      'CPF',
      'Cobertura',
      'Tipo',
      'Endoso'
    ];
    // console.log(list)
    headers.forEach((header, index) => {
        sheet.row(1).cell(index + 1).value(header);
      });

    for (let i = 0; i < sendEmailList.length; i++) {
      const row = sheet.row(i + 2);
  
      row.cell(1).value(sendEmailList[i].plan);
      row.cell(2).value(sendEmailList[i].membresia);
      row.cell(3).value(sendEmailList[i].nombreparteno);
      row.cell(4).value(sendEmailList[i].apellidopaterno);
      row.cell(5).value(sendEmailList[i].fechaInicioPoliza);
      row.cell(6).value(sendEmailList[i].FechaFinPoliza);
      row.cell(7).value(sendEmailList[i].marca !== null ? sendEmailList[i].marca : 'N/A');
      row.cell(8).value(sendEmailList[i].modelo !== null ? sendEmailList[i].modelo : 'N/A');
      row.cell(9).value(sendEmailList[i].xano);
      row.cell(10).value(sendEmailList[i].placa);
      row.cell(11).value(sendEmailList[i].color);
      row.cell(12).value(sendEmailList[i].grua);
      row.cell(13).value(sendEmailList[i].diasvigentes);
      row.cell(14).value(sendEmailList[i].cpf);
      row.cell(15).value(sendEmailList[i].cobertura);
      row.cell(16).value(sendEmailList[i].tipo);
      row.cell(17).value(sendEmailList[i].endoso);

    }
  
    const buffer = await workbook.outputAsync();
    return buffer;
  }
  

module.exports = router;