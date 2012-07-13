var express = require('express'),
    assert = require('assert'),
    should = require('should'),
    Resource = require('../');

describe("app.resource", function() {
  var app;
  
  beforeEach(function() {
    app = express.createServer();

    app.configure(function(){
      app.set('controllers', __dirname + '/controllers');
    });
  });
  
  it("should return a Resource object", function() {
    var articles, comments;
    articles = app.resource('articles', function() {
      comments = app.resource('comments');
    });
    
    articles.should.be.an.instanceof(Resource);
    comments.should.be.an.instanceof(Resource);
  });
  
  it("should create a resouces object in app", function() {
    var articles, comments;
    articles = app.resource('articles', function() {
      comments = app.resource('comments');
    });
    
    app.resources.should.be.a('object').and.have.property('articles', articles);
    app.resources.should.be.a('object').and.have.property('article_comments', comments);
  });
  
  it("should create all the appropriate routes for a resource", function() {
    var resource = app.resource('articles');
    
    resource.routes[0].path.should.equal("/articles.:format?");
    resource.routes[1].path.should.equal("/articles/new.:format?");
    resource.routes[2].path.should.equal("/articles.:format?");
    resource.routes[3].path.should.equal("/articles/:article.:format?");
    resource.routes[4].path.should.equal("/articles/:article/edit.:format?");
    resource.routes[5].path.should.equal("/articles/:article.:format?");
    resource.routes[6].path.should.equal("/articles/:article.:format?");
  });
  
  it("should allow options to be passed in", function() {
    var resource = app.resource('articles', { name: 'posts', id: 'id' });
    
    resource.routes[0].path.should.equal("/posts.:format?");
    resource.routes[1].path.should.equal("/posts/new.:format?");
    resource.routes[2].path.should.equal("/posts.:format?");
    resource.routes[3].path.should.equal("/posts/:id.:format?");
    resource.routes[4].path.should.equal("/posts/:id/edit.:format?");
    resource.routes[5].path.should.equal("/posts/:id.:format?");
    resource.routes[6].path.should.equal("/posts/:id.:format?");
  });
  
  it("should create all the appropriate nested routes for a resource", function() {
    var resource;
    app.resource('articles', function() {
      resource = app.resource('comments');
    });
    
    resource.routes[0].path.should.equal("/articles/:article/comments.:format?");
    resource.routes[1].path.should.equal("/articles/:article/comments/new.:format?");
    resource.routes[2].path.should.equal("/articles/:article/comments.:format?");
    resource.routes[3].path.should.equal("/articles/:article/comments/:comment.:format?");
    resource.routes[4].path.should.equal("/articles/:article/comments/:comment/edit.:format?");
    resource.routes[5].path.should.equal("/articles/:article/comments/:comment.:format?");
    resource.routes[6].path.should.equal("/articles/:article/comments/:comment.:format?");
  });
  
  it("should allow non-standard restfull routing", function() {
    var articles, comments;
    articles = app.resource('articles', function() {
      this.member.get('bonus', function(request, response) {
        response.send('BONUS!');
      });
      
      comments = this.resource('comments', function() {
        this.collection.get('search');
        this.member.get('reply');
      });
    });
    
    articles.routes[7].path.should.equal("/articles/:article/bonus.:format?");
    comments.routes[7].path.should.equal("/articles/:article/comments/search.:format?");
    comments.routes[8].path.should.equal("/articles/:article/comments/:comment/reply.:format?");
  });
  
  it("should allow deep nesting", function() {
    var deep;
    app.resource('articles', { name: 'a' }, function() {
      app.resource('comments', { name: 'c' }, function() {
        deep = app.resource('comments', { name: 'deep' });
      });
    });
    
    deep.routes[0].path.should.equal("/a/:a/c/:c/deep.:format?");
  });
  
  it("should allow root level routes", function() {
    var resource = app.resource('articles', { root: true });
    
    resource.routes[0].path.should.equal("/.:format?");
    resource.routes[1].path.should.equal("/new.:format?");
    resource.routes[2].path.should.equal("/.:format?");
    resource.routes[3].path.should.equal("/:id.:format?");
    resource.routes[4].path.should.equal("/:id/edit.:format?");
    resource.routes[5].path.should.equal("/:id.:format?");
    resource.routes[6].path.should.equal("/:id.:format?");
  });
  
  it("should respond with correct action");
});
