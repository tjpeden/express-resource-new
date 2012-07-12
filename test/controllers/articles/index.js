var auth = function(request, response, next) {
  console.log("checking authenticity");
  next();
};

var owner = function(request, response, next) {
  console.log("checking ownership");
  if([1,2,3].indexOf(request.params.article) >= 0) {
    next();
  } else {
    response.redirect('/articles');
  }
};

var hidden = [];

module.exports = {
  options: {
    before: {
      show: auth,
      update: [auth, owner],
      destroy: [auth, owner],
      hide: [auth, owner]
    }
  },
  all: function(request, response, next) { next(); },
  index: function(request, response) {
    response.send('articles index');
  },
  show: function(request, response) {
    var id = request.params.article;
    if(hidden.indexOf(id) >= 0) {
      response.send('article ' + id + ' is hidden.');
    } else {
      response.send('<a href="/articles/' + id + '/hide">hide</a>');
    }
  },
  new: function(request, response) {
    response.send('new article');
  },
  create: function(request, response) {
    response.send('create article');
  },
  edit: function(request, response) {
    response.send('edit article ' + request.params.article);
  },
  update: function(request, response) {
    response.send('update article ' + request.params.article);
  },
  destroy: function(request, response) {
    response.send('delete article ' + request.params.article);
  },
  hide: function(request, response) {
    hidden.push(request.params.article);
    response.redirect('/articles/' + request.params.article);
  }
};