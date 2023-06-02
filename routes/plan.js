const router = require('express').Router();
const bd = require('../src/bd');
const helper = require('../src/helper');

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchPlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchPlan' } });
        });
    }
});

const operationSearchPlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        ctipoplan: requestBody.ctipoplan ? requestBody.ctipoplan : undefined,
        xplan: requestBody.xplan ? requestBody.xplan.toUpperCase() : undefined
    };
    let searchPlan = await bd.searchPlanQuery(searchData).then((res) => res);
    if(searchPlan.error){ return  { status: false, code: 500, message: searchPlan.error }; }
    if(searchPlan.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchPlan.result.recordset.length; i++){
        jsonList.push({
            cplan: searchPlan.result.recordset[i].CPLAN,
            xplan: searchPlan.result.recordset[i].XPLAN,
            mcosto: searchPlan.result.recordset[i].MCOSTO,
            bactivo: searchPlan.result.recordset[i].BACTIVO
        });
    }
    return { status: true, list: jsonList };
}

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationDetailPlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailPlan' } });
        });
    }
});

const operationDetailPlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let planData = {
        ccompania: requestBody.ccompania,
        cpais: requestBody.cpais,
        cplan: requestBody.cplan,
        ctipoplan: requestBody.ctipoplan
    };
    let getPlanData = await bd.getPlanDataQuery(planData).then((res) => res);
    if(getPlanData.error){ return { status: false, code: 500, message: getPlanData.error }; }
    if(getPlanData.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let servicesTypeList = [];
    let getPlanServicesData = await bd.getPlanServicesDataQuery(planData.cplan).then((res) => res);
    if(getPlanServicesData.error){ return { status: false, code: 500, message: getPlanServicesData.error }; }
    if(getPlanServicesData.result.rowsAffected > 0){
        for(let i = 0; i < getPlanServicesData.result.recordset.length; i++){
            servicesTypeList.push({
                ctiposervicio: getPlanServicesData.result.recordset[i].CTIPOSERVICIO,
                xtiposervicio: getPlanServicesData.result.recordset[i].XTIPOSERVICIO,
            })
        }
    }
    let servicesInsurers = [];
    let getPlanServicesInsurersData = await bd.getPlanServicesInsurersDataQuery(planData.cplan).then((res) => res);
    if(getPlanServicesInsurersData.error){ return { status: false, code: 500, message: getPlanServicesInsurersData.error }; }
    if(getPlanServicesInsurersData.result.rowsAffected > 0){
        for(let i = 0; i < getPlanServicesInsurersData.result.recordset.length; i++){
            let serviceInsurer = {
                cservicio: getPlanServicesInsurersData.result.recordset[i].CSERVICIO_ASEG,
                cservicioplan: getPlanServicesInsurersData.result.recordset[i].CSERVICIOPLAN,
                xservicio: getPlanServicesInsurersData.result.recordset[i].XSERVICIO_ASEG,
                ctiposervicio: getPlanServicesInsurersData.result.recordset[i].CTIPOSERVICIO,
                xtiposervicio: getPlanServicesInsurersData.result.recordset[i].XTIPOSERVICIO,
            }
            servicesInsurers.push(serviceInsurer);
        }
    }
    return { 
        status: true,
        cplan: getPlanData.result.recordset[0].CPLAN,
        xplan: getPlanData.result.recordset[0].XPLAN,
        mcosto: getPlanData.result.recordset[0].MCOSTO,
        ctipoplan: getPlanData.result.recordset[0].CTIPOPLAN,
        brcv: getPlanData.result.recordset[0].BRCV,
        bactivo: getPlanData.result.recordset[0].BACTIVO,
        services: servicesTypeList,
        servicesInsurers: servicesInsurers,
        parys: getPlanData.result.recordset[0].PARYS, 
        paseguradora: getPlanData.result.recordset[0].PASEGURADORA,
        cmoneda: getPlanData.result.recordset[0].CMONEDA,
        ptasa_casco: getPlanData.result.recordset[0].PTASA_CASCO,
        ptasa_catastrofico: getPlanData.result.recordset[0].PTASA_CATASTROFICO,
        msuma_recuperacion: getPlanData.result.recordset[0].MSUMA_RECUPERACION,
        mprima_recuperacion: getPlanData.result.recordset[0].MPRIMA_RECUPERACION,
        mdeducible: getPlanData.result.recordset[0].MDEDUCIBLE,
    }
}

