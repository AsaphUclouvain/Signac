require('dotenv').config();
const express = require("express");
const {v4 : uuidv4} = require("uuid");
const User = require("../models/user");
const xss = require("xss");
const router = express.Router();
const transporter = require("../config/transporter");

router.get("/register", async (req, res)=>{
    return res.render("register", {errorMsg:"", user : {fullname : "", username : "", email : ""}});
});

router.post("/register", async (req, res) => {
    try{
        const user = await User.createUser(req.body);
        if (!user)
            return res.status(400).render('register', {errorMsg : "invalid Data", user : req.body});
        const url = "http://localhost:3000/api/auth/verify_email/";
        const mailOptions = {
            from: process.env.AUTH_MAIL,
            to: user.email,
            subject: "Signac - Verify Your email Address",
            html: `<p>Welcome,</p><p>Please verify your email address to complete the sign up process and login to your account.</p><p>This link expires in <b>7 days</b>.</p><p>Press <a href=${url + user.uniqueToken}>here</a> to proceed.</p><p>Signac.</p>`
        };
        await transporter.sendMail(mailOptions);
        return res.redirect("/api/auth/login");
    }catch(error){
        if (error.name === "missMatchError"
            || error.name === "missingDataError"
            || error.name === "shortPasswordError"
            || error.name === "duplicateUserError"
        )
            return res.status(400).render('register', {errorMsg : error.message, user : req.body});
        res.status(500).render("errors/500");
    }
});

router.get("/verify_email/:token", async (req, res)=>{
    try{
        const token = req.params.token;
        if (!token)
            return res.status(400).render('errors/400', {errorMsg : "corrupted verification link"});
        const user = await User.findOne({uniqueToken : token});
        if (!user)
            return res.status(400).render('errors/400', {errorMsg : "User doesn't exist"});
        if (user.emailVerified)
            return res.status(400).render('errors/400', {errorMsg : "user already verified"});
        req.session.user = await user.verifyEmail();
        return res.redirect("/api/user/dashboard");
    }catch(err){
        res.status(500).render("errors/500", {errorMsg : err.message});
    }
});

module.exports = router;