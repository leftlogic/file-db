/**
 * Dependencies
 */

var shortid = require('shortid'),
    _       = require('underscore'),
    fs      = require('fs');

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

/**
 * Query
 * TODO findOne & find
 */

var query = {

  /**
   * Set up the query object using a collection identifier (string).
   *
   * Returns a query object.
   */
  init: function (collection) {
    this.collection = collection;
    this.data = {};
    this.type = this.types.query;
    // Chainable
    return this;
  },

  /**
   * Query types. This is a bit of a janky way of making sure finds don't
   * get melded with saves.
   */
  types: {
    query: 'query',
    get: 'get',
    set: 'set'
  },

  /**
   * Database actions. Keys should match the values in query.types.
   */
  action: {

    /**
     * Grab all the data for a given collection.
     */
    query: function (cb) {
      return store.query(this.collection, cb);
    },

    /**
     * Get some specific data by id.
     */
    get: function (cb) {
      return store.get(this.collection, this.data._id, cb);
    },

    /**
     * Save the data in this.data using the _id in the this.data object.
     * This might be nuts.
     */
    set: function (cb) {
      return store.set(this.collection, this.data._id, this.data, function (err, savedData) {
        return cb(null, savedData);
      });
    }

  },

  /**
   * Find an object by id in the given collection, suppied when the query was
   * created.
   *
   * Returns a query object.
   */
  find: function (_id) {
    if (this.type === this.types.set) return this;
    this.type = this.types.get;
    this.data._id = _id;
    return this;
  },

  /**
   * Add some data to the query to be saved. This can be called multiple times.
   *
   * Returns a query object.
   */
  save: function (data) {
    if (this.type === this.types.get) return this;
    this.type = this.types.set;
    // Allow the _id to be overwritten, restore or generated
    data._id = data._id || this.data._id || shortid.generate();
    // Extend the existing query data
    this.data = _.extend({}, this.data, data);
    return this;
  },

  /**
   * Execute the query according to the type.
   *
   * Returns a query object, so it can be called multiple times.
   */
  exec: function (cb) {
    this.action[this.type].call(this, cb);
    return this;
  }

};

/**
 * Connection
 */

var connection = {

  /**
   * Creates a new query object for the supplied collection string.
   *
   * Returns a query object.
   */
  use: function (collection) {
    return Object.create(query).init(collection);
  }

};

/**
 * FileDB
 */

var filedb = {

  /**
   * Create a new connection object to be used to access the database at the
   * supplied path.
   *
   * Returns a connection object.
   */
  open: function (path, cb) {
    return cb(null, Object.create(connection));
  }

};

module.exports = filedb;