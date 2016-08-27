'use strict';

const http = require('http');
const koa = require('koa');
const router = require('koa-router');
const bodyParser = require('koa-body');
const cors = require('koa-cors');
const corsError = require('koa-cors-error');
const gzip = require('koa-gzip');
const mount = require('koa-mount');
const db = require('./db');
const api = require('./src/config/api');
const mongodb = require('./src/config/mongodb')();

var server = module.exports = koa();

server.use(cors({ origin: '*', methods: 'GET,HEAD,PUT,POST,DELETE,PATCH', headers: ['Content-Type', 'Authorization'] }));
server.use(bodyParser());
server.use(corsError);
server.use(gzip());

require('./src/routers/public/index')(server);


db.connection.on('connected', () => {
    http.createServer(server.callback()).listen(api.port, () => {
        console.log('Server listening at http://localhost:' + api.port);
    });
});
