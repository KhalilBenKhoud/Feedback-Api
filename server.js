require('dotenv').config() ;
const express = require('express') ;
const cors = require('cors') ;
const corsOptions = require('./config/corsOptions')
const mongoose = require('mongoose') ;
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middlewares/errorHandler') ; 
const cookieParser = require('cookie-parser') ;
const credentials = require('./middlewares/credentials') ;

const PORT = process.env.PORT || 3500 ;
const app = express() ;

app.use(credentials) ;
app.use(cors(corsOptions)) ;


app.use(express.urlencoded({extended : false})) ;
app.use(express.json()) ;
app.use(cookieParser())

app.use('/api/v1',require('./routers/index')) ;



app.use(errorHandler) ;

connectDb() ;

mongoose.connection.once('open',  () => {
 
    app.listen(PORT,() => {console.log(`server listening on port ${PORT}`)})
})