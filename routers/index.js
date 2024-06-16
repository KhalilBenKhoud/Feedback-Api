const express = require('express') ;
const router = express.Router() ;
const testRouter = require('./test.router') ;
const authRouter = require('./auth.router') ;
const adminRouter = require('./admin.router') ;
const commentRouter = require('./comment.router')
const verifyJWT = require('../middlewares/verifyJWT') ;
const verifyRole = require('../middlewares/verifyRole') ;
const feedbackRouter = require('./feedback.router');

router.use('/auth',authRouter) ;

router.use(verifyJWT) ;

router.use('/admin',verifyRole("ADMIN"),adminRouter) ;

router.use(verifyRole("USER"))
router.use('/test',testRouter) ;
router.use('/feedback',feedbackRouter) ;
router.use('/comment',commentRouter) ;

router.all('*',(req,res) => {
    res.status(404).json({message : 'no route found'}) ;
})


module.exports = router ;