router.route('/search-service').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchService(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchService' } });
        });
    }
});

const operationSearchService = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let ctiposervicio =  requestBody.ctiposervicio

    let searchService = await bd.getServiceFromPlanServiceQuery(ctiposervicio).then((res) => res);
    if(searchService.error){ return  { status: false, code: 500, message: searchService.error }; }
    if(searchService.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchService.result.recordset.length; i++){
        jsonList.push({
            cservicio: searchService.result.recordset[i].CSERVICIO,
            xservicio: searchService.result.recordset[i].XSERVICIO,
        });
    }
    return { status: true, list: jsonList };
}

router.route('/create').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCreatePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreatePlan' } });
        });
    }
});

const operationCreatePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataList =  {
        cplan: requestBody.cplan,
        ctipoplan: requestBody.ctipoplan,
        xplan: requestBody.xplan,
        paseguradora: requestBody.paseguradora ? requestBody.paseguradora: 0,
        parys: requestBody.parys ? requestBody.parys: 100,
        mcosto: requestBody.mcosto,
        brcv: requestBody.brcv,
        bactivo: requestBody.bactivo,
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        cusuario: requestBody.cusuario,
        cmoneda: requestBody.cmoneda,
        ptasa_casco: requestBody.ptasa_casco ? requestBody.ptasa_casco: 0,
        ptasa_catastrofico: requestBody.ptasa_catastrofico ? requestBody.ptasa_catastrofico: 0,
        msuma_recuperacion: requestBody.msuma_recuperacion ? requestBody.msuma_recuperacion: 0,
        mprima_recuperacion: requestBody.mprima_recuperacion ? requestBody.mprima_recuperacion: 0,
        mdeducible: requestBody.mdeducible ? requestBody.mdeducible: 0,
    }
    //Busca código del plan
    let searchCodePlan = await bd.searchCodePlanQuery().then((res) => res);
    if(searchCodePlan.error){return { status: false, code: 500, message: searchCodePlan.error }; }
    if(searchCodePlan.result.rowsAffected > 0){ 

        //Crea el plan
        let cplan = searchCodePlan.result.recordset[0].CPLAN + 1;
        let apovList = [];

        let createPlan = await bd.createPlanQuery(dataList, cplan).then((res) => res);
        if(createPlan.error){console.log(createPlan.error); return { status: false, code: 500, message: createPlan.error }; }
        if(createPlan.result.rowsAffected > 0){  
            if(requestBody.servicesType){
                //Crea los tipos de servicios del plan
                let serviceTypeList = [];
                for(let i = 0; i < requestBody.servicesType.length; i++){
                    serviceTypeList.push({
                        ctiposervicio: requestBody.servicesType[i].ctiposervicio,
                        baceptado: requestBody.servicesType[i].baceptado,
                    })
                }
                let createTypeService = await bd.createServiceTypeFromPlanQuery(serviceTypeList, dataList, cplan).then((res) => res);
                if(createTypeService.error){ console.log(createTypeService.error);return  { status: false, code: 500, message: createTypeService.error }; }
            }
            if(requestBody.quantity){
                //Crea la cantidad de servicios que presta.
                let quantityList = [];
                for(let i = 0; i < requestBody.quantity.length; i++){
                    quantityList.push({
                        ncantidad: requestBody.quantity[i].ncantidad,
                        pservicio: requestBody.quantity[i].pservicio,
                        mmaximocobertura: requestBody.quantity[i].mmaximocobertura,
                        mdeducible: requestBody.quantity[i].mdeducible,
                        cservicio: requestBody.quantity[i].cservicio,
                        baceptado: requestBody.quantity[i].baceptado,
                    })
                }
                let updateServiceFromQuantity = await bd.updateServiceFromQuantityQuery(quantityList, cplan).then((res) => res);
                if(updateServiceFromQuantity.error){ console.log(updateServiceFromQuantity.error);return  { status: false, code: 500, message: updateServiceFromQuantity.error }; }
                if(updateServiceFromQuantity.result.rowsAffected > 0){
                    let searchPlanService = await bd.searchPlanServiceQuery(cplan).then((res) => res);
                    if(searchPlanService.error){ console.log(searchPlanService.error);return  { status: false, code: 500, message: searchPlanService.error }; }
                    if(searchPlanService.result.rowsAffected > 0){
                        let baceptado = 0;
                        let updateAceptepService = await bd.updateAceptepServiceQuery(baceptado, cplan).then((res) => res);
                        if(updateAceptepService.error){ console.log(updateAceptepService.error);return  { status: false, code: 500, message: updateAceptepService.error }; }
                    }
                }
            }
            let searchLastPlan = await bd.searchLastPlanQuery().then((res) => res);
            if(searchLastPlan.error){ console.log(searchLastPlan.error);return  { status: false, code: 500, message: searchLastPlan.error }; }
            if(createPlan.result.rowsAffected > 0){return {status: true, cplan: searchLastPlan.result.recordset[0].CPLAN, list: apovList}}
        }
        else{ return { status: false, code: 500, message: 'Server Internal Error.', hint: 'createPlan' }; }
    }

}

