const express = require('express') ;
const adminRouter = express.Router() ;
const adminController = require('../controllers/admin.controller') ;

adminRouter.get('/allUsers',adminController.getAllUsers) ;

module.exports = adminRouter 