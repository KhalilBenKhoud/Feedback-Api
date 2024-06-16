const express = require('express') ;
const testRouter = express.Router() ;
const testController = require('../controllers/test.controller') ;


testRouter.get('/test',testController.test) ;

module.exports = testRouter ;