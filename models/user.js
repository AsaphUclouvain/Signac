const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {v4 : uuidv4} = require("uuid");

const userSchema = new mongoose.Schema({
    fullname : { type : String, required : true},
    email: {type : String, required : true, unique : true},
    username : { type : String, required : true, unique : true},
    password: {type : String, required : true},
    status : {type: String, default : "active"},
    uniqueToken :{type:String, index : true, sparse : true, unique:true},
    emailVerified:{type : Boolean, default : false},
    createdAt : {type : Date, default : Date.now},
    incidents:[{type:mongoose.Schema.Types.ObjectId, ref:"Event"}],
    expireAt: {
        type : Date,
        default: ()=> Date.now() + 7 * 24 * 60 * 60 * 1000 //7 days
    }
});

userSchema.index({expireAt : 1}, {expireAfterSeconds : 0, sparse : true});

userSchema.statics.authenticate = async function(data){
    const ename = data.ename;
    const password = data.password;
    const user = await this.findOne({
        $or : [ {username : ename},
                {email : ename}
            ]
    });

    if (!user) return null;

    if (!bcrypt.compare(password, user.password)) return null;

    if (!user.emailVerified) return null;
    user.status = 'active';
    await user.save();
    return user.toObject();
}

userSchema.statics.createUser = async function(data){
    const {fullname, email, username, password, confirm} = data;
    
    if (!fullname || !email || !username || !password)
        throw {name :"missingDataError",  message :"Missing required data"};

    if (confirm !== password)
        throw {name :"missMatchError",  message :"Passwords doesn't match"};

    if (password.length < 8)
        throw {name : "shortPasswordError", message :"Password must be at least 8 characters long"};

    const existingUser = await this.findOne({
        $or : [{email},
            {username}]
    });

    if (existingUser)
        throw {name : "duplicateUserError", message :"User already exists with this email or username"};

    const user = new this({
        fullname,
        email, 
        username,
        password
    });
    const uniqueToken = uuidv4();
    user.uniqueToken = uniqueToken;
    await user.save();
    return user.toObject();
}

userSchema.statics.disconnectUser = async function(user_id){
    try{
        if (!mongoose.Types.ObjectId.isValid(user_id))
            throw new Error("Invalid Object Id");
        const user = await this.findById(user_id);
        if (!user)
            throw new Error("User not found");
        user.status = 'unactive';
        await user.save();
        return user.toObject();
    }catch(error){
        throw error;
    }
}

userSchema.pre('save', async function(next){
    //verify that the password is hached only one time: when a new user is created or when a user modify his password
    if (this.isModified('password')){
        try{
            this.password = await bcrypt.hash(this.password, 12);
        }catch(err){
            return next(err);
        }
    }
    next();
});

userSchema.methods.verifyEmail = async function() {
    this.emailVerified = true;
    this.expireAt = null;
    await this.save();
    return this.toObject();
}

userSchema.methods.comparePassword = function(password){
    return bcrypt.compare(password, this.password);
}; //this method is customized by us to easily verify the password at user login

module.exports = mongoose.model('User', userSchema);