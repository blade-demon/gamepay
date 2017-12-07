const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Device = mongoose.model('Device');
const Game = mongoose.model('Game');
const Record = mongoose.model('Record');
const co = require('co');
const randomize = require('randomatic');

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

// 微信调取接口
// 当用户付费成功以后，调取改接口修改某条记录的最近一条失败记录的code
router.post('/writecode', (req, res) => {
    co(function*() {
        var code = randomize('A0', 8);
        var recordId = req.body.recordId;
        const record = yield Record.findById(recordId);
        const lastFailedItem = record.failedList.slice(-1).pop();
        // 不存在游戏失败记录
        if (typeof(lastFailedItem) === undefined) {
            return res.status(400).send(false);
        }
        // code已存在也覆盖
        record.failedList.slice(-1).pop().code = code;
        console.log('code 已成功生成：', record.failedList);
        yield record.save();
        res.status(200).send(true);
    });
});

// 用户付费完成后, 客户端使用code向服务器发起请求。服务器查看本次游戏记录是否存在验证码，并且游戏失败时间和之前失败时间匹配
// 查看提交的code和数据库存在的code一致
router.post('/check', (req, res) => {
    co(function*() {
        const recordId = req.body.recordId;
        const code = req.body.code;
        const record = yield Record.findById(recordId);
        const lastFailedItem = record.failedList.slice(-1).pop();
        // 不存在游戏失败记录
        if (typeof(lastFailedItem) === undefined) {
            return res.status(400).send(false);
        }
        // code 未创建，表示未付费
        const savedCode = lastFailedItem.code;
        if (typeof(savedCode) === undefined) {
            return res.status(200).send(false);
        }
        // code不相等返回false
        if (savedCode === code) {
            return res.status(200).send(true);
        } else {
            return res.status(200).send(false);
        }
    });
});