const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
    gameId: String,
    deviceId: String,
    gameFailed: {
        type: Boolean,
        default: false
    },
    needPay: {
        type: Boolean,
        default: false
    },
    failedTime: [{
        type: Date,
        default: Date.now()
    }]
});

mongoose.model('Record', RecordSchema);