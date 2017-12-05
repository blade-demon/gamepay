const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
    deviceId: String,
    gameId: String,
    isPay: Boolean,
    time: Date
});

mongoose.model('Record', RecordSchema);