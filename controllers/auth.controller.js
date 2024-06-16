const User = require('../models/User') ;
const bcrypt = require('bcrypt') ;
const jwt = require('jsonwebtoken') ;
const nodemailer = require('nodemailer');
const crypto = require('crypto');



const test = (req,res) => {
    res.status(200).json({message : 'test from auth works'}) ;
}

const register = async (req,res,next) => {
   
    const {fullname , username, email, password } = req.body ;
    if(!fullname || !username || !email || !password)
        return res.status(400).json({message : 'missing data, make sure to provide all required information !'}) ;
    const duplicate = await User.findOne({ $or : [{email : email},{username : username}]}).exec() ;
    if(duplicate) return res.status(409).json({messgae : 'email or username is already taken !'})
    try {
    const hashedPassword = await bcrypt.hash(password,10)
    const created = await User.create({
        fullname : fullname,
        username : username,
        email : email,
        password : hashedPassword,
        role : "USER"
      }) ;
      
      const accessToken = jwt.sign(
        {_id : created._id, role : created.role} ,
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : '10m'} 
    );
    const refreshToken = jwt.sign(
        {_id : created._id, refreshTokenVersion : created.refreshTokenVersion} ,
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : '7d'} 
    );
    res.cookie('jwt',refreshToken, {httpOnly : true, sameSite : 'None' , secure : true  , maxAge : 24 * 60 * 60 * 1000}) ;

     res.status(201).json({message: `user ${created.fullname} was registered` ,accessToken}) ;
   }
   catch(err) {
    next(err) ;
   }
}

const authenticate = async(req,res,next) => {
    try {
    const {username , password, email } = req.body ;
    if(!username && !email) return res.status(400).json({message : 'username or email is required to log in !'}) ;
    if(!password) return res.status(400).json({message : 'please type your password !'}) ;
    const foundUser = await User.findOne({ $or : [{email : email},{username : username}]}).exec() ;
    if(!foundUser) return res.status(401).json({message : 'invalid credentials !'}) ;
    const match = await bcrypt.compare(password,foundUser.password) ;
    if(match) {
        const accessToken = jwt.sign(
            {_id : foundUser._id, role : foundUser.role} ,
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn : '10m'} 
        );
        const refreshToken = jwt.sign(
            {_id : foundUser.username, refreshTokenVersion : foundUser.refreshTokenVersion} ,
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn : '7d'} 
        );
        res.cookie('jwt',refreshToken, {httpOnly : true, sameSite : 'None' , secure : true  , maxAge : 24 * 60 * 60 * 1000}) ;
        res.status(200).json({message : "you're logged in !" , accessToken})
    }
    else {
        res.status(401).json({message : 'invalid credentials !'}) ;
    }
   }catch(error) {
    next(error) ;
   }
}

const handleRefreshToken = async (req,res,next) => {
    try {
    const token = req.cookies?.jwt ;
    if(!jwt) return res.sendStatus(401) ;
    const payload = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
    ) ;
    const user = await User.findOne({_id : payload._id, refreshTokenVersion : payload.refreshTokenVersion}).exec() ;
    if(!user) {
         res.sendStatus(403) ;
    }
    else {
        //updating the token version
        user.refreshTokenVersion = user.refreshTokenVersion + 1 ;
        await user.save() ;
        
        // returning new access and refresh tokens
        const accessToken = jwt.sign(
            {_id : user._id, role : user.role} ,
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn : '10m'} 
        );
        const refreshToken = jwt.sign(
            {_id : user._id, refreshTokenVersion : user.refreshTokenVersion} ,
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn : '7d'} 
        );
        res.cookie('jwt',refreshToken, {httpOnly : true, sameSite : 'None' , secure : true  , maxAge : 24 * 60 * 60 * 1000}) ;
        res.status(200).json({message : "you got new tokens" , accessToken})

    }

    }catch(error) {
        next(error) ;
    }
}

const logout = async(req,res,next) => {
   try {
    const token = req.cookies?.jwt ;
    if(!token) return res.sendStatus(204) ;
    
    const payload = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
    ) ;
    const user = await User.findOne({_id : payload._id, refreshTokenVersion : payload.refreshTokenVersion}).exec() ;
     user.refreshTokenVersion = user.refreshTokenVersion + 1 ;
     await user.save() ;
     res.clearCookie('jwt', { httpOnly : true , sameSite : 'None' , secure : true  })
     res.sendStatus(204) ;
   }catch(error) {
      next(error) ;
   }
}

const forgetPassword = async (req,res,next) => {
    try {
      const {email} = req.body ;
      const found = await User.findOne({email}).exec() ;
      if(!found) return res.status(404).json({message : 'no user matches this email !'}) ;
      const token = crypto.randomBytes(6).toString('hex') ;
      console.log(token) ;
      found.resetToken.token = token ;
      found.resetToken.createdAt = Date.now() ;

      await found.save() ;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SENDER,
          pass: process.env.EMAIL_PASSWORD ,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: 'Password Reset',
        html: `<div style='box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px; padding: 20px; width : 50% ; margin : auto; background-color: whitesmoke ; '> 
        <h1 style='color : green ; text-align : center;'>Feedback in your service</h1>
        <p> your verification code to reset your password is <b style='color : midnightblue;'>${token}</b> (valid for 5 minutes). if you have not requested to reset your password, please ignore this email
        </p>
        </div>  
        `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error sending email');
        } else {
          console.log(`Email sent: ${info.response}`);
          res.status(200).json({ message : 'Check your email for instructions on resetting your password'});
        }
    });
  
    } catch(error) {
        next(error) ;
    }
}

const verifyToken = async (req,res,next) => {
    try {
    const {token} = req.body ;
    if(!token) return res.sendStatus(404) ;
   const found = await User.findOne({ 'resetToken.token' : token}).exec() ;
   if(!found || ( Date.now() - found.resetToken.createdAt) / 1000 / 60 > 5)
    res.status(409).json({message : 'token wrong or expired !'}) ;
   else res.status(200).json({message : 'proceed to changing your password !'}) ;
  }catch(error) {
    next(error) ;
  }
}

const resetPassword = async (req,res,next) => {
    try {
    const {token , newPassword} = req.body ;
    if(!token || !newPassword) return res.status(404).json({message : 'please enter a new password'}) ;
    const found = await User.findOne({ 'resetToken.token' : token}).exec() ;
    if(!found) return res.sendStatus(409) ;
    const hashed = await bcrypt.hash(newPassword,10) ;
    found.password = hashed ;
    await found.save() ;
    res.status(200).json({message : 'pasword changed successfully !'}) ;
    } catch(error) {
        next(error) ;
    }
 }
 

module.exports = {test , register , authenticate, handleRefreshToken , logout , forgetPassword , resetPassword , verifyToken } 