const mount = require('koa-mount');


module.exports = function (server) {

  const todoRouter = require('./todoRouter');
  server.use(mount('/api/todo', todoRouter.routes()));

};
