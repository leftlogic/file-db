/**
 * Dependencies
 */

var store = require('./store'),
    execution = require('./execution');

/**
 * Connection
 */

var connection = {

  init: function (config) {
    if (!config.store) throw new Error("Connection requires a store.");
    this.store = config.store;
    return this;
  },

  /**
   * Creates a new exection object for the supplied collection string and the
   * current store.
   *
   * Returns a new execution object, which wraps a query.
   */
  use: function (collection) {
    return Object.create(execution).init({
      collection: collection,
      store: this.store
    });
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
   * Returns the filedb object.
   */
  open: function (path, cb) {
    var conn = Object.create(connection).init({
      store: store
    });
    this.connections.push(conn);
    cb(null, conn);
    return this;
  },

  connections: []

};

module.exports = filedb;