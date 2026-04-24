require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const {v4 : uuidv4} = require("uuid");
const User = require("../models/user");
const router = express.Router();
const {checkActiveSession, sessionErrorHandler, checkRememberToken, tokenErrorHandler} = require("../middlewares/auth");

const middlewares = [checkActiveSession, sessionErrorHandler, checkRememberToken, tokenErrorHandler];

router.get('/login', middlewares, async (req, res) => {
    if (req.session.user)
      return res.redirect("/api/user/dashboard");
    return res.render('login', {errorMsg : "", ename : ""});
})

router.post('/login', async (req, res)=>{
    try {
        const user = await User.authenticate(req.body);
        if (!user)
          return res.status(404).render('login', {errorMsg : "Incorrect credentials", ename : req.body.ename});
        req.session.user = user;
        if (req.body.remember){
          const duration = 30*24*60*60;
          const refreshToken = jwt.sign({ userId : user._id, jti : uuidv4()}, 
                                          process.env.JWT_SECRET,
                                        {expiresIn : duration});
          res.cookie('refresh_token', refreshToken, {
              secure: process.env.NODE_ENV === 'production',
              sameSate: process.env.NODE_ENV === 'production'? 'strict':'lax',
              httpOnly: true,
              maxAge : duration
          });
        }
        return res.redirect('/api/user/dashboard'); //we have to redirect because the route /dashboard has some middlewares
    }catch(error){
      return res.status(500).render('errors/500');
    }
});


router.get('/logout', middlewares, async (req, res) => {
  try{
    await User.disconnectUser(req.session.user._id);
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.clearCookie('refresh_token');
      return res.redirect('/');
    });
  }catch(error){
    return res.status(500).render("errors/500");
  }
});

module.exports = router;