const logger = require('../logger/logconfig');
const templateModel = require('../models/template');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');

// {
//     "requestToken": "serviceinfo",
//     "patientId": "9",
//     "templateId": "38",
//     "userId": 1
// }
//http://localhost:3000/api/v1/template/trigger
exports.triggerService = async (req, res, next) => {
    let patientId = req.body.patientId;
    let templateId = req.body.templateId;
    let userId = req.body.userId === undefined ? 1 : req.body.userId;

    try {
        var messageConfig = await templateModel.getAutoMailContent(patientId, templateId);

        if (messageConfig !== undefined && messageConfig !== null) {
            try {
                if (messageConfig.template.subcategory_name.toLowerCase() === 'text') {
                    console.log(messageConfig.template.subcategory_name.toLowerCase());
                    var result = await smsService.sendMessage(patientId, messageConfig.patient.cell, messageConfig.bodyContent, userId);
                    if (result.status === 'true') {
                        return res.status(200).json({ status: 'true', message: '', result: result.result });
                    }
                    else{
                        return res.status(200).json({ status: 'true', message: result.result, result: result.result });
                    }
                }
                else if (messageConfig.template.subcategory_name.toLowerCase() === 'email') {
                    console.log(messageConfig.template.subcategory_name.toLowerCase());
                    var result = await emailService.sendMail(messageConfig.patient, messageConfig.template, messageConfig.bodyContent);
                    if (result.status === 'true') {
                        return res.status(200).json({ status: 'true', message: '', result: result.result });
                    }
                    else {
                        return res.status(200).json({ status: 'false', message: result.message, result: result.result });
                    }
                }
            }
            catch (error) {
                return await res.status(422).json({ status: 'false', message: `${error.message}` });
            }
        }
        return res.status(422).json({ status: 'false', message: `Unable to parge message template for template id ${templateId}` });
    }
    catch (error) {
        logger.info(`error:  ${error.stack}`);
        return res.status(422).json({ status: 'false', message: `Unable to parge message template` });
    }
};

//http://localhost:3000/api/v1/comm/trigger/0206a31c-e032-44e6-98a1-7ac40abef233
exports.autoTriggerApi = async (req, res, next) => {

    try{
        var result = await sendCommunication(6, 36, 1);
        return res.status(200).json(result);
    }
    catch(error){
        logger.info(`error:  ${error.stack}`);
        return res.status(422).json({ status: 'false', message: `Unable to process ${error.message}` });
    }
};


//http://localhost:3000/api/v1/template/events
exports.retrieveEvents = async (req, res, next) => {
    let templateTypeId = req.body.templateTypeId;

    templateModel.retrieveEvents()
    .then(([response]) => {
        if(response.length > 0){
            return res.json({status: 'true', message: '', events: response});
        }
        else{
            return res.json({status: 'false', message: 'Yet to create event', events: []});
        }
    })
    .catch(err => {
        return res.status(401).json({status: 'false', message:"Unable to get event detail" + err.message});
    });
};

async function sendCommunication(patientId, templateId, userId){
    try {
        var messageConfig = await templateModel.getAutoMailContent(patientId, templateId);

        if (messageConfig !== undefined && messageConfig !== null) {
            try {
                if (messageConfig.template.subcategory_name.toLowerCase() === 'text') {
                    console.log(messageConfig.template.subcategory_name.toLowerCase());
                    var result = await smsService.sendMessage(patientId, messageConfig.patient.cell, messageConfig.bodyContent, userId);
                    if (result.status === 'true') {
                        return { status: 'true', message: '', result: result.result };
                    }
                    else{
                        return { status: 'false', message: result.result, result: result.result };
                    }
                }
                else if (messageConfig.template.subcategory_name.toLowerCase() === 'email') {
                    console.log(messageConfig.template.subcategory_name.toLowerCase());
                    var result = await emailService.sendMail(messageConfig.patient, messageConfig.template, messageConfig.bodyContent);
                    if (result.status === 'true') {
                        return { status: 'true', message: '', result: result.result };
                    }
                    else {
                        return { status: 'false', message: result.message, result: result.result };
                    }
                }
            }
            catch (error) {
                return { status: 'false', message: `${error.message}` };
            }
        }
        return { status: 'false', message: `Unable to parge message template for template id ${templateId}` };
    }
    catch (error) {
        logger.info(`error:  ${error.stack}`);
        return { status: 'false', message: `error: ${error.message}` };
    }
}
