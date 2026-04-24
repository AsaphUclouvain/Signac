require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');

module.exports = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl:process.env.MONGO_URI,
        ttl: 3600
    }),
    cookie:{
        secure: process.env.NODE_ENV === 'production',
        sameSate: process.env.NODE_ENV === 'production'? 'strict':'lax',
        httpOnly: true
    }
});