const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Device = mongoose.model('Device');
const Game = mongoose.model('Game');
const Record = mongoose.model('Record');
const co = require('co');

module.exports = (app) => {
    app.use('/services', router);
};

// 游戏启动客户端需要调用的接口
router.post('/login', (req, res) => {
    const loginInfo = req.body;
    console.log("loginInfo", loginInfo);
    co(function*() {
        console.log("login");
        res.send("login");
    });
});

// 游戏失败,客户端进入付费流程调用的接口
router.post('/pay', (req, res) => {

});

// 用户付费完成后, 客户端向服务器发送请求，查看本次游戏记录是否已经付费。
router.get('/check', (req, res) => {

});