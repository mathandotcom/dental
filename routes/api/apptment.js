const  express = require('express');
const isAuth = require('../../middleware/is-auth');
const checkAuthenticated = require('../../middleware/userauth');

var router = express.Router();
const apptController = require('../../controller/appointmentController');

router.get('/appointment', isAuth, apptController.getAppointmentDetailsApi);
router.post('/appointmentbydate', isAuth, apptController.getAppointmentDetailsByDateApi);
router.post('/updateappointment', isAuth, apptController.setConfirmationRequestByAptnum);
router.get('/appointmentbydatesikka', isAuth, apptController.getAppointmentDetailsByDateSikkaApi);

router.get('/ls-appointment', checkAuthenticated, apptController.getAppointmentDetailsApi);
router.post('/ls-appointmentbydate', checkAuthenticated, apptController.getAppointmentDetailsByDateApi);

module.exports = router;
