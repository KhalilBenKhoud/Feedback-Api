const express = require('express') ;
const feedbackRouter = express.Router() ;
const feedbackController = require('../controllers/feedback.controller') ;


feedbackRouter.post('/',feedbackController.addFeedback) ;
feedbackRouter.get('/',feedbackController.allFeedbacks) ;
feedbackRouter.get('/sorted/:by/:asc',feedbackController.sort) ;
feedbackRouter.get('/filter/:category',feedbackController.filter) ;

feedbackRouter.get('/:id',feedbackController.getFeedback) ;
feedbackRouter.put('/:id',feedbackController.editFeedback) ;
feedbackRouter.delete('/:id',feedbackController.deleteFeedback) ;
feedbackRouter.put('/upvote/:id',feedbackController.upvote) ;
feedbackRouter.put('/undoUpvote/:id',feedbackController.undoUpvote) ;



module.exports = feedbackRouter