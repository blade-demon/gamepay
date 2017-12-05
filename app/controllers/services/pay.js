const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Device = mongoose.model('Device');
const co = require('co');

module.exports = (app) => {
    app.use('/services', router);
};

router.get('/pay', (req, res) => {
    co(function*() {
        console.log("pay");
        res.send("pay");
    });
});