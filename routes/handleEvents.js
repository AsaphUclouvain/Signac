const express = require("express");
const Event = require("../models/event");
const {checkActiveSession, sessionErrorHandler, checkRememberToken, tokenErrorHandler} = require("../middlewares/auth");
const avatarsGenerator = require("../utils/avatarsGenerator");
const router = express.Router();

const middlewares = [checkActiveSession, sessionErrorHandler, checkRememberToken, tokenErrorHandler];
router.get("/list", middlewares,async (req, res)=>{
    try{
        return res.render('data', {
                                    user : req.session.user,
                                    avatar : avatarsGenerator(req.session.user.uniqueToken)
                                });
    }catch(error){
        return res.status(500).render('errors/500', {errorMsg : error.message});
    }
});

router.get('/paginate', middlewares, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const [incidents, totalDocs] = await Promise.all([
            Event.find().skip(skip).limit(limit).sort({date:1}).lean(),
            Event.countDocuments()
        ]);
        
        const totalPages = Math.ceil(totalDocs / limit);
        
        if (page > totalPages && totalPages > 0) {
            return res.status(400).render('errors/400', { 
                errorMsg: "Page index out of range" 
            });
        }

        incidents.map(incident=>{
            incident.avatar = avatarsGenerator(incident.uniqueToken);
        });
        
        return res.status(200).json({
            incidents,
            pagination: {
                currentPage: page,
                totalPages,
                totalDocs,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
        
    } catch(error) {
        return res.status(500).render('errors/500');
    }
});

router.get("/report", middlewares, async (req, res)=>{
    return res.render("report", {
        errorMsg : "",
        street:'',
        description : '',
        city : '',
        postcode : '',
        user:req.session.user,
        avatar:avatarsGenerator(req.session.user.uniqueToken)
    });
});

router.post("/report", middlewares, async (req, res)=>{
    try{
        if (!req.body.street || !req.body.postcode || !req.body.city || !req.body.description)
            return res.status(400).render('report', {
                                                        errorMsg : "Missing data",
                                                        street : req.body.street,
                                                        description : req.boby.description,
                                                        postcode : req.body.postcode,
                                                        city : req.body.city,
                                                        user: req.session.user,
                                                        avatar : avatarsGenerator(req.session.user.uniqueToken)
                                                    });
        const address = req.body.street + ', ' + req.body.postcode.toString() + ', ' + req.body.city;
        const args = {address, description : req.body.description}
        const user = await Event.createEvent(args, req.session.user._id); //ther new user with the list of incidents uptated
        req.session.user = user;
        return res.status(200).render("report", {
            errorMsg : "",
            street:'',
            description : '',
            city : '',
            postcode : '',
            user:req.session.user,
            avatar:avatarsGenerator(req.session.user.uniqueToken)
        });
    }catch(error){
        return res.status(500).render('errors/500');
    }
})

router.get('/delete/:id', middlewares, async (req, res)=>{
    try{
        const strIncidentId = req.params.id;
        const user = await Event.deleteEvent(strIncidentId, req.session.user._id);
        req.session.user = user;
        return res.redirect('/api/user/dashboard');
    }catch(error){
        console.log(error.message);
        return res.status(500).render('errors/500');
    }
});

module.exports = router;