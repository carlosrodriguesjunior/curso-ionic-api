'use strict';

const _ = require('lodash');
const User = require('../models/userModel').User;
const Test = require('../models/testModel').Test;
const UserTest = require('../models/userTestModel').UserTest;
const Personality = require('../models/personalityModel').Personality;
const testsNames = require('../config/constants').testsNames;

class TestService {

    *
    createUserPersonality(user, userProfileTest2) {
        let profileTest1 = yield Test.findOne({
            name: testsNames.profileTest1
        }).select('name').lean();

        let userProfileTest1 = yield UserTest.findOne({
            test: profileTest1._id,
            user: user._id
        }).lean();

        let answers = userProfileTest2.activities[0].answers.concat(userProfileTest1.activities[0].answers);

        let profileValues = _.orderBy(_.map(_.countBy(answers, 'value'), (count, prop) => ({
            prop,
            count
        })), 'count', 'desc');

        let personalityType;
        personalityType = _.find(profileValues, value => value.prop === 'E' || value.prop === 'I').prop;
        personalityType += _.find(profileValues, value => value.prop === 'S' || value.prop === 'N').prop;
        personalityType += _.find(profileValues, value => value.prop === 'F' || value.prop === 'T').prop;
        personalityType += _.find(profileValues, value => value.prop === 'J' || value.prop === 'P').prop;

        let personality = yield Personality.findOne({
            type: personalityType
        });
        
        yield User.update({
            '_id': user._id
        }, {
            personality: personality
        });
    }
}

module.exports = new TestService();
