const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchContract(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchContract' } });
        });
    }
});

const operationSearchContract = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    const fromDate = requestBody.fdesde.split('-');
    const formattedToDate2 = `${fromDate[2]}-${fromDate[1]}-${fromDate[0]}`;
    const toDate2 = new Date(formattedToDate2);



    const toDateParts = requestBody.fhasta.split('-');
    const formattedToDate = `${toDateParts[2]}-${toDateParts[1]}-${toDateParts[0]}`;
    const toDate = new Date(formattedToDate);
    
    let searchData = {
      fdesde: toDate2,
      fhasta: toDate,
    };
    console.log(searchData)
    let searchContract = await bd.searchContractQuery(searchData).then((res) => res);
    if(searchContract.error){ return  { status: false, code: 500, message: searchContract.error }; }
    if(searchContract.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    let nombre;
    let xvehiculo;
    for(let i = 0; i < searchContract.result.recordset.length; i++){
        nombre = searchContract.result.recordset[i].XNOMBRE + ' ' + searchContract.result.recordset[i].XAPELLIDO;
        xvehiculo = searchContract.result.recordset[i].XMARCA + ' ' + searchContract.result.recordset[i].XMODELO + ' ' + searchContract.result.recordset[i].XVERSION;
        jsonList.push({
            xnombre: nombre,
            xvehiculo: xvehiculo,
            xplaca: searchContract.result.recordset[i].XPLACA,
            ccarga: searchContract.result.recordset[i].ccarga,
            fano: searchContract.result.recordset[i].FANO,
            fhasta_pol: searchContract.result.recordset[i].FHASTA_POL
        });
    }
    return { status: true, list: jsonList };
}

router.route('/create').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCreateRenovation(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreateRenovation' } });
        });
    }
});

const operationCreateRenovation = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let renovationList = {
        cusuariocreacion: requestBody.cusuario,
        cplan: requestBody.planes.cplan,
        cplan_rc: requestBody.planes.cplan_rc,
        xplaca: requestBody.xplaca,
        ccarga: requestBody.ccarga,
    }
    let createRenovation = await bd.createRenovationQuery(renovationList).then((res) => res);
    if(createRenovation.error){ return { status: false, code: 500, message: createRenovation.error }; }
    if(createRenovation.result.rowsAffected > 0){ return { status: true }; }
    else{ return { status: false, code: 404, message: 'Service Order not found.' }; }
    
}



module.exports = router;