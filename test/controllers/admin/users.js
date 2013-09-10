module.exports = {
  index: function(request, response) {
    response.send('users index');
  },
  show: function(request, response) {
    response.send('show user ' + request.params.user);
  },
  new: function(request, response) {
    response.send('new user');
  },
  create: function(request, response) {
    response.send('create user');
  },
  edit: function(request, response) {
    response.send('edit user ' + request.params.user);
  },
  update: function(request, response) {
    response.send('update user ' + request.params.user);
  },
  destroy: function(request, response) {
    response.send('delete user ' + request.params.user);
  }
};