/**
 * In memory data store
 */

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

var store = (function () {
  var _data = {};
  return {

    open: function (dbPath, cb) {
      return cb(err, this);
    },

    query: function (collection, cb) {
      if (!_data[collection]) _data[collection] = {};
      var arr = Object.keys(_data[collection]).map(function (_id) {
        return _data[collection][_id];
      });
      return cb(null, arr);
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