const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    nickname: String,
    openid: String,
    unionid: String,
    createdAt: Date
});

mongoose.model('User', UserSchema);