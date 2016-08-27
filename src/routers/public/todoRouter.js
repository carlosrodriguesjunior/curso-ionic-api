'use strict';

const Router = require('koa-router');
const Todo = require('../../models/todoModel').Todo;
var todoRouter = new Router();

todoRouter.get('/', function*(next) {
    this.body = yield Todo.find();

});

todoRouter.get('/:id', function*(next) {
    this.body = yield Todo.findOne({
        _id: this.params.id
    });

});

todoRouter.post('/', function*(next) {
    let params = this.request.body;
    this.body = yield Todo.create(params);
});


todoRouter.patch('/:id', function*(next) {
    let params = this.request.body;
    let todo = yield Todo.findById({
        _id: this.params.id
    });

    if (!todo) this.throw(404, 'Todo not found');

    this.body = yield Todo.update({
        '_id': this.params.id
    }, params);
});

todoRouter.del('/:id', function*(next) {
    this.body = yield Todo.remove({
        _id: this.params.id
    });
});

module.exports = todoRouter;
