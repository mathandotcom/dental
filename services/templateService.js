const logger = require('../logger/logconfig');
const templateModel = require('../models/template');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');

var templateService = class TemplateService{

    static async sendCommunication(patientId, templateId, userId){
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
                        if(messageConfig.patient.email === undefined || messageConfig.patient.email === '') {
                            logger.info(`Email id is missing for patient ${messageConfig.patient.patient_name} (${messageConfig.patient.patient_id})`);
                            return { status: 'false', message: `Email id is missing for patient ${messageConfig.patient.patient_name} (${messageConfig.patient.patient_id})`};
                        }
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
                    logger.error(error.stack);
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
}

module.exports = templateService;


