
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var pug = require('pug');
var app = express();
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler')

app.use(favicon(path.join(__dirname, 'public','images','favicon.ico'))); 

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(methodOverride());
app.use(express.json());    

if (process.env.NODE_ENV === 'development') {
   app.use(errorhandler())
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/modules", express.static(path.join(__dirname, 'node_modules')));

if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler())
}

function logMessage(message) {
  
  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + '[INFO] ' + message);
  
}

function logError(message) {
  
  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' [ERROR] ' + message);
  
}
  
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port: \'' + app.get('port') +'\'');
});

