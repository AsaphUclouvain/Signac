const mongoose = require("mongoose");
const User = require("../models/user");
const dateUtils = require("../utils/date");

const Event = new mongoose.Schema({
    spoiler : {type : String, required : true},
    uniqueToken : {type:String, required : true},
    date : {type : String, default : dateUtils.getDate},
    description : {type : String, required: true},
    address : {type : String, required : true}
});

Event.statics.createEvent = async function(args, user_id){
    if (!user_id || !args)
        return null;
    const user = await User.findById(user_id);
    if (!user)
        throw new Error("User not found");
    const event =  new this({
        spoiler : user.fullname,
        uniqueToken : user.uniqueToken,
        address : args.address,
        description : args.description
    });
    await event.save();
    user.incidents.push(event._id);
    await user.save();
    return user.toObject();
};

Event.statics.deleteEvent = async function(strIncidentId, user_id){
    const user = await User.findById(user_id);
    if (!user)
        throw new Error("User not found");
    user.incidents.filter(_id=>_id.toString() == strIncidentId);
    await user.save();
    await this.deleteOne({_id:strIncidentId});
    return user.toObject();
}
 
module.exports = mongoose.model("Event", Event);