router.route('/create-plan-rcv').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
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
    let dataList =  {
        cservicio_aseg: requestBody.cservicio_aseg,
        ctiposervicio: requestBody.ctiposervicio,
        ctipoagotamientoservicio: requestBody.ctipoagotamientoservicio,
        ncantidad: requestBody.ncantidad,
        pservicio: requestBody.pservicio,
        mmaximocobertura: requestBody.mmaximocobertura,
        mdeducible: requestBody.mdeducible,
        bserviciopadre: requestBody.bserviciopadre,
        bactivo: requestBody.bactivo,
        cusuario: requestBody.cusuario
    }
    //Busca código del plan
    let searchPlan = await bd.searchLastPlanQuery().then((res) => res);
    if(searchPlan.error){return { status: false, code: 500, message: searchPlan.error }; }
    if(searchPlan.result.rowsAffected > 0){ 

        let plan = {
            cplan: searchPlan.result.recordset[0].CPLAN,
            xplan: searchPlan.result.recordset[0].XPLAN
        }

        //crea el plan en POSERVICIOPLAN_RC
        let createServicePlanRcv = await bd.createServicePlanRcvQuery(dataList, plan).then((res) => res);
        if(createServicePlanRcv.error){return { status: false, code: 500, message: createServicePlanRcv.error }; }
        if(createServicePlanRcv.result.rowsAffected > 0){  
            //crea el plan en PRPLAN_RC
            if(requestBody.rcv){
                let rcv = requestBody.rcv
                let createPlanRcv = await bd.createPlanRcvQuery(dataList, rcv, plan).then((res) => res);
                if(createPlanRcv.error){ return  { status: false, code: 500, message: createPlanRcv.error }; }
            }
        }
        if(createPlanRcv.result.rowsAffected > 0){return {status: true}}
        else{ return { status: false, code: 500, message: 'Server Internal Error.', hint: 'createPlan' }; }
    }

}
router.route('/store-procedure').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationStoreProcedure(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationStoreProcedure' } });
        });
    }
});

