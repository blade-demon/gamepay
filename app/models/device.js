const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    deviceId: String,
    mac: String,
    loginRecord: [Schema.ObjectId],
    createdAt: Date
});

mongoose.model('Device', DeviceSchema);