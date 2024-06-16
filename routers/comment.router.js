const express = require('express') ;
const commentRouter = express.Router() ;
const commentController = require('../controllers/comment.controller')

commentRouter.post('/:feedback',commentController.addComment) ;
commentRouter.post('/reply/:parentComment', commentController.addReply) ;
commentRouter.get('/:id', commentController.getComment) ;
commentRouter.delete('/:id',commentController.deleteComment) ;
commentRouter.delete('/reply/:id',commentController.deleteReply) ;


module.exports = commentRouter 