const operationStoreProcedure = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData =  {
        cplan: requestBody.cplan,
        cmoneda: requestBody.cmoneda
    }

    let searchApov = await bd.searchApovQuery(searchData).then((res) => res);
    if(searchApov.error){ return  { status: false, code: 500, message: searchApov.error }; }
    let apovList = [];
    if(searchApov.result.rowsAffected > 0){
        for(let i = 0; i < searchApov.result.recordset.length; i++){
            apovList.push({
                    cplan: searchApov.result.recordset[i].CPLAN,
                    ccobertura: searchApov.result.recordset[i].CCOBERTURA,
                    xcobertura: searchApov.result.recordset[i].XCOBERTURA,
                    msuma_aseg: searchApov.result.recordset[i].MSUMA_ASEG,
                    ptasa_par_rus: searchApov.result.recordset[i].PTASA_PAR_RUS,
                    mprima_par_rus: searchApov.result.recordset[i].MPRIMA_PAR_RUS,
                    ptasa_carga: searchApov.result.recordset[i].PTASA_CARGA,
                    mprima_carga: searchApov.result.recordset[i].MPRIMA_CARGA
            })
        }
    }

    let searchExceso = await bd.searchExcesoQuery(searchData).then((res) => res);
    if(searchExceso.error){ return  { status: false, code: 500, message: searchExceso.error }; }
    let excesoList = [];
    if(searchExceso.result.rowsAffected > 0){
        for(let i = 0; i < searchExceso.result.recordset.length; i++){
            excesoList.push({
                    cplan: searchExceso.result.recordset[i].CPLAN,
                    ctarifa: searchExceso.result.recordset[i].CTARIFA,
                    xtipo: searchExceso.result.recordset[i].XTIPO,
                    cmoneda: searchExceso.result.recordset[i].CMONEDA,
                    ms_defensa_penal: searchExceso.result.recordset[i].MS_DEFENSA_PENAL,
                    mp_defensa_penal: searchExceso.result.recordset[i].MP_DEFENSA_PENAL,
                    ms_exceso_limite: searchExceso.result.recordset[i].MS_EXCESO_LIMITE,
                    mp_exceso_limite: searchExceso.result.recordset[i].MP_EXCESO_LIMITE
            })
        }
    }
    return { status: true, apov: apovList, exceso: excesoList};
}

router.route('/update').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationUpdatePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationUpdatePlan' } });
        });
    }
});

const operationUpdatePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataList =  {
        cplan: requestBody.cplan,
        ctipoplan: requestBody.ctipoplan,
        xplan: requestBody.xplan,
        mcosto: requestBody.mcosto,
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        cusuario: requestBody.cusuario,
        cmoneda: requestBody.cmoneda,
        bactivo: requestBody.bactivo,
    }
    let updatePlan = await bd.updatePlanQuery(dataList).then((res) => res);
    if(updatePlan.error){return { status: false, code: 500, message: updatePlan.error }; }
    if(requestBody.quantity){
        let updateQuatityList = [];
        for(let i = 0; i < requestBody.quantity.length; i++){  
            updateQuatityList.push({
                ncantidad: requestBody.quantity[i].ncantidad,
                cservicio: requestBody.quantity[i].cservicio,
                pservicio: requestBody.quantity[i].pservicio,
                mmaximocobertura: requestBody.quantity[i].mmaximocobertura,
                mdeducible: requestBody.quantity[i].mdeducible,
            })
        }
        let updateQuatityFromPlan = await bd.updateQuatityFromPlanQuery(updateQuatityList, dataList).then((res) => res);
        if(updateQuatityFromPlan.error){return { status: false, code: 500, message: updateQuatityFromPlan.error }; }
    }

    return{status: true, cplan: dataList.cplan}
}

router.route('/search-type-service-selected').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchTypeServicePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchTypeServicePlan' } });
        });
    }
});

const operationSearchTypeServicePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cplan: requestBody.cplan,
        baceptado: requestBody.baceptado
    };
    let searchTypeServicePlan = await bd.searchTypeServicePlanQuery(searchData).then((res) => res);
    if(searchTypeServicePlan.error){ return  { status: false, code: 500, message: searchTypeServicePlan.error }; }
    if(searchTypeServicePlan.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchTypeServicePlan.result.recordset.length; i++){
        jsonList.push({
            ctiposervicio: searchTypeServicePlan.result.recordset[i].CTIPOSERVICIO,
            xtiposervicio: searchTypeServicePlan.result.recordset[i].XTIPOSERVICIO,
        });
    }
    return { status: true, list: jsonList };
}

router.route('/search-service-selected').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchServicePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchServicePlan' } });
        });
    }
});

const operationSearchServicePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cplan: requestBody.cplan,
        baceptado: requestBody.baceptado
    };
    let searchServicePlan = await bd.searchServicePlanQuery(searchData).then((res) => res);
    if(searchServicePlan.error){ return  { status: false, code: 500, message: searchServicePlan.error }; }
    if(searchServicePlan.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchServicePlan.result.recordset.length; i++){
        jsonList.push({
            cservicio: searchServicePlan.result.recordset[i].CSERVICIO,
            xservicio: searchServicePlan.result.recordset[i].XSERVICIO,
            ncantidad: searchServicePlan.result.recordset[i].NCANTIDAD,
        });
    }
    return { status: true, list: jsonList };
}

