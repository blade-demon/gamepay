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
    const record = new Record(loginInfo);
    console.log("loginInfo", record);
    co(function*() {
        const result = yield record.save();
        res.send(result);
    });
});

// 游戏失败,客户端进入付费流程调用的接口,将该机器的游戏记录设置为待付费状态
router.post('/failed', (req, res) => {

});

// 用户付费完成后, 客户端使用code向服务器发起请求。服务器查看本次游戏记录是否已经付费。
// 若已经付费则，将record设置为已付费。未付费，则不做任何操作。
router.post('/check', (req, res) => {
    res.send(true);
});