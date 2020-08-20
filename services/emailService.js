const logger = require('../logger/logconfig');
const mailer = require('../models/email');

const fromId = process.env.SENDGRID_FROM_ID;
const mailCc = process.env.EMAIL_CC_ADDRESS;
const mailBcc = '';

var emailService = class EmailService{
    
    constructor(){ }

    static async sendMail(patientInfo, templateInfo, parsedBody) {
        try {
            var mailModel = new mailer(fromId, patientInfo.email, mailCc, mailBcc, templateInfo.subject, parsedBody, parsedBody);
            return await mailModel.sendMailAsync().then(([result]) => {
                logger.info(result);
                try {
                    if (result.statusCode === 202) {
                        return { status: 'true', message: '', result: `Mail has been sent to ${patientInfo.email}` };
                    }
                    else {
                        return { status: 'false', message: result.statusMessage, result: `Failed to send mail to ${patientInfo.email}` };
                    }
                }
                catch (error) {
                    logger.error(`Send mail failure: ${error.stack}`);
                    throw error;
                }
            });
        }
        catch (error) {
            logger.error(`Send mail failure: ${error.stack}`);
            throw error;
        }
    }
}

module.exports = emailService;