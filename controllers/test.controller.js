

const test =  (req,res) => {
    
    res.status(200).json({message : `test works, you id is ${req._id} and your role is ${req.role}`}) ;
}

module.exports = {test} ;