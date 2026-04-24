require("dotenv").config();
const express = require('express');
const cookies = require("cookie-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const expressSession = require("./config/session");
const incidentRoute = require("./routes/handleEvents");
const dashboardRouter = require("./routes/dashboard");

const app = express();
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(expressSession);
app.use(cookies());
app.use(express.urlencoded({ extended: true })); //to access the form data through req.body
app.use("/api/auth", registerRoute);
app.use("/api/auth", loginRoute);
app.use("/api/incident", incidentRoute);
app.use("/api/user", dashboardRouter);


app.get('/', async (req, res)=>{
    res.redirect("/api/auth/login");
})

mongoose.connect(process.env.MONGO_URI)   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

app.listen(process.env.PORT, () => {
    console.log('en attente de réponses');
});