router.route('/search-type-service-selected-rcv').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchTypeServicePlanRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchTypeServicePlanRcv' } });
        });
    }
});

const operationSearchTypeServicePlanRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cplan_rc: requestBody.cplan_rc,
        baceptado: requestBody.baceptado
    };
    let searchTypeServicePlan = await bd.searchTypeServicePlanRcvQuery(searchData).then((res) => res);
    if(searchTypeServicePlan.error){ return  { status: false, code: 500, message: searchTypeServicePlan.error }; }
    if(searchTypeServicePlan.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchTypeServicePlan.result.recordset.length; i++){
        jsonList.push({
            ctiposervicio: searchTypeServicePlan.result.recordset[i].CTIPOSERVICIO,
            xtiposervicio: searchTypeServicePlan.result.recordset[i].XTIPOSERVICIO,
        });
    }
    return { status: true, list: jsonList };
}

router.route('/search-service-selected-rcv').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchServicePlanRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchServicePlanRcv' } });
        });
    }
});

const operationSearchServicePlanRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cplan_rc: requestBody.cplan_rc,
        baceptado: requestBody.baceptado
    };
    console.log(searchData)
    let searchServicePlan = await bd.searchServicePlanRcvQuery(searchData).then((res) => res);
    if(searchServicePlan.error){ return  { status: false, code: 500, message: searchServicePlan.error }; }
    if(searchServicePlan.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchServicePlan.result.recordset.length; i++){
        jsonList.push({
            cservicio: searchServicePlan.result.recordset[i].CSERVICIO,
            xservicio: searchServicePlan.result.recordset[i].XSERVICIO,
            ncantidad: searchServicePlan.result.recordset[i].NCANTIDAD,
        });
    }
    return { status: true, list: jsonList };
}

router.route('/search-quantity').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchQuantity(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchQuantity' } });
        });
    }
});

const operationSearchQuantity = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cplan: requestBody.cplan,
        cservicio: requestBody.cservicio
    };
    let searchQuantityPlan = await bd.searchQuantityPlanQuery(searchData).then((res) => res);
    if(searchQuantityPlan.error){ return  { status: false, code: 500, message: searchServicePlan.error }; }
    if(searchQuantityPlan.result.rowsAffected > 0){ 
        return { 
            status: true, 
            ncantidad: searchQuantityPlan.result.recordset[0].NCANTIDAD,
            pservicio: searchQuantityPlan.result.recordset[0].PSERVICIO, 
            mmaximocobertura: searchQuantityPlan.result.recordset[0].MMAXIMOCOBERTURA, 
            mdeducible: searchQuantityPlan.result.recordset[0].MDEDUCIBLE,  
            cplan: searchQuantityPlan.result.recordset[0].CPLAN, 
            cservicio: searchQuantityPlan.result.recordset[0].CSERVICIO,  
        };
    }
}

router.route('/search-quantity-rcv').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchQuantityRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchQuantityRcv' } });
        });
    }
});

const operationSearchQuantityRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cplan_rc: requestBody.cplan_rc,
        cservicio: requestBody.cservicio
    };
    let searchQuantityPlan = await bd.searchQuantityPlanRcvQuery(searchData).then((res) => res);
    if(searchQuantityPlan.error){ return  { status: false, code: 500, message: searchServicePlan.error }; }
    if(searchQuantityPlan.result.rowsAffected > 0){ 
        return { 
            status: true, 
            ncantidad: searchQuantityPlan.result.recordset[0].NCANTIDAD,
            pservicio: searchQuantityPlan.result.recordset[0].PSERVICIO, 
            mmaximocobertura: searchQuantityPlan.result.recordset[0].MMAXIMOCOBERTURA, 
            mdeducible: searchQuantityPlan.result.recordset[0].MDEDUCIBLE,  
            cplan_rc: searchQuantityPlan.result.recordset[0].CPLAN_RC, 
            cservicio: searchQuantityPlan.result.recordset[0].CSERVICIO,  
        };
    }
}

module.exports = router;