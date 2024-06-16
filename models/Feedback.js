const mongoose = require('mongoose') ;
const Schema = mongoose.Schema ;

const feedbackSchema = new Schema({
    title : {
        type : String,
        required : true,
        unique : [true,'another user posted a feedback with this title, go check it or try another title'] 
    },
    description : {
        type : String,
        required : true 
    },
    category : {
        type : String,
        required : true ,
        enum : ['Enhancement','Feature','Bug','Other','UI/UX']
    },
    status : {
        type : String,
        required : true,
        enum : ['planned','in-progress','live','suggestion']
    },
    upvotes : {
         count : {
          type : Number,
          default : 0 
         },
         voters :  [
         {
            voter : {
            type : Schema.Types.ObjectId,
            ref : 'User'  
            }
        }
       ]
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
     comments : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Comment'
        }
     ],
    createdAt : {
        type : Date,
        default : Date.now() 
    },
    updatedAt : Date
})

feedbackSchema.post('save',function(doc) {
    doc.updatedAt = Date.now() ;
   
})


module.exports = mongoose.model('Feedback',feedbackSchema) ;