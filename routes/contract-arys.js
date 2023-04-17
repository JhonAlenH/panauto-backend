const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

function changeDateFormat (date) {
    let dateArray = date.toISOString().substring(0,10).split("-");
    return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
  }

router.route('/service-type-plan').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationServiceTypePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationServiceTypePlan' } });
        });
    }
});

const operationServiceTypePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    //if(!helper.validateRequestObj(requestBody, ['cpais', 'ccompania', 'ctiposervicio'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let cplan = requestBody.cplan

    let getServiceTypePlan = await bd.getServiceTypePlanQuery(cplan).then((res) => res);
    if(getServiceTypePlan.error){ return { status: false, code: 500, message: getServiceTypePlan.error }; }
    let jsonArray = [];
    for(let i = 0; i < getServiceTypePlan.result.recordset.length; i++){
        jsonArray.push({ ctiposervicio: getServiceTypePlan.result.recordset[i].CTIPOSERVICIO, 
                         xtiposervicio: getServiceTypePlan.result.recordset[i].XTIPOSERVICIO, 
                       });
    }
    return { status: true, list: jsonArray }
}

router.route('/create').post((req, res) => {
    operationCreate(req.header('Authorization'), req.body).then((result) => {
        if(!result.status){
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        console.log(err.message)
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreate' } });
    });
});

const operationCreate = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    
    let userData = {
        xnombre: requestBody.xnombre.toUpperCase(),
        xapellido: requestBody.xapellido.toUpperCase(),
        cano: requestBody.cano ? requestBody.cano : undefined,
        xcolor: requestBody.xcolor ? requestBody.xcolor : undefined,
        cmarca: requestBody.cmarca ? requestBody.cmarca : undefined,
        cmodelo: requestBody.cmodelo ? requestBody.cmodelo : undefined,
        cversion: requestBody.cversion ? requestBody.cversion : undefined,
        xrif_cliente: requestBody.xrif_cliente ? requestBody.xrif_cliente : undefined,
        email: requestBody.email ? requestBody.email : undefined,
        xtelefono_prop: requestBody.xtelefono_prop ? requestBody.xtelefono_prop : undefined,
        xdireccionfiscal: requestBody.xdireccionfiscal.toUpperCase(),
        xserialmotor: requestBody.xserialmotor.toUpperCase(),
        xserialcarroceria: requestBody.xserialcarroceria.toUpperCase(),
        xplaca: requestBody.xplaca.toUpperCase(),
        xtelefono_emp: requestBody.xtelefono_emp,
        cplan: requestBody.cplan,
        xcedula:requestBody.xcedula,
        ncapacidad_p: requestBody.ncapacidad_p,
        cestado: requestBody.cestado ? requestBody.cestado : undefined,
        cciudad: requestBody.cciudad ? requestBody.cciudad : undefined,
        ccorregimiento: requestBody.ccorregimiento ? requestBody.ccorregimiento : undefined,
        cpais: requestBody.cpais ? requestBody.cpais : undefined,
        icedula: requestBody.icedula ? requestBody.icedula : undefined,
        femision: requestBody.femision ,
        cusuario: requestBody.cusuario ? requestBody.cusuario : undefined,
        xzona_postal: requestBody.xzona_postal ? requestBody.xzona_postal : undefined,
        cuso: requestBody.cuso,
        ctipovehiculo: requestBody.ctipovehiculo,
        cclase: requestBody.cclase,
        fdesde_pol: requestBody.fdesde_pol,
        fhasta_pol: requestBody.fhasta_pol,
        ccorredor: requestBody.ccorredor,
        cestatusgeneral: 13,
        fnac: requestBody.fnac
    };
    console.log(userData)
    if(userData){
        let createContractServiceArys = await bd.createContractServiceArysQuery(userData).then((res) => res);
        if(createContractServiceArys.error){ return { status: false, code: 500, message: createContractServiceArys.error }; }
    }
    // let lastQuote = await bd.getLastQuoteQuery();
    // if(lastQuote.error){ return { status: false, code: 500, message: lastQuote.error }; }
    return { 
        status: true, 
        code: 200, 
        // xnombre: lastQuote.result.recordset[0].XNOMBRE, 
        // xapellido: lastQuote.result.recordset[0].XAPELLIDO, 
        // icedula: lastQuote.result.recordset[0].ICEDULA, 
        // xcedula: lastQuote.result.recordset[0].XCEDULA, 
        // xserialcarroceria: lastQuote.result.recordset[0].XSERIALCARROCERIA, 
        // xserialmotor: lastQuote.result.recordset[0].XSERIALMOTOR, 
        // xplaca: lastQuote.result.recordset[0].XPLACA, 
        // xmarca: lastQuote.result.recordset[0].XMARCA, 
        // xmodelo: lastQuote.result.recordset[0].XMODELO, 
        // xversion: lastQuote.result.recordset[0].XVERISON, 
        // cano: lastQuote.result.recordset[0].CANO, 
        // xestatusgeneral: lastQuote.result.recordset[0].XESTATUSGENERAL, 
        // xtipovehiculo: lastQuote.result.recordset[0].XTIPOVEHICULO, 
        // xuso: lastQuote.result.recordset[0].XUSO, 
        // xclase: lastQuote.result.recordset[0].XCLASE, 
        // xtomador: lastQuote.result.recordset[0].XTOMADOR, 
        // xprofesion: lastQuote.result.recordset[0].XPROFESION, 
        // xrif: lastQuote.result.recordset[0].XRIF, 
    };
}

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationDetailContractArys(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message);
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailContractArys' } });
        });
    }
});

