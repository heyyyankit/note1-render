const {createHmac, randomBytes} = require('crypto');
const { create } = require('domain');
const { Schema, model } = require('mongoose');
const { createTokensforUser } = require('../services/authentication');
// const mongoose = require('mongoose');
const userSchema = new Schema({
    name: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String},
    timestamp: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin'], default: 'user' } // 'admin' or 'user'
})
userSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    const salt = randomBytes(16).toString('hex');
    const hashPassword = createHmac('sha256', salt).update(user.password).digest('hex');
    // user.password = hash;
    this.salt = salt;
    this.password = hashPassword;
    next();
})
// userSchema.static("matchPassword", async function(email, password) {
//     const user = await this.findOne({ email });
//     if (!user) {    
//         throw new Error("User not found");
//         // return false;
//     }       
//     const salt = this.salt;
//     const storedPassword = this.hashPassword;
//     const userPassword = createHmac('sha256', salt).update(password).digest('hex');
//     // return userPassword == storedPassword;
//     if (userPassword !== storedPassword) {
//         throw new Error("Incorrect password");
//     }
//     return {...user, password: undefined, salt: undefined};
// })
userSchema.statics.matchPassword = async function(email, password) {
const user = await this.findOne({ email });
    if (!user) {    
        throw new Error("User not found");
        // return false;
    }       
    // const salt = this.salt;
    // const storedPassword = this.hashPassword;
    const salt = user.salt;
    const storedPassword = user.password;
    const userPassword = createHmac('sha256', salt).update(password).digest('hex');
    // return userPassword == storedPassword;
    if (userPassword != storedPassword) {
        throw new Error("Incorrect password");
    }
    const userObj = user.toObject();
    const token = createTokensforUser(userObj);
    delete userObj.password;
    delete userObj.salt;
    // return userObj;
    return token;
};



const User = model('User', userSchema);
module.exports = User;