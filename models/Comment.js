const mongoose = require('mongoose') ;
const Schema = mongoose.Schema ;

const commentSchema = Schema({
    content : {
        type : String,
        required : true
    },
    type : {
        type : String ,
        enum : ['comment','reply'],
        required : true 
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    parentFeedback : {
        type: Schema.Types.ObjectId,
        ref: 'Feedback',
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    }],
    createdAt : {
        type : Date,
        default : Date.now() 
    }
        
});

module.exports = mongoose.model('Comment',commentSchema) ;