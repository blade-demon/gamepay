const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Record = mongoose.model('Record');
const co = require('co');

module.exports = (app) => {
    app.use('/api/records', router);
};

// GET method: Get all records
router.get('/', (req, res) => {
    var query = {};
    if (req.query._id) {
        query._id = req.query._id;
    }
    co(function*() {
        const records = yield Record.find(query);
        res.send({ records });
    });
});

// POST method: Create new record
router.post('/', (req, res) => {
    co(function*() {
        const record = new Record(req.body);
        console.log(record);
        const result = yield record.save();
        res.status(201).send(result);
    });
});

// GET,PATCH,DELETE By Id
router.route('/:id')
    .all((req, res, next) => {
        co(function*() {
            const record = yield Record.findById(req.params.id);
            req.record = record;
            next();
        });
    })
    .get((req, res) => {
        res.json(req.record);
    })
    .patch((req, res) => {
        if (req.body._id) delete req.body._id;
        for (var p in req.body) {
            if (req.body.hasOwnProperty(p)) {
                req.record[p] = req.body[p];
            }
        }
        co(function*() {
            const record = yield req.record.save();
            res.status(200).send(record);
        });
    })
    .delete((req, res) => {
        co(function*() {
            const result = yield req.record.remove({ _id: req.record._id });
            res.send(result);
        });
    });
