const logEvents = require('./logEvents')

const errorHandler = (err,req,res,next) => {
    if(err) {
        logEvents(`${err.name} : ${err.message}`,'errLog.txt') ;
        console.log('from middleware : ',err.stack) ;
        res.status(500).json({message : err.message}) ;
    }
   
}

module.exports = errorHandler ;