const operationDetailContractArys = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        id: requestBody.id
    };
    let searchontractArysDetail = await bd.searchCorporativeIssuanceDetail(searchData).then((res) => res);
    if(searchontractArysDetail.error){ return  { status: false, code: 500, message: searchontractArysDetail.error }; }
    if(searchontractArysDetail.result.rowsAffected < 1){ return { status: false, code: 404, message: 'Corporative Issuance not found.' }; }
    if(searchontractArysDetail.result.rowsAffected != 0){
        planList = []
        for(let i = 0; i < searchontractArysDetail.result.recordset.length; i++){
            planList.push({
                xtiposervicio: searchontractArysDetail.result.recordset[i].XTIPOSERVICIO
            })
        }
    }
    return {
        status: true,
        id: searchCorporativeIssuanceDetail.result.recordset[0].ID,
        ccarga: searchCorporativeIssuanceDetail.result.recordset[0].CCARGA,
        clote: searchCorporativeIssuanceDetail.result.recordset[0].CLOTE,
        xpoliza: searchCorporativeIssuanceDetail.result.recordset[0].XPOLIZA,
        xcertificado: searchCorporativeIssuanceDetail.result.recordset[0].XCERTIFICADO,
        fcarga: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FCARGA),
        xcliente: searchCorporativeIssuanceDetail.result.recordset[0].XCLIENTE,
        xdocidentidadcliente: searchCorporativeIssuanceDetail.result.recordset[0].XDOCIDENTIDADCLIENTE,
        xemailcliente: searchCorporativeIssuanceDetail.result.recordset[0].XEMAILCLIENTE,
        xpropietario: searchCorporativeIssuanceDetail.result.recordset[0].XPROPIETARIO,
        xdocidentidadpropietario: searchCorporativeIssuanceDetail.result.recordset[0].XDOCIDENTIDADPROPIETARIO,
        xemailpropietario: searchCorporativeIssuanceDetail.result.recordset[0].XEMAILPROPIETARIO,
        xmarca: searchCorporativeIssuanceDetail.result.recordset[0].XMARCA,
        xmodelo: searchCorporativeIssuanceDetail.result.recordset[0].XMODELO,
        xversion: searchCorporativeIssuanceDetail.result.recordset[0].XVERSION,
        cano: searchCorporativeIssuanceDetail.result.recordset[0].CANO,
        xtipo: searchCorporativeIssuanceDetail.result.recordset[0].XTIPO,
        xclase: searchCorporativeIssuanceDetail.result.recordset[0].XCLASE,
        xserialcarroceria: searchCorporativeIssuanceDetail.result.recordset[0].XSERIALCARROCERIA,
        xserialmotor: searchCorporativeIssuanceDetail.result.recordset[0].XSERIALMOTOR,
        xcolor: searchCorporativeIssuanceDetail.result.recordset[0].XCOLOR,
        ncapacidadpasajeros: searchCorporativeIssuanceDetail.result.recordset[0].NCAPACIDADPASAJEROS,
        xplaca: searchCorporativeIssuanceDetail.result.recordset[0].XPLACA,
        fdesde_pol: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FDESDE_POL),
        fhasta_pol: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FHASTA_POL)
    }
}

