'use strict';

const moment = require('moment');
const UserService = require('./userService');
const _ = require('lodash');
const properties = ['volunteering', 'education'];

class Achievements {

    *
    uploadUser(user, body) {
        let achievements = [];
        for (let prop in properties) {
            let haveprop = UserService.haveProperty(user, body, properties[prop]);
            let achievement = yield UserService.getAchievementsUser(user, properties[prop]);
            if (haveprop && !achievement || achievement.length === 0) {
                let newAchievements = yield UserService.getAchievements(properties[prop]);
                yield UserService.setAchievementsUser(user, newAchievements);
                achievements.push(newAchievements);
            }
        }
        return achievements.length === 0 ? undefined : achievements;
    }

    *
    comment(user) {
        let firstComment = Boolean(yield UserService.isFirstComment(user));
        if (firstComment)
            return;

        let achievements = yield UserService.getAchievements('comment1');
        if (!achievements)
            return;

        yield UserService.setAchievementsUser(user, achievements);
        return achievements;
    }

    *
    firmTip(user) {
        let achievement = yield UserService.getAchievements(`${user.consecutiveDays}days`);
        if (!achievement || achievement.length === 0)
            return;

        yield UserService.setAchievementsUser(user, achievement);
        return achievement ? achievement : false;
    }

    *
    exportCurriculum(user) {
        let achievements = yield UserService.getAchievementsUser(user);
        console.log(achievements);
        let achievement = Boolean(_.find(achievements, achievement => {
            return achievement.achievements.rule === 'exportCurriculum';
        }));

        if (achievement)
            return;

        achievement = yield UserService.getAchievements('exportCurriculum');
        yield UserService.setAchievementsUser(user, achievement);

        return achievement ? achievement : false;
    }
}

module.exports = new Achievements();
