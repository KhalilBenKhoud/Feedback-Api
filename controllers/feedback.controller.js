const Feedback = require('../models/Feedback') ;

const addFeedback = async (req,res,next) => {
     try {
       const {title, description , category , status } = req.body ;
       const author = req._id ;
       if(!title || !description || !category || !status) return res.status(400).json({message : 'fill all the fields !'}) ;
       const duplicate = await Feedback.findOne({title}).exec() ;
       if(duplicate) return res.status(409).json({message : 'another feedback with this title exists, choose another title'}) ;
       const created = await Feedback.create({
          title,
          description,
          category, 
          status,
          author
       }) ;
        res.status(201).json({message : 'feedback was created !'})
     }
     catch(error) {
        next(error) ;
     }
}

const allFeedbacks = async (req,res,next) => {
   try {
      const all = await Feedback.find() ;
      if(!all) res.sendStatus(204) ;
      else res.status(200).json({feedbacks : all}) ;
   }catch(error) {
      next(error)
   }
}

const getFeedback = async (req,res,next) => {
   try {
      if(!req.params?.id) return res.sendStatus(404) ;
      const _id = req.params.id ;
      const feedback = await Feedback.findOne({_id}).exec() ;
      if(!feedback) res.sendStatus(404) ;
      else res.status(200).json(feedback) ;
   }catch(error) {
      next(error)
   }
}

const editFeedback = async (req,res,next) => {
   try {
   if(!req.params?.id) return res.sendStatus(404) ;
   const _id = req.params.id ;
   const feedback = await Feedback.findOne({_id}).exec() ;
   if(!feedback) return res.sendStatus(404) ;
   const {title, description , category , status } = req.body ;
   if(title) {
      const duplicate = await Feedback.findOne({title}).exec() ;
      if(duplicate) return res.status(409).json({message : 'another feedback with this title exists, choose another title'}) ;
      else feedback.title = title ;
   }
   if(description) feedback.description = description ;
   if(category) feedback.category = category ;
   if(status) feedback.status = status ;
   await feedback.save() ;
   res.status(200).json({message : 'feedback updated successfully !'}) ;
   }catch(error) {
      next(error) ;
   }
}

const deleteFeedback = async (req,res,next) => {
   try {
      if(!req.params?.id) return res.sendStatus(404) ;
      const _id = req.params.id ;
      await Feedback.deleteOne({_id}).exec() ;
      res.status(200).json({message : 'feedback deleted successfully !'}) ;
   }catch(error) {
      next(error) ;
   }
}

const upvote = async(req,res,next) => {
   try {
      if(!req.params?.id) return res.sendStatus(404) ;
      const _id = req.params.id ;
      const voter = req._id ;
      const feedback = await Feedback.findOne({_id}).exec() ;
      if(!feedback) return res.sendStatus(404) ;
      if(feedback.upvotes.voters.some(vote => vote._id == voter )) return res.sendStatus(409) ;
      else {
         feedback.upvotes.voters.push(voter) ;
         feedback.upvotes.count = feedback.upvotes.count + 1 ;
         await feedback.save() ;
      }
      res.status(200).json({message : 'feedback upvoted'}) ;

   }catch(error) {
      next(error) ;
   }
}

const undoUpvote = async(req,res,next) => {
   try {
      if(!req.params?.id) return res.sendStatus(404) ;
      const _id = req.params.id ;
      const voter = req._id ;
      const feedback = await Feedback.findOne({_id}).exec() ;
      if(!feedback) return res.sendStatus(404) ;
      if(!feedback.upvotes.voters.some(vote => vote._id == voter )) return res.sendStatus(409) ;
      else {
         feedback.upvotes.voters = feedback.upvotes.voters.filter(vote => vote._id != voter) ;
         feedback.upvotes.count = feedback.upvotes.count - 1  ;
         await feedback.save() ;
      }
      res.status(200).json({message : 'upvote undone'}) ;

   }catch(error) {
      next(error) ;
   }
}

const sort = async (req,res,next) => {
   try {
      if(!req.params?.by || !req.params?.asc) return res.sendStatus(400) ;
      let by ;
      if(req.params.by == 'upvotes') {
         by = "upvotes.count" ;
      }
      else  if(req.params.by == 'comments') {
         by = "comments.length" ;
      }
      else {
         return res.sendStatus(400) ;
      }
      let asc = req.params.asc ;
      if(asc != 'least' && asc != 'most') return res.sendStatus(400) ;
      asc = asc == 'least' ? 1 : -1 ;

      const sortCriteria = {};
      sortCriteria[by] = asc;
      sortCriteria["title"] = 1;

      const sorted =  await  Feedback.find({status : "suggestion"}).sort(sortCriteria) ;
      return res.status(200).json({feedbacks : sorted})
   }
   catch(error) {
      next(error) ;
   }
}

const filter = async (req,res,next) => {
   try {
   if(!req.params?.category) return res.sendStatus(400) ;
   const category = req.params.category ;
   const filtered =  await  Feedback.find({category})  ;
   if(!filtered) res.status(204).json({feedbacks : filtered}) ;
   else res.status(200).json({feedbacks : filtered}) ;
   }
   catch(error) {
      next(error) ;
   }
}


module.exports = { addFeedback , allFeedbacks , getFeedback , editFeedback , deleteFeedback , upvote , undoUpvote , sort , filter}