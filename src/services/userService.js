'use strict';

const _ = require('lodash');
const User = require('../models/userModel').User;
const UserScore = require('../models/userScoreModel').UserScore;
const Achievements = require('../models/achievementsModel').Achievements;
const UserAchievements = require('../models/userAchievementsModel').UserAchievements;
const Score = require('../models/scoreModel').Score;
const LessonComment = require('../models/lessonCommentsModel').LessonComment;
const moment = require('moment');

class UserService {

    *
    getCommentUser(user, lesson) {
        return yield LessonComment.find({
            user: user,
            lesson: lesson,
            date: {
                $gte: new Date(moment().format('YYYY/MM/DD')),
                $lte: new Date(moment().add(1, 'd').format('YYYY/MM/DD'))
            }
        });
    }

    *
    isFirstComment(user) {
        return yield LessonComment.findOne({
            user: user
        });
    }

    haveProperty(user, body, property) {
        if (user[property] instanceof Array && user[property].length === 0 && body.hasOwnProperty(property) && Object.keys(body[property]).length > 0)
            return true;
        return user.hasOwnProperty(property) && body.hasOwnProperty(property) && Object.keys(body[property]).length > 0;
    }

    *
    getScoreByUser(user, findType) {
        let userScore = yield UserScore.find({
            user: user._id,
        }).populate('score', 'type').lean();

        if (!userScore)
            return false;

        userScore = _.find(userScore, score => (
            score.score.type === findType
        ));
        return !userScore ? false : true;
    }

    *
    setScoreUser(user, newScore) {
        return yield UserScore.create({
            user: user._id,
            score: newScore._id,
            date: new Date(),
            visualised: false
        });
    }

    diffDays(initial) {
        return moment().diff(initial, 'days');
    }

    *
    getScoreUser(user) {
        return yield UserScore.find({
            user: user._id
        }).populate('score', 'type');
    }

    *
    getUser(user) {
        return yield User.findOne({
            '_id': user._id
        });
    }

    *
    getAchievements(type) {
        return yield Achievements.findOne({
            rule: type
        });
    }

    *
    getAchievementsUser(user, findType) {
        let userAchievements = yield UserAchievements.find({
            user: user._id,
        }).populate('achievements', 'rule').lean();

        if (!userAchievements)
            return false;

        if (!findType)
            return userAchievements;
        userAchievements = _.find(userAchievements, achievement => (
            achievement.achievements.rule === findType
        ));

        return !userAchievements ? false : true;
    }

    *
    setAchievementsUser(user, achievements) {
        return yield UserAchievements.create({
            user: user._id,
            achievements: achievements._id,
            date: new Date(),
            visualised: false
        });
    }

    *
    finishStep(userid, id, type) {
        let user = yield User.findById(userid).lean();
        let currentWay = _.find(user.ways, way => way.name === user.way.currentWay);
        let currentStep = _.find(currentWay.levels[user.way.currentLevel].steps, step => {
            if (step.lesson && step.lesson._id && step.lesson._id.toString() === id || step.test && step.test._id && step.test._id.toString() === id)
                return step;
        });

        let finishLevel = false;
        if (currentStep) {
            currentStep.finalized = true;
            finishLevel = _.every(currentWay.levels[user.way.currentLevel].steps, step => {
                return step.finalized;
            });
        }

        if (finishLevel)
            finishLevel = this.nextLevel(finishLevel, user, currentWay);

        user = yield User.update({
            '_id': user._id
        }, user);
        return yield User.findById(userid).lean();
    }


    nextLevel(finishLevel, user, currentWay) {
        user.way.currentLevel += 1;
        _.forEach(currentWay.levels[user.way.currentLevel].steps, step => {
            step.locked = false;
        });
    }
}

module.exports = new UserService();
