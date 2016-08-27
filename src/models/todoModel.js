'use strict';

//Module dependencies.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Lesson Schema
const TodoSchema = new Schema({
    name: String,
    status: Boolean,
    createAt: {type:Date,  default: Date.now},
    doneAt: {type:Date}
});

// Exports Module
module.exports.TodoSchema = TodoSchema;
module.exports.Todo = mongoose.model('Todo', TodoSchema);
