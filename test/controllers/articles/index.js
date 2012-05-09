module.exports = {
  all: function(request, response, next) { next(); },
  index: function(request, response) {
    response.send('articles index');
  },
  show: function(request, response) {
    response.send('show article ' + request.params.article);
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
  }
};