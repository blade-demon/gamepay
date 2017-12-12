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
    console.log("loginInfo", loginInfo);
    co(function*() {
        const saveResult = yield RecordGame(loginInfo.mac, loginInfo.gameId);
        console.log("保存结果：", saveResult);
        res.status(200).send(saveResult);
    }).catch(function(err) {
        console.log(err);
        if (err) {
            res.send(false).status(500);
        }
    });
});

// 游戏失败,客户端进入付费流程调用的接口,将该机器的游戏记录设置为待付费状态
router.post('/failed', (req, res) => {
    console.log(req.body);
    // 修改本次游戏记录中已经失败，需要付费
    co(function*() {
        const recordId = req.body._id;
        const recordFound = yield Record.findById({ _id: recordId });
        const failedTime = new Date();
        // 设置游戏失败标志位
        recordFound.isFailed = true;
        var failedList = recordFound.failedList;
        failedList.push({ "time": failedTime });
        recordFound.failedList = failedList;
        const recordFoundSave = yield recordFound.save();
        console.log('游戏失败的保存记录：', recordFoundSave);
        res.status(200).send(true);
    });
});

// 游戏失败扫描二维码付费
// /services/pay?mac=xx:xx:xx:xx
router.post('/pay', (req, res) => {
    co(function*() {
        var mac = req.params.mac;
        var device = yield Device.find({ mac: mac });
        if (typeof(device) === undefined) {
            return res.status(404).send("设备不存在");
        }

        var loginRecord = device.loginRecord.slice(-1).pop();
        if (typeof(loginRecord) === undefined) {
            return res.status(404).send('不存在本次登录记录');
        }

        var recordFound = yield Record.findById(loginRecord._id);
        if (typeof(recordFound) === undefined) {
            return res.status(404).send(recordFound);
        }
        // 游戏失败且未付费的情况下，调用付费接口
        if (recordFound.isFailed && !recordFound.isPaid) {
            // TODO: 调用付费接口
        }
        else {
            return res.status(200).send('无需付费');
        }

    });
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
            return res.status(200).send({ status: false, code: '' });
        }
        // code已存在也覆盖
        record.failedList.slice(-1).pop().code = code;
        // 设置本次已经付费
        record.isPaid = true;
        console.log('code 已成功生成：', record.failedList);
        yield record.save();
        res.status(200).send({ status: true, code: code });
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
        // code相等返回true，并将isFailed标志位改为false，isPaid标志位改为false
        if (savedCode === code) {
            record.isFailed = false;
            record.isPaid = false;
            yield record.save();
            return res.status(200).send(true);
        }
        else {
            return res.status(200).send(false);
        }
    });
});

/**
 * 游戏付费以后生成code并写入
 * @param  {String} recordId     - 游戏记录Id
 * @return {Boolean} true/false  - 返回true/false
 */
const WriteCode = co.wrap(function*(recordId) {
    var code = randomize('A0', 8);
    const record = yield Record.findById(recordId);
    const lastFailedItem = record.failedList.slice(-1).pop();
    // 不存在游戏失败记录
    if (typeof(lastFailedItem) === undefined) {
        return false;
    }
    // code已存在也覆盖
    record.failedList.slice(-1).pop().code = code;
    // 设置本次已经付费
    record.isPaid = true;
    console.log('code 已成功生成：', record.failedList);
    yield record.save();
    return true;
});


/**
 * 游戏启动，客户端传递机器和游戏数据
 * @param {String} mac    - MAC地址
 * @param {String} gameId - 游戏ID
 */
const RecordGame = co.wrap(function*(mac, gameId) {
    const device = yield Device.findOne({ "mac": mac });
    const game = yield Game.findOne({ "id": gameId });
    console.log("设备信息：", device);
    console.log("游戏信息", game);

    if (device === null) {
        console.log('设备未注册');
        return;
    }
    if (game === null) {
        console.log("游戏未注册");
        return;
    }

    const newRecord = new Record({ gameId, deviceId: device.deviceId });
    const saveResult = yield newRecord.save();
    console.log('保存结果：', saveResult);
    var loginRecord = device.loginRecord;
    loginRecord.push(newRecord._id);
    device.loginRecord = loginRecord;
    const saveLoginRecordResult = yield device.save();
    console.log("保存此次游戏记录：", saveLoginRecordResult);
    return saveResult;
});
