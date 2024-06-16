
const verifyRole = (role) => {
   return (req,res,next) => {
      if(!req?.role) return res.sendStatus(401) ;
      if(req.role !== role) return res.sendStatus(403) ;
      next() ;
   }
}

module.exports = verifyRole