router.route('/search-contract-arys').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchContractArys(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchContractArys' } });
        });
    }
});

const operationSearchContractArys = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    //if(!helper.validateRequestObj(requestBody, ['cpais', 'ccompania', 'ctiposervicio'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let contractArysList = [];
    let searchContractArys = await bd.searchContractArysQuery().then((res) => res);
    if(searchContractArys.error){ console.log(searchContractArys.error);return { status: false, code: 500, message: searchContractArys.error }; }
    if(searchContractArys.result.rowsAffected != 0){
        for(let i = 0; i < searchContractArys.result.recordset.length; i++){
            let xnombres = searchContractArys.result.recordset[i].XNOMBRE + ' ' + searchContractArys.result.recordset[i].XAPELLIDO
            let xvehiculo = searchContractArys.result.recordset[i].XMARCA + ' ' + searchContractArys.result.recordset[i].XMODELO + ' ' + searchContractArys.result.recordset[i].XVERSION
            let xidentificacion = searchContractArys.result.recordset[i].ICEDULA + ' ' + searchContractArys.result.recordset[i].XDOCIDENTIDAD
            let xestadocontrato;
            if(searchContractArys.result.recordset[i].CCAUSAANULACION){
                xestadocontrato = 'Anulado'
            }else{
                xestadocontrato = 'Vigente'
            }
            contractArysList.push({ 
                xnombres: xnombres, 
                xvehiculo: xvehiculo, 
                fano: searchContractArys.result.recordset[i].CANO, 
                identificacion: xidentificacion,
                ccontratoflota: searchContractArys.result.recordset[i].CCONTRATOFLOTA,
                xplaca: searchContractArys.result.recordset[i].XPLACA,
                xestadocontrato: xestadocontrato
            });
        }
    }
    return { status: true, list: contractArysList }
}

router.route('/detail-contract-arys').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationDetailAdministrationContractArys(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailAdministrationContractArys' } });
        });
    }
});

