/*
 * Express - Resources
 * Copyright(c) 2012 TJ Peden <tj.peden@tj-coding.com>
 * MIT Licensed
 * 
 * Credit to TJ Holowaychuk and Daniel Gasienica for
 * their work on express-resource.
 */


/**
 * Module dependencies.
 */
 
var express = require('express');
var fs = require('fs');
var path = require('path');
var lingo = require('lingo');

/**
 * Pre-defined action ordering.
 * As in express-resource.
 */

var orderedActions = [
  'all',
  'index',
  'new',
  'create',
  'show',
  'edit',
  'update',
  'destroy'
];

/**
 * Extend function.
 */

function $(destination) { // extend
  var args = [].slice.call(arguments, 1);
  
  args.forEach(function(source) {
    for(var property in source)
      if(source.hasOwnProperty(property))
        destination[property] = source[property];
  });
  
  return destination;
}

function loadController(app, name) {
  var dir = app.settings.controllers;
  return require(path.join(dir, name));
}

/**
 * Initialize a new `Resource` with the
 * given `name` and `actions`.
 * 
 * @param {String} name
 * @param {Object} actions
 * @param {Server} app
 */

var Resource = module.exports = function Resource(app, name, options) {
  this.name = options.name || name;
  this.root = options.root || false;
  this.base = this.root ? '/' : '/' + this.name;
  this.app = app;
  
  this.id = options.id || this._defaultId();
  
  this.routes = [];
}

$(Resource.prototype, {
  
  /**
   * Configure the default actions.
   * 
   * @param {Object} actions
   */
  
  _init: function(actions) {
    var self = this;
    
    orderedActions.forEach(function(action) {
      if(!(action in actions)) return;
      var path = self.path(action),
          callback = actions[action],
          method;
      
      switch(action) {
        case 'all':
          self.app.all(path, callback);
          return;
        case 'index':
        case 'show':
        case 'new':
        case 'edit':
          method = 'get';
          break;
        case 'create':
          method = 'post';
          break;
        case 'update':
          method = 'put';
          break;
        case 'destroy':
          method = 'delete';
          break;
      }
      
      if('all' != action) path += '.:format?';
      
      self.map(method, path, callback)
        ._record(action, method, path);
    });
  },
  
  /**
   * Return the resource's default id string.
   * 
   * @return {String}
   */
  
  _defaultId: function() {
    return this.root ?
      'id' : lingo.en.singularize(this.name);
  },
  
  /**
   * Record the `method` and `path` a given `action`
   * is mapped to. Also preserves order.
   */
  
  _record: function(action, method, path) {
    method = method.toUpperCase();
    this.routes.push({
      action: action,
      method: method,
      path: path
    });
  },
  
  resource: function(name, options, nest) {
    var app = this.app;
    
    if('function' == typeof options)
      nest = options, options = {};
    
    var controller = loadController(app, name);
    var options = $({}, controller.options, options);
    var resource = new Resource(app, name, options);
    
    name = lingo.en.singularize(this.name) +
        '_' + resource.name;
    app.resources[name] = resource;
    
    
    resource.base = this.path('show') + resource.base;
    resource._init(controller);
    if('function' == typeof nest) {
      nest.apply(resource);
    }
    
    return resource;
  },
  
  /**
   * Return a generated path for the given action
   * 
   * @param {String} action
   * @return {String}
   */
  
  path: function(action) {
    var result = this.base;
    
    switch(action) {
      case 'all':
      case 'show':
      case 'edit':
      case 'update':
      case 'destroy':
        result += '/:' + this.id;
      default: break;
    };
    
    switch(action) {
      case 'all':
        result += '?/:op?';
        break;
      case 'new':
      case 'edit':
        result += '/' + action;
      default: break;
    }
    
    return result;
  },
  
  /**
   * Map http `method` and `path` to `callback`.
   * 
   * @param {String} method
   * @param {String} path
   * @param {Function} callback
   * @return {Resource} for chaining
   */
  
  map: function(method, path, callback) {
    this.app[method](path, callback);
    return this;
  },
  
  /**
   * Returns a rendering of all the routes mapped
   * for this resource.
   * 
   * @return {String}
   */
  
  toString: function() {
    return this.routes.map(function(obj) {
      return obj.action + "\t" + obj.method + "\t" + obj.path;
    }).join("\n");
  }
});

express.HTTPServer.prototype.resource =
express.HTTPSServer.prototype.resource = function(name, options, nest) {
  if('function' == typeof options)
    nest = options, options = {};
  
  this.resources = this.resources || {};
  var controller = loadController(this, name);
  var options = $({}, controller.options, options);
  var resource = new Resource(this, name, options);
  
  this.resources[resource.name] = resource;
  
  resource._init(controller);
  if('function' == typeof nest) {
    nest.apply(resource);
  }
  
  return resource;
}
