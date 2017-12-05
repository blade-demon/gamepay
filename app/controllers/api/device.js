const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Device = mongoose.model('Device');
const co = require('co');

module.exports = (app) => {
    app.use('/api/devices', router);
};

// GET method: Get all devices
router.get('/', (req, res) => {
    co(function*() {
        const devices = yield Device.find({});
        res.send({ devices });
    });
});

// POST method: Create new device
router.post('/', (req, res) => {
    co(function*() {
        const device = new Device(req.body);
        console.log(device);
        const result = yield device.save();
        res.status(201).send(result);
    });
});

// GET,PATCH,DELETE By Id
router.route('/:id')
    .all((req, res, next) => {
        co(function*() {
            const device = yield Device.findById(req.params.id);
            req.device = device;
            next();
        });
    })
    .get((req, res) => {
        res.json(req.device);
    })
    .patch((req, res) => {
        if (req.body._id) delete req.body._id;
        for (var p in req.body) {
            if (req.body.hasOwnProperty(p)) {
                req.device[p] = req.body[p];
            }
        }
        co(function*() {
            const device = yield req.device.save();
            res.status(200).send(device);
        });
    })
    .delete((req, res) => {
        co(function*() {
            const result = yield req.device.remove({ _id: req.device._id });
            res.send(result);
        });
    });