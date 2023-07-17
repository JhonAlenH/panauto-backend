const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

function changeDateFormat (date) {
    let dateArray = date.toISOString().substring(0,10).split("-");
    return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
}

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchTracing(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchTracing' } });
        });
    }
});

const operationSearchTracing = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataTracing = {
        xvencimiento: requestBody.xvencimiento,
        ccanal: requestBody.ccanal ? requestBody.ccanal: undefined,
    }
    let tracingList = []
    let getServiceTypePlan = await bd.getSearchTracingData(dataTracing).then((res) => res);
    if(getServiceTypePlan.error){ return { status: false, code: 500, message: getServiceTypePlan.error }; }
    if(getServiceTypePlan.result){
        for(let i = 0; i < getServiceTypePlan.result.recordset.length; i++){
            let cerrado;
            let vencimiento;
            if(getServiceTypePlan.result.recordset[i].BCERRADO == false){
                cerrado = 'No'
            }else{
                cerrado = 'Si'
            }
            let date = new Date()
            let fechaISO = date.toISOString().substring(0, 10);

            if(getServiceTypePlan.result.recordset[i].FSEGUIMIENTONOTIFICACION.toISOString().split('T')[0] == fechaISO){
                vencimiento = "DIA"     
            }
            else if(getServiceTypePlan.result.recordset[i].FSEGUIMIENTONOTIFICACION.toISOString().split('T')[0] < fechaISO){
                vencimiento  = "ATRASADOS"           
            }
            else if(getServiceTypePlan.result.recordset[i].FSEGUIMIENTONOTIFICACION.toISOString().split('T')[0] > fechaISO)
            {
                vencimiento = "VENCER"   
            }

            tracingList.push({
                cnotificacion: getServiceTypePlan.result.recordset[i].CNOTIFICACION,
                xtiposeguimiento: getServiceTypePlan.result.recordset[i].XTIPOSEGUIMIENTO,
                xmotivoseguimiento: getServiceTypePlan.result.recordset[i].XMOTIVOSEGUIMIENTO,
                bcerrado: cerrado,
                xvencimiento : vencimiento,
                xobservacion: getServiceTypePlan.result.recordset[i].XOBSERVACION,
                fseguimiento: getServiceTypePlan.result.recordset[i].FSEGUIMIENTONOTIFICACION.toISOString().split('T')[0]
            })
            
        }
    }
    return { status: true, list: tracingList }
}

module.exports = router;