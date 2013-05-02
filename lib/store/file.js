/**
 * File data store
 */

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    async = require('async');

var descriptor = {

  init: function (options) {
    this.root = options.root;
    this.name = options.name;
    this.path = path.resolve(this.root, this.name);
    this.type = options.type || this.types.directory;
    return this;
  },

  types: {
    directory: 'directory',
    file: 'file',
    collection: 'collection'
  },

  actions: {

    collection: {

      query: function (cb) {
        this.ensure('', function (err) {
          if (err) throw err;
          fs.readdir(this.path, function (err, files) {
            if (err) throw err;
            async.map(files, this.queryChild.bind(this), function (err, children) {
              this.children = children;
              var obj = this.toJSON(),
                  arr = Object.keys(obj).map(function (_id) {
                    return obj[_id];
                  });
              cb(err, arr);
            }.bind(this));
          }.bind(this));
        });
      },

      toJSON: function () {
        return this.children.reduce(function (memo, child) {
          memo[child.name] = child.toJSON();
          return memo;
        }, {});
      }

    },

    directory: {

      query: function (cb) {
        fs.readdir(this.path, function (err, files) {
          if (err) throw err;
          async.map(files, this.queryChild.bind(this), function (err, children) {
            this.children = children;
            cb(err, this);
          }.bind(this));
        }.bind(this));
      },

      toJSON: function () {
        var obj = this.children.reduce(function (memo, child) {
          memo[child.name] = child.toJSON();
          return memo;
        }, { _id: this.name });
        return obj;
      }

    },

    file: {

      query: function (cb) {
        fs.readFile(this.path, 'utf8', function (err, data) {
          if (err) return cb(err);
          this.data = data;
          cb(err, this);
        }.bind(this));
      },

      toJSON: function () {
        return this.data;
      }

    }

  },

  ensure: function (makePath, cb) {
    cb = cb || function () {};
    mkdirp(this.resolve(makePath), cb.bind(this));
  },

  resolve: function (resolvePath) {
    return path.resolve(this.path, resolvePath);
  },

  query: function (cb) {
    this.stat(function (err) {
      if (err) return cb(err);
      this.actions[this.type].query.call(this, cb);
    }.bind(this));
  },

  stat: function (cb) {
    if (this.type === this.types.collection) return cb(null);
    fs.stat(this.path, function (err, stats) {
      if (err) return cb(err);
      if (stats.isDirectory()) this.type = this.types.directory;
      if (stats.isFile()) this.type = this.types.file;
      cb(null);
    }.bind(this));
  },

  queryChild: function (name, done) {
    Object.create(descriptor).init({
      root: this.path,
      name: name
    }).query(done);
  },

  toJSON: function () {
    return this.actions[this.type].toJSON.call(this);
  }

};

var store = (function () {

  return {

    open: function (dbPath, cb) {
      this.path = dbPath;
      mkdirp(this.path, function (err, made) {
        return cb(err, this);
      }.bind(this));
      return this;
    },

    query: function (collectionName, cb) {
      Object.create(descriptor).init({
        root: this.path,
        name: collectionName,
        type: descriptor.types.collection
      }).query(cb);
    },

    get: function (collection, _id, cb) {
      if (!_data[collection]) _data[collection] = {};
      return cb(null, _data[collection][_id]);
    },

    set: function (collection, _id, data, cb) {
      if (!_data[collection]) _data[collection] = {};
      _data[collection][_id] = data;
      return cb(null, _data[collection][_id]);
    }

  };
}());

module.exports = store;