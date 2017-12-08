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
let launchMachinesList = [];
let adminId = '';
// 机器登录
io.of('/machine').on('connection', function(machine) {
    console.log(`machine ${machine.id} connected.`);
    // 发送事件
    machine.emit('connected', `${machine.id}`);

    // 监听客户端的游戏启动事件
    machine.on('launch', function(from, msg) {
        launchedMachines++;
        launchMachinesList.push({ machineID: machine.id, mac: msg.mac, gameName: msg.gameName, time: new Date(msg.time) });
        console.log(`游戏 ${msg.gameName} 从机器${msg.mac} 在${new Date(msg.time)}启动成功`);
        // if (adminId !== '') {
        //     console.log('admin已经登录，发送设备加入消息：', adminId);
        //     io.of('admin').emit('machineLaunched', launchMachinesList);
        // }
    });

    // 监听客户端断开连接
    machine.on('disconnect', function() {
        console.log(`machine ${machine.id} disconnected`);
        launchMachinesList = launchMachinesList.filter(launchMachine => launchMachine.machineID !== machine.id);
        // if (adminId !== '') {
        //     console.log(`admin已经登录，发送设备离开消息给控制台${adminId}`);
        //     io.of('admin').emit('machineShutdown', launchMachinesList);
        // }
    });
});

// 管理员登录，查看机器和游戏进行情况
io.of('/admin').on('connection', function(admin) {
    console.log('admin login:', admin.id);
    adminId = admin.id;
    // 发送管理员登录事件
    admin.emit('connected', launchMachinesList);
    // 监听机器启动事件
    admin.on('machineLaunched', function(data) {
        console.log('获得的机器启动数据：', data);
    });
    // 监听机器关闭事件
    admin.on('machineShutdown', function(data) {
        console.log('获得的机器离开数据：', data);
    });

    admin.on('disconnect', function() {
        adminId = '';
        console.log('admin 离开');
    });
});

module.exports = require('./config/express')(app, config);

http.listen(config.port, () => {
    console.log('Express server listening on port ' + config.port);
});