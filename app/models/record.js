const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
    gameId: String,
    deviceId: String,
    // 防止在游戏未失败的情况下误付款
    isFailed: {
        type: Boolean,
        default: false
    },
    // 本次launch游戏需要付费
    isPaid: {
        type: Boolean,
        default: false
    },
    failedList: [{
        time: {
            type: Date,
            default: Date.now()
        },
        hash: {
            type: String
        },
        salt: {
            type: String
        },
        code: {
            type: String
        }
    }],
    launchTime: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('Record', RecordSchema);