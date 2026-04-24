require("dotenv").config();
const jwt = require("jsonwebtoken");
const {v4 : uuidv4} = require("uuid");
const User = require("../models/user");

const checkActiveSession = async (req, res, next)=>{
    try{
        if (!req.session.user)
            req.noSession = true;
        return next();
    }catch(err){
        next(err);
    }
}

const sessionErrorHandler = async (err, req, res, next)=>{
    return res.render("errors/500");
}

const checkRememberToken = async (req, res, next)=>{
    if (!req.noSession)
        return next();
    try{
        const refreshToken = req.cookies?.refresh_token || "";
        if (!refreshToken)
            throw {name : "notTokenError", message:"no refresh token"};
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        let user = await User.findById(decoded.userId).lean();
        if (!user)
            throw new Error("user not found");
        req.session.user = user;
        const duration = decoded.exp - Math.floor(Date.now() / 1000);
        const newRefreshToken = jwt.sign({userId : user._id, jti : uuidv4()}, process.env.JWT_SECRET, {expiresIn: duration});
        res.cookie('refresh_token', newRefreshToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSate: process.env.NODE_ENV === 'production'? 'strict':'lax',
            httpOnly: true,
            maxAge: duration
        });
        return next();
    }catch(err){
        next(err);
    }
}

const tokenErrorHandler = async (err, req, res, next)=>{
    if (err.name.includes("Token") || err.name === "NotBeforeError")
        return res.render('login', {errorMsg:"", ename : ''});
    return res.render("errors/500");
}

module.exports = {checkActiveSession, sessionErrorHandler, checkRememberToken, tokenErrorHandler};