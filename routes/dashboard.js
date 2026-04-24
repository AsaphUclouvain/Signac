const express = require("express");
const User = require("../models/user");
const router = express.Router();
const {checkActiveSession, sessionErrorHandler, checkRememberToken, tokenErrorHandler} = require("../middlewares/auth.js");
const avatarsGenerator = require("../utils/avatarsGenerator");

const middlewares = [checkActiveSession, sessionErrorHandler, checkRememberToken, tokenErrorHandler];

router.get('/dashboard', middlewares, async (req, res)=>{
  try{
    const user = await User.findById(req.session.user._id).populate('incidents').lean();
    const avatar = avatarsGenerator(req.session.user.uniqueToken);
    return res.status(200).render('dashboard', {
                                    user : user,
                                    other: user,
                                    myAvatar : avatar,
                                    otherAvatar: avatar
                                });
  }catch(error){
    return res.status(500).render('errors/500', {errorMsg : error.message});
  }
});

router.get('/error500', async (req, res)=>{
    return res.render('errors/500', {errorMsg:"test"});
});

router.get('/error400', async (req, res)=>{
    return res.render('errors/400', {errorMsg:"test"});
});

router.get('/error404', async (req, res)=>{
    return res.render('errors/404', {errorMsg:"test"});
});

router.get("/profile", middlewares, async (req, res)=>{
    try{
        const uniqueToken = req.query.uniqueToken;
        const otherUser = await User.findOne({uniqueToken}).populate("incidents").lean();
        return res.status(200).render('dashboard', {
                                        user : req.session.user,
                                        other: otherUser,
                                        myAvatar : avatarsGenerator(req.session.user.uniqueToken),
                                        otherAvatar: avatarsGenerator(uniqueToken)
                                    });    
    }catch(error){
        return res.status(500).render("errors/500", {errorMsg: error.message});
    }
});

module.exports = router;