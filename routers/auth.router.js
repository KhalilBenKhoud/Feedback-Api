const express = require('express') ;
const authRouter = express.Router() ;
const authController = require('../controllers/auth.controller') ;


authRouter.get('/test',authController.test) ;
authRouter.post('/register',authController.register) ;
authRouter.post('/authenticate',authController.authenticate) ;
authRouter.post('/refreshToken',authController.handleRefreshToken) ;
authRouter.post('/logout',authController.logout) ;
authRouter.post('/forgetPassword',authController.forgetPassword) ;
authRouter.post('/verifyToken',authController.verifyToken) ;
authRouter.post('/resetPassword',authController.resetPassword) ;



module.exports = authRouter ;