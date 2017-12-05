const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    name: String,
    desc: String,
    createdAt: Date
});

mongoose.model('Game', GameSchema);