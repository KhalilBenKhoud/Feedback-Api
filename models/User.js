const mongoose = require('mongoose') ;
const Schema = mongoose.Schema ;

const userSchema = new Schema({
    fullname : {
        type : String ,
        required : true 
    },
    username : {
        type : String ,
        required : true ,
        minLength : 6,
        maxLength : 25,
        unique : [true,'username is taken ! try another one !']
    },
    email : {
        type : String ,
        required : true ,
        unique : [true,'there is already an account with this email !'],
        validate : {
            validator : v => v.includes("@") && v.includes(".") ,
            message : props => `${props.value} is not a valid email`
        }
    },
    password : {
        type : String ,
        required : true ,
        validate : {
            validator : v => v.length > 2 ,
            message : props => 'password should contain at least 3 characters'
        }
    },
    role : {
        type : String ,
        enum : ['USER','ADMIN'],
        required : true
    },
    refreshTokenVersion : {
        type : Number ,
        default : 0 
    },
    resetToken : {
      token : String ,
      createdAt : Date
    },
    createdAt : {
        type : Date,
        default : Date.now() 
    } ,
    updatedAt : Date
})


userSchema.post('save', function(doc){
     doc.updatedAt = Date.now() ;
    
})

module.exports = mongoose.model('User',userSchema) ;