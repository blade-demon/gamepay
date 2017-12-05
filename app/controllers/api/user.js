const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const co = require('co');

module.exports = (app) => {
    app.use('/api/users', router);
};

// GET method: Get all users
router.get('/', (req, res) => {
    co(function*() {
        const users = yield User.find({});
        res.send({ users });
    });
});

// POST method: Create new user
router.post('/', (req, res) => {
    co(function*() {
        const user = new User(req.body);
        console.log(user);
        const result = yield user.save();
        res.status(201).send(result);
    });
});

// GET,PATCH,DELETE By Id
router.route('/:id')
    .all((req, res, next) => {
        co(function*() {
            const user = yield User.findById(req.params.id);
            req.user = user;
            next();
        });
    })
    .get((req, res) => {
        res.json(req.user);
    })
    .patch((req, res) => {
        if (req.body._id) delete req.body._id;
        for (var p in req.body) {
            if (req.body.hasOwnProperty(p)) {
                req.user[p] = req.body[p];
            }
        }
        co(function*() {
            const user = yield req.user.save();
            res.status(200).send(user);
        });
    })
    .delete((req, res) => {
        co(function*() {
            const result = yield req.user.remove({ _id: req.user._id });
            res.send(result);
        });
    });