const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const co = require('co');

module.exports = (app) => {
    app.use('/api/games', router);
};

// GET method: Get all games
router.get('/', (req, res) => {
    co(function*() {
        const games = yield Game.find({});
        res.send({ games });
    });
});

// POST method: Create new game
router.post('/', (req, res) => {
    co(function*() {
        const game = new Game(req.body);
        console.log(game);
        const result = yield game.save();
        res.status(201).send(result);
    });
});

// GET,PATCH,DELETE By Id
router.route('/:id')
    .all((req, res, next) => {
        co(function*() {
            const game = yield Game.findById(req.params.id);
            req.game = game;
            next();
        });
    })
    .get((req, res) => {
        res.json(req.game);
    })
    .patch((req, res) => {
        if (req.body._id) delete req.body._id;
        for (var p in req.body) {
            if (req.body.hasOwnProperty(p)) {
                req.game[p] = req.body[p];
            }
        }
        co(function*() {
            const game = yield req.game.save();
            res.status(200).send(game);
        });
    })
    .delete((req, res) => {
        co(function*() {
            const result = yield req.game.remove({ _id: req.game._id });
            res.send(result);
        });
    });