const operationDetailAdministrationContractArys = async(authHeader, requestBody) => { 
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    //if(!helper.validateRequestObj(requestBody, ['cpais', 'ccompania', 'ccontratoflota'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let contractData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        ccontratoflota: requestBody.ccontratoflota
    };
    let getContractArysData = await bd.getContractArysDataQuery(contractData).then((res) => res);
    if(getContractArysData.error){ return { status: false, code: 500, message: getContractArysData.error }; }
    if(getContractArysData.result.rowsAffected > 0){

        let getContractArysOwnerData = await bd.getContractArysOwnerDataQuery(contractData, getContractArysData.result.recordset[0].CPROPIETARIO).then((res) => res);
        if(getContractArysOwnerData.error){ return { status: false, code: 500, message: getContractArysOwnerData.error }; }
        let telefonopropietario;
        if(getContractArysOwnerData.result.recordset[0].XTELEFONOCELULAR){
            telefonopropietario = getContractArysOwnerData.result.recordset[0].XTELEFONOCELULAR;
        }else{
            telefonopropietario = getContractArysOwnerData.result.recordset[0].XTELEFONOCASA
        }
        if(getContractArysOwnerData.result.rowsAffected < 0){ return { status: false, code: 404, message: 'Fleet Contract Owner not found.' }; }
 
        let getContractArysClientData = await bd.getContractClientDataQuery(getContractArysData.result.recordset[0].CCLIENTE);

        let getPlan = await bd.getPlanData(getContractArysData.result.recordset[0].CPLAN);
        if(getPlan.error){ return { status: false, code: 500, message: getPlan.error }; }

        if(getPlan.result.rowsAffected < 0){ return { status: false, code: 404, message: 'Fleet Contract Plan not found.' }; }

        let serviceList = [];
        let getServiceFromPlan = await bd.getServiceFromPlanQuery(getContractArysData.result.recordset[0].CPLAN);
        if(getServiceFromPlan.error){ return { status: false, code: 500, message: getServiceFromPlan.error }; }

        if(getServiceFromPlan.result.rowsAffected < 0){ return { status: false, code: 404, message: 'Fleet Contract Plan not found.' }; }
        if(getServiceFromPlan.result.recordset != 0){
            for(let i = 0; i < getServiceFromPlan.result.recordset.length; i++){
                serviceList.push({
                    cservicio: getServiceFromPlan.result.recordset[i].CSERVICIO,
                    xservicio: getServiceFromPlan.result.recordset[i].XSERVICIO,
                })
            }
        }
        return {
            status: true,
            ccarga: getContractArysData.result.recordset[0].ccarga,
            ccontratoflota: getContractArysData.result.recordset[0].CCONTRATOFLOTA,
            xrecibo: getContractArysData.result.recordset[0].xrecibo,
            xpoliza: getContractArysData.result.recordset[0].xpoliza,
            xtituloreporte: getContractArysData.result.recordset[0].XTITULO_REPORTE,
            xtransmision: getContractArysData.result.recordset[0].XTRANSMISION,
            xanexo: getContractArysData.result.recordset[0].XANEXO,
            xobservaciones: getContractArysData.result.recordset[0].XOBSERVACIONES,
            xdocidentidadrepresentantelegal: getContractArysData.result.recordset[0].XDOCIDENTIDAD,
            xnombrerepresentantelegal: getContractArysData.result.recordset[0].XREPRESENTANTELEGAL,
            ccliente: getContractArysData.result.recordset[0].CCLIENTE,
            xnombrecliente: getContractArysClientData.result.recordset[0].XCLIENTE,
            xdocidentidadcliente: getContractArysClientData.result.recordset[0].XDOCIDENTIDAD,
            xdireccionfiscalcliente: getContractArysClientData.result.recordset[0].XDIRECCIONFISCAL,
            xtelefonocliente:getContractArysClientData.result.recordset[0].XTELEFONO,
            xemailcliente: getContractArysClientData.result.recordset[0].XEMAIL,
            xrepresentantecliente: getContractArysClientData.result.recordset[0].XREPRESENTANTE,
            xestadocliente: getContractArysClientData.result.recordset[0].XESTADO,
            xciudadcliente: getContractArysClientData.result.recordset[0].XCIUDAD,
            casociado:  getContractArysData.result.recordset[0].CASOCIADO,
            xcertificadogestion: '',//`${getContractArysData.result.recordset[0].CCLIENTE}-${searchQuoteByFleet.result.recordset[0].CCOTIZADORFLOTA}-${getContractArysData.result.recordset[0].CCONTRATOFLOTA}`,
            xcertificadoasociado: getContractArysData.result.recordset[0].XCERTIFICADOASOCIADO,
            xsucursalemision: getContractArysData.result.recordset[0].XSUCURSALEMISION,
            xsucursalsuscriptora: getContractArysData.result.recordset[0].XSUCURSALSUSCRIPTORA,
            cagrupador: getContractArysData.result.recordset[0].CAGRUPADOR,
            fsuscripcion: getContractArysData.result.recordset[0].FCREACION,
            // fdesde: getPlan.result.recordset[0].FDESDE,
            mtotal_plan: getPlan.result.recordset[0].MCOSTO.toFixed(2),
            cplan: getPlan.result.recordset[0].CPLAN,
            finiciorecibo: getContractArysData.result.recordset[0].FDESDE_REC,
            fhastarecibo: getContractArysData.result.recordset[0].FHASTA_REC,
            femision: getContractArysData.result.recordset[0].FINICIO,
            cestatusgeneral: getContractArysData.result.recordset[0].CESTATUSGENERAL,
            xestatusgeneral: getContractArysData.result.recordset[0].XESTATUSGENERAL,
            ctrabajador: getContractArysData.result.recordset[0].CTRABAJADOR,
            cpropietario: getContractArysData.result.recordset[0].CPROPIETARIO,
            xnombrepropietario: getContractArysOwnerData.result.recordset[0].XNOMBRE,
            xtipodocidentidadpropietario: getContractArysOwnerData.result.recordset[0].XTIPODOCIDENTIDAD,
            xdocidentidadpropietario: getContractArysOwnerData.result.recordset[0].XDOCIDENTIDAD,
            xdireccionpropietario: getContractArysOwnerData.result.recordset[0].XDIRECCION,
            xtelefonocelularpropietario: telefonopropietario,
            xestadopropietario: getContractArysOwnerData.result.recordset[0].XESTADO,
            xciudadpropietario: getContractArysOwnerData.result.recordset[0].XCIUDAD,
            fnacimientopropietario: getContractArysOwnerData.result.recordset[0].FNACIMIENTO,
            xapellidopropietario: getContractArysOwnerData.result.recordset[0].XAPELLIDO,
            xocupacionpropietario: getContractArysOwnerData.result.recordset[0].XOCUPACION,
            xestadocivilpropietario: getContractArysOwnerData.result.recordset[0].XESTADOCIVIL,
            xemailpropietario: getContractArysOwnerData.result.recordset[0].XEMAIL,
            xsexopropietario: getContractArysOwnerData.result.recordset[0].XSEXO,
            xnacionalidadpropietario: getContractArysOwnerData.result.recordset[0].XNACIONALIDAD,
            xtelefonopropietario: getContractArysOwnerData.result.recordset[0].telefonopropietario,
            cvehiculopropietario: getContractArysData.result.recordset[0].CVEHICULOPROPIETARIO,
            ctipoplan: getContractArysData.result.recordset[0].CTIPOPLAN,
            cplan: getContractArysData.result.recordset[0].CPLAN,
            cmetodologiapago: getContractArysData.result.recordset[0].CMETODOLOGIAPAGO,
            ctiporecibo: getContractArysData.result.recordset[0].CTIPORECIBO,
            xmarca: getContractArysData.result.recordset[0].XMARCA,
            xmoneda: getContractArysData.result.recordset[0].xmoneda,
            xmodelo: getContractArysData.result.recordset[0].XMODELO,
            xversion: getContractArysData.result.recordset[0].XVERSION,
            xcolor: getContractArysData.result.recordset[0].XCOLOR,
            xplaca: getContractArysData.result.recordset[0].XPLACA,
            xuso: getContractArysData.result.recordset[0].XUSO,
            xtipovehiculo: getContractArysData.result.recordset[0].XTIPOVEHICULO,
            fano: getContractArysData.result.recordset[0].FANO,
            xserialcarroceria: getContractArysData.result.recordset[0].XSERIALCARROCERIA,
            xserialmotor: getContractArysData.result.recordset[0].XSERIALMOTOR,
            mpreciovehiculo: getContractArysData.result.recordset[0].MPRECIOVEHICULO,
            ctipovehiculo: getContractArysData.result.recordset[0].CTIPOVEHICULO,
            xtipomodelovehiculo: getContractArysData.result.recordset[0].XTIPOMODELO,
            ncapacidadcargavehiculo: getContractArysData.result.recordset[0].NCAPACIDADCARGA,
            ncapacidadpasajeros: getContractArysData.result.recordset[0].NPASAJERO,
            xtomador: getContractArysData.result.recordset[0].XTOMADOR,
            xprofesion: getContractArysData.result.recordset[0].XPROFESION,
            xrif: getContractArysData.result.recordset[0].XRIF,
            xdomicilio: getContractArysData.result.recordset[0].XDOMICILIO,
            xzona_postal: getContractArysData.result.recordset[0].XZONA_POSTAL,
            xtelefono: getContractArysData.result.recordset[0].XTELEFONO,
            xcorreo: getContractArysData.result.recordset[0].XCORREO,
            xestado: getContractArysData.result.recordset[0].XESTADO,
            xciudad: getContractArysData.result.recordset[0].XCIUDAD,
            xclase: getContractArysData.result.recordset[0].XCLASE,
            nkilometraje: getContractArysData.result.recordset[0].NKILOMETRAJE,
            xzona_postal_propietario: getContractArysData.result.recordset[0].XZONA_POSTAL_PROPIETARIO,
            services: serviceList
        }
    }else{ return { status: false, code: 404, message: 'Fleet Contract not found.' }; }
}

router.route('/password').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationPassword(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationPassword' } });
        });
    }
});

const operationPassword = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataPassword = await bd.dataPasswordQuery().then((res) => res);
    if(dataPassword.error){ return { status: false}; }
    console.log(dataPassword.result.recordset[0].XCLAVE_CLUB)
        return {    
                status: true, 
                xclave_club: dataPassword.result.recordset[0].XCLAVE_CLUB,
               };
}

router.route('/cancellation').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCancellation(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCancellation' } });
        });
    }
});

const operationCancellation = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let data = {
        ccontratoflota: requestBody.ccontratoflota,
        ccausaanulacion: requestBody.cancellationData.ccausaanulacion
    }
    let dataCancellation = await bd.dataCancellationQuery(data).then((res) => res);
    if(dataCancellation.error){ return { status: false}; }
    return { status: true};
}

module.exports = router;