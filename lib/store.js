/**
 * Data store
 * TODO use files
 */

var store = (function () {
  var _data = {};
  return {
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