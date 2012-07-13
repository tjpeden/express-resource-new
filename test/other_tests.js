var express = require('express'),
    Resource = require('../');

var app = express.createServer();

app.configure(function(){
  app.set('controllers', __dirname + '/controllers');
});

app.get('/', function(request, response) {
  response.redirect('/articles');
});

app.resource('articles', function() {
  this.member.get('hide');
});

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
