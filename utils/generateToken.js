require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (id)=>{
    const refreshToken = jwt.sign({userId : id}, process.env.JWT_SECRET, {expireIn : '30d'});
    return refreshToken;
}

module.exports = generateToken;