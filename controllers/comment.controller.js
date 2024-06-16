const Comment = require('../models/Comment') ;
const Feedback = require('../models/Feedback') ;

const addComment = async (req,res,next) => {
    try {
    const { content }  = req.body ;
    const parentFeedback = req.params?.feedback ;
    const author = req._id ;
    if(!parentFeedback) return res.sendStatus(404) ;
    if(!content) return res.status(400).json({message : 'enter content !'}) ;
    const comment = await Comment.create({
       content ,
       type : "comment",
       parentFeedback,
       author
    }) ;
    await Feedback.findByIdAndUpdate(
        parentFeedback,
        { $push: { comments: comment._id } },
        { new: true, useFindAndModify: false }
      );
    
     res.status(201).json({message : 'comment created'}) ;
   } catch(error) {
       next(error) ;
   }

} ;

const addReply = async(req,res,next) => {
   try {
    const { content }  = req.body ;
    const parentComment = req.params?.parentComment ;
    const author = req._id ;
    if(!parentComment) return res.sendStatus(404) ;
    if(!content) return res.status(400).json({message : 'enter content !'}) ;
    const reply = await Comment.create({
        content ,
        type : "reply",
        parentComment,
        author
     }) ;
     await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies : reply._id } },
        { new: true, useFindAndModify: false }
      );
      res.status(201).json({message : 'reply created'}) ;

   }catch(error) {
    next(error) ;
   }
} ;

const getComment = async(req,res,next) => {
    try {
     if(!req.params?.id) return res.sendStatus(404) ;
     const _id = req.params.id ;
     const comment = await Comment.findOne({_id}).populate("replies") ;
     res.status(200).json(comment) ;
    }catch(error) {
        next(error) ;
    }
}

const deleteComment = async (req,res,next) => {
    try {
        if(!req.params?.id) return res.sendStatus(404) ;
        const _id = req.params.id ;
        const comment = await Comment.findByIdAndDelete(_id).exec() ;
        await Feedback.findByIdAndUpdate(
             comment.parentFeedback,
            { $pull: { comments: comment._id } },
            { new: true, useFindAndModify: false }
          );
    
        res.status(200).json({message : 'comment deleted'}) ;
       }catch(error) {
           next(error) ;
       }
}

const deleteReply = async (req,res,next) => {
    try {
        if(!req.params?.id) return res.sendStatus(404) ;
        const _id = req.params.id ;
        const reply =  await  Comment.findByIdAndDelete(_id).exec() ;
        console.log(reply) ;
        await Comment.findByIdAndUpdate(
            reply.parentComment,
            {$pull : {replies : reply._id }},
            {new : true, useFindAndModify : false }
        ) ;
        res.status(200).json({message : 'reply deleted'}) ;
       }catch(error) {
           next(error) ;
       }
}



module.exports = { addComment , addReply , getComment , deleteComment , deleteReply }