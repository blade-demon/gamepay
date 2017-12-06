const express = require('express');
const config = require('./config/config');
const glob = require('glob');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(config.db, { useMongoClient: true });
const db = mongoose.connection;
db.on('error', () => {
    throw new Error('unable to connect to database at ' + config.db);
});

const models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function(model) {
    require(model);
});
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const co = require('co');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const Record = mongoose.model('Record');
const Device = mongoose.model('Device');

let launchedMachines = 0;
let launchedMachinesArray = [];
// 机器登录
io.of('/machine').on('connection', function(machine) {
    console.log(`machine ${machine.id} connected.`);
    // 发送事件
    machine.emit('connected', `${machine.id}`);

    // 监听客户端的游戏启动事件
    machine.on('launch', function(from, msg) {
        launchedMachines++;
        console.log("启动的机器个数：", launchedMachines);
        console.log(`游戏 ${msg.gameName} 从机器${msg.mac} 在${new Date(msg.time)}启动成功`);

        co(function*() {
            const currentRecord = yield RecordGame(msg.mac, msg.gameId);
            // 发送设备游戏已注册事件
            machine.emit('registered', currentRecord);
        });
    });

    // 监听客户端的游戏失败事件
    machine.on('game failed', function(record) {
        console.log('此次游戏失败的信息：', record);
        // 修改本次游戏记录中已经失败，需要付费
        co(function*() {
            const recordFound = yield Record.findById({ _id: record._id });
            recordFound.gameFailed = true;
            recordFound.needPay = true;
            recordFound.failedTime.push(new Date(record.time));
            yield recordFound.save();
        });
    });

    // 监听客户端断开连接
    machine.on('disconnect', function() {
        console.log(`machine ${machine.id} disconnected`);
        launchedMachines--;
        console.log("当前启动的机 器个数：", launchedMachines);
        // io.emit(`machine ${socket.id} disconnected`);
    });
});

// 管理员登录，查看机器和游戏进行情况
io.of('/admin').on('connection', function(admin) {
    console.log('admin login');
    // 发送管理员登录事件
    admin.emit('connected', `${launchedMachines}`);
    // 监听机器启动事件
    admin.on('machineLaunched', function(data) {

    });
    // 监听机器关闭事件
    admin.on('machineShutdown', function(data) {

    });
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
    device.loginRecord.push(newRecord._id);
    const saveLoginRecordResult = yield device.save();
    console.log("保存此次游戏记录：", saveLoginRecordResult);
    return saveResult;
});

module.exports = require('./config/express')(app, config);

http.listen(config.port, () => {
    console.log('Express server listening on port ' + config.port);
});