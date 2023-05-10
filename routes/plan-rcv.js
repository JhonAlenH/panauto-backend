const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationSearchPlanRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchPlanRcv' } });
        });
    }
});

const operationSearchPlanRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let cplan_rc = requestBody.cplan_rc ? requestBody.cplan_rc : undefined
    
    let searchPlanRcv = await bd.searchPlanRcvQuery(cplan_rc).then((res) => res);
    if(searchPlanRcv.error){ return  { status: false, code: 500, message: searchPlanRcv.error }; }
    if(searchPlanRcv.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < searchPlanRcv.result.recordset.length; i++){
            jsonList.push({
                cplan_rc: searchPlanRcv.result.recordset[i].CPLAN_RC,
                xdescripcion: searchPlanRcv.result.recordset[i].XDESCRIPCION,
                mcosto: searchPlanRcv.result.recordset[i].MCOSTO,
                fcreacion: searchPlanRcv.result.recordset[i].FCREACION,
            });
        }
        return { status: true, list: jsonList };
    }else{ return { status: false, code: 404, message: 'Plan Type not found.' }; }
}

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationDetailPlanRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailPlanRcv' } });
        });
    }
});

const operationDetailPlanRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cplan_rc: requestBody.cplan_rc
    }
    let detailPlan = await bd.detailPlanQuery(searchData).then((res) => res);
    if(detailPlan.error){ return  { status: false, code: 500, message: detailPlan.error }; }
    let detailPlanRcv = await bd.detailPlanRcvQuery(searchData).then((res) => res);
    if(detailPlanRcv.error){ return  { status: false, code: 500, message: detailPlanRcv.error }; }
    let servicesTypeList = [];
    let getPlanServicesData = await bd.getPlanRcvServicesDataQuery(searchData.cplan_rc).then((res) => res);
    if(getPlanServicesData.error){ return { status: false, code: 500, message: getPlanServicesData.error }; }
    if(getPlanServicesData.result.rowsAffected > 0){
        for(let i = 0; i < getPlanServicesData.result.recordset.length; i++){
            servicesTypeList.push({
                ctiposervicio: getPlanServicesData.result.recordset[i].CTIPOSERVICIO,
                xtiposervicio: getPlanServicesData.result.recordset[i].XTIPOSERVICIO,
            })
        }
    }
    let jsonList = [];
    if(detailPlanRcv.result.rowsAffected > 0){
        for(let i = 0; i < detailPlanRcv.result.recordset.length; i++){
            jsonList.push({
                xcobertura: detailPlanRcv.result.recordset[i].XCOBERTURA,
                xsoat: detailPlanRcv.result.recordset[i].XSOAT
            })
        }
        return  { 
                    status: true, 
                    list: jsonList, 
                    xplan_rc: detailPlan.result.recordset[0].XDESCRIPCION, 
                    mcosto: detailPlan.result.recordset[0].MCOSTO,
                    services: servicesTypeList
                };

    }else{ return { status: false, code: 404, message: 'Plan Type not found.' }; }
}

router.route('/update').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationUpdatePlanRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationUpdatePlanRcv' } });
        });
    }
});

const operationUpdatePlanRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataPlanRcv = {
        cusuariomodificacion: requestBody.cusuario,
        datos: requestBody.datos,
        xdescripcion: requestBody.xdescripcion,
        mcosto: requestBody.mcosto,
        cplan_rc: requestBody.cplan_rc,
    }
    let planList = [];
    if(dataPlanRcv.datos){
        for(let i = 0; i < dataPlanRcv.datos.length; i++){
            planList.push({
                xcobertura: dataPlanRcv.datos[i].xcobertura,
                xsoat: dataPlanRcv.datos[i].xsoat,
            })
        }
    }
    let updatePlanRcvDetail = await bd.updatePlanRcvQuery(dataPlanRcv, planList).then((res) => res);
    if(updatePlanRcvDetail.error){ return { status: false, code: 500, message: updatePlanRcvDetail.error }; }
    console.log(updatePlanRcvDetail.result.rowsAffected)
    if(updatePlanRcvDetail.result.rowsAffected > 0){ return { status: true, cplan_rc: dataPlanRcv.cplan_rc }; }
    else{ return { status: false, code: 404, message: 'Service Order not found.' }; }
}


router.route('/create').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCreatePlanRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreatePlanRcv' } });
        });
    }
});

const operationCreatePlanRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataPlanRcv = {
        cusuariocreacion: requestBody.cusuario,
        datos: requestBody.datos,
        xdescripcion: requestBody.xdescripcion,
        mcosto: requestBody.mcosto,
    }
    let cplan_rc;
    let planList = [];
    let query = await bd.searchCodePlanRcvQuery(dataPlanRcv).then((res) => res);
    cplan_rc = query.result.recordset[0].CPLAN_RC + 1;

    if(query.result.recordset){
        let createPlan = await bd.createPlanRcvQuery(dataPlanRcv).then((res) => res);
        if(createPlan.error){ return { status: false, code: 500, message: createPlan.error }; }

        if(dataPlanRcv.datos){
            for(let i = 0; i < dataPlanRcv.datos.length; i++){
                planList.push({
                    xcobertura: dataPlanRcv.datos[i].xcobertura,
                    xsoat: dataPlanRcv.datos[i].xsoat,
                })
            }
            let createPlanCoverage = await bd.createPlanCoverageRcvQuery(cplan_rc, planList, dataPlanRcv).then((res) => res);
            if(createPlanCoverage.error){ return { status: false, code: 500, message: createPlanCoverage.error }; }
        }

        if(requestBody.servicesType){
            //Crea los tipos de servicios del plan
            let serviceTypeList = [];
            for(let i = 0; i < requestBody.servicesType.length; i++){
                serviceTypeList.push({
                    ctiposervicio: requestBody.servicesType[i].ctiposervicio,
                })
            }
            let createTypeService = await bd.createServiceTypeFromPlanRcvQuery(serviceTypeList, dataPlanRcv, cplan_rc).then((res) => res);
            if(createTypeService.error){ return  { status: false, code: 500, message: createTypeService.error }; }
        }

        if(requestBody.quantity){
            //Crea la cantidad de servicios que presta.
            let quantityList = [];
            for(let i = 0; i < requestBody.quantity.length; i++){
                quantityList.push({
                    ncantidad: requestBody.quantity[i].ncantidad,
                    cservicio: requestBody.quantity[i].cservicio,
                })
            }
            let updateServiceFromQuantity = await bd.updateServiceFromQuantityRcvQuery(quantityList, cplan_rc).then((res) => res);
            if(updateServiceFromQuantity.error){ return  { status: false, code: 500, message: updateServiceFromQuantity.error }; }
        }
    }else{
        return{status: false, code: 404, message: 'Error de Conexión'}
    }

    let searchLastPlanRcv = await bd.searchLastPlanRcvQuery().then((res) => res);
    if(searchLastPlanRcv.error){ return  { status: false, code: 500, message: searchLastPlanRcv.error }; }
    if(searchLastPlanRcv.result.rowsAffected > 0){return {status: true, cplan_rc: searchLastPlanRcv.result.recordset[0].CPLAN_RC}} 
}

module.exports = router;