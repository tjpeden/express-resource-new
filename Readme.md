[![build status](https://secure.travis-ci.org/tpeden/express-resource-new.png)](http://travis-ci.org/tpeden/express-resource-new)
# Express Resource (new)

express-resouce-new provides resourceful routing to express with improved nesting and auto-require.

## Installation

npm:

    $ npm install express-resource-new

## Usage

In your main application file (i.e. app.js or server.js) just add the following:

    var express = require('express'),
        Resource = require('express-resource-new'), // <- Add this (Resource really isn't needed)
        app = express.createServer();
    
    app.configure(function(){
      app.set('views', __dirname + '/views');
      // Add the following to your configure block (you can use any path you want)
      app.set('controllers', __dirname + '/controllers');
      /* ... */
    });

Now in the `./controllers` directory you can put your "controllers" with one or more of the supported actions as follows:

`./controllers/articles/index.js`:

    module.exports = {
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

express-resource-new also supports a special action, `all`, that gets called for all other actions in the resource.

    module.exports = {
      all: function(request, response, next) {
        // do some preloading or user authentication here
        next();
      },
      index: function(request, response) {
        response.send('articles index');
      },
      /* ... */
    };

"What if I want to create a resource on the root path or change the id variable name or define middleware on specific actions?" express-resource-new handles that by allowing you to set an `options` property on the controller object like so:

    module.exports = {
      options: {
        root: true, // Creates resource on the root path (overrides name)
        name: 'posts', // Overrides module name (folder name)
        id: 'id', // Overrides the default id from singular form of `name`
        before: { // Middleware support
          show: auth,
          update: [auth, owner],
          destroy: [auth, owner]
        }
      },
      index: function(request, response) {
        response.send('articles index');
      },
      /* ... */
    };

Lastly just call `app.resource()` with your controller name. Nesting is done by passing a function that can call `app.resource()` for each nested resource. Options can also be passed as the second parameter which override the options set in the controller itself.

    var express = require('express'),
        Resource = require('express-resource-new'),
        app = express.createServer();
    
    app.configure(function(){
      app.set('views', __dirname + '/views');
      app.set('controllers', __dirname + '/controllers');
      /* ... */
    });
    
    app.resource('articles', function() {
      app.resource('comments', { id: 'id' }); // You can also call `this.resource('comments')`
    });

You can also create non-standard RESTful routes.

`./controllers/comments/index.js`:

    module.exports = {
      index: function(request, response) {
        response.send('comments index');
      },
      /* ... */
      search: function(request, response) {
        response.send("Search all comments on this article.");
      },
      reply: function(request, response) {
        response.send("Reply to comment: " + request.params.comment);
      }
    };

`./app.js`:

    /* ... */
    app.resource('articles', function() {
      this.resource('comments', function() {
        this.collection.get('search');
        this.member.get('reply');
      });
    });

## Default Action Mapping

Actions are, by default, mapped as shown below. These routs provide `req.params.article` for the substring where ":article" is and, in the case of the nested routes, `req.params.comment` for the substring where ":comment" is as shown below:

    articles:
    index   GET     /articles.:format?
    new     GET     /articles/new.:format?
    create  POST    /articles.:format?
    show    GET     /articles/:article.:format?
    edit    GET     /articles/:article/edit.:format?
    update  PUT     /articles/:article.:format?
    destroy DELETE  /articles/:article.:format?

    article_comments:
    index   GET     /articles/:article/comments.:format?
    new     GET     /articles/:article/comments/new.:format?
    create  POST    /articles/:article/comments.:format?
    show    GET     /articles/:article/comments/:comment.:format?
    edit    GET     /articles/:article/comments/:comment/edit.:format?
    update  PUT     /articles/:article/comments/:comment.:format?
    destroy DELETE  /articles/:article/comments/:comment.:format?

## Content Negotiation

Content negotiation is currently only provided through the `req.params.format` property, allowing you to respond accordingly.

## Contributing

Patches are welcome, fork away! :-)

## License

    The MIT License

    Copyright (c) 2012 TJ Peden <tj.peden@tj-coding.com>

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    'Software'), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
