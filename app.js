var express = require('express');
var app = express();
global.__root   = __dirname + '/'; 

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-xsrf-token,access-token');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var LanguageController = require(__root + 'controller/LanguageController');
app.use('/api/language', LanguageController);

var LessonController = require(__root + 'controller/LessonController');
app.use('/api/lesson', LessonController);

var ExampleController = require(__root + 'controller/ExampleController');
app.use('/api/example', ExampleController);

module.exports = app;