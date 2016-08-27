'use strict';

const Score = require('../models/scoreModel').Score;
const moment = require('moment');
const UserService = require('./userService');
const _ = require('lodash');
const properties = ['volunteering', 'education'];

class Gamification {

    *
    checkUpdateUser(user, body) {
        let scorenew = [];
        for (let prop in properties) {
            let haveprop = UserService.haveProperty(user, body, properties[prop]);
            let score = yield UserService.getScoreByUser(user, properties[prop]);
            if (haveprop && !score) {
                let newScore = yield this.getScore(properties[prop]);
                yield this.setScoreUser(user, newScore);
                scorenew.push(newScore);
            }
        }
        return scorenew.length === 0 ? undefined : scorenew;
    }

    *
    checkGamificationComment(user, lesson) {
        let typeScore = 'comment';
        let comments = yield UserService.getCommentUser(user, lesson);
        if (!comments)
            return;

        let length = comments.length >= 6 ? 5 : comments.length ;

        typeScore += length + 1;
        let score = yield this.checkScores(user, typeScore);
        return score;
    }

    *
    checkDailyPunctuation(user) {
        let addDays = 0;
        let userModel = yield UserService.getUser(user);
        if (UserService.diffDays(userModel.lastAcess) === 0)
            return;
        addDays = UserService.diffDays(userModel.lastAcess) > 1 ? 1 : userModel.consecutiveDays + 1;
        userModel.lastAcess = new Date();
        userModel.consecutiveDays = addDays;
        yield userModel.save();

        let score = yield this.checkScores(user, 'dailyBonus' + userModel.consecutiveDays);
        return score;
    }

    *
    checkExportCurriculum(user) {
        let typeScore = 'exportCurriculum';
        let userScore = yield UserService.getScoreUser(user);
        userScore = _.find(userScore, score => {
            return score.score.type === typeScore;
        });

        if (userScore)
            return;

        let score = yield this.checkScores(user, typeScore);
        return score;
    }

    *
    checkScores(user, typeScore) {
        let score = yield this.getScore(typeScore);
        if (!score)
            return;
        let newScore = [];
        let nw = yield UserService.setScoreUser(user, score);
        newScore.push(score);
        return newScore;
    }

    *
    getScore(type) {
        return yield Score.findOne({
            type: type
        });
    }

    *
    getScoreTest(test) {
        return yield Score.findOne({
            test: test
        }).populate('test', 'name');
    }
}

module.exports = new Gamification();
