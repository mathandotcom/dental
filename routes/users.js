var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Json data
router.get('/alluser', userController.allUser);


module.exports = router;
