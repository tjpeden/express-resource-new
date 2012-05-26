/*
 * Express - Resources (New)
 * Copyright(c) 2012 TJ Peden <tj.peden@tj-coding.com>
 * MIT Licensed
 * 
 * Credit to TJ Holowaychuk and Daniel Gasienica for
 * their work on express-resource.
 */


/**
 * Module dependencies.
 */
 
var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    lingo = require('lingo');

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

/**
 * Initialize a new `Resource` with the
 * given `name` and `actions`.
 * 
 * @param {String} name
 * @param {Object} actions
 * @param {Server} app
 */

var Resource = module.exports = function Resource(app, name, options) {
  this.app = app;
  this.name = options.name || name;
  this.root = options.root || false;
  this.base = this._base();
  
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
    this.actions = actions;
    var self = this;
    
    orderedActions.forEach(function(action) {
      if(!(action in self.actions)) return;
      var path = self.path(action),
          callback = self.actions[action],
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
      
      path += '.:format?';
      
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
   * Return the base path (takes into account nesting).
   * 
   * @return {String}
   */
  
  _base: function() {
    var base;
    
    if('_base' in this.app && this.app._base.length > 0) {
      base = this.app._base + '/' + this.name;
    } else {
      base = '/' + (this.root ? '' : this.name);
    }
    
    return base;
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
  
  /**
   * Sets all the appropriate variables for nesting
   * before calling the callback that creates the
   * nested resources.
   * 
   * @param {Function} callback
   */
  
  _nest: function(callback) {
    var prev = this.app._base;
    this.app._base = this.path('show');
    this.app._trail.push(this.name);
    
    callback.apply(this);
    
    this.app._base = prev;
    this.app._trail.pop();
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
  
  member: function(method, action, callback) {
    if(!callback && action in this.actions) {
      callback = this.actions[action];
    } else {
      throw new Error("Action needs a callback!");
    }
    var path = this.path('show') + '/' + action;
    
    this.map(method, path, callback)
      ._record(action, method, path);
  }
  
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

var methods = {
  
  /**
   * Requires modules from the `app.settings.controllers` path.
   * This method uses caching so that multiple calls for the
   * same controller don't require multiple calls to require.
   * 
   * @return {Object}
   */
  
  _load: function(name) {
    this._loaded = this._loaded || {};
    
    if(!(name in this._loaded)) {
      var dir = this.settings.controllers;
      this._loaded[name] = require(path.join(dir, name));
    }
    
    return this._loaded[name];
  },
  
  /**
   * Saves all resources into a table. The name used
   * is generated from it's nesting path so that the
   * same controller can be used in different levels.
   * 
   * @param {Resource} resource
   */
  
  addResource: function(resource) {
    var name = this._trail.map(function(name) {
      return lingo.en.singularize(name);
    }).concat(resource.name).join('_');
    
    this.resources[name] = resource;
  },
  
  /**
   * Loads the controller, creates the resouce object
   * and handles nesting.
   * 
   * @param {String} name
   * @param {Object} options
   * @param {Function} callback
   * @return {Resource}
   */
  
  resource: function(name, options, callback) {
    if('function' == typeof options)
      callback = options, options = {};
    
    this._trail = this._trail || [];
    this.resources = this.resources || {};
    var controller = this._load(name);
    var options = $({}, controller.options, options);
    var resource = new Resource(this, name, options);
    
    this.addResource(resource);
    
    resource._init(controller);
    if('function' == typeof callback) {
      resource._nest(callback);
    }
    
    return resource;
  }
}

// Load `methods` onto the server prototypes
$(express.HTTPServer.prototype, methods);
$(express.HTTPSServer.prototype, methods);
