/**
 * Dependencies
 */

var store = require('./store/file'),
    execution = require('./execution'),
    path = require('path');

/**
 * Connection
 */

var connection = {

  /**
   * Set up the connection, saving a reference to the store.
   *
   * Returns the connection object.
   */
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
  open: function (dbPath, cb) {
    dbPath = path.resolve(process.cwd(), dbPath);
    store.open(dbPath, function () {
      var conn = Object.create(connection).init({
        store: store
      });
      this.connections.push(conn);
      cb(null, conn);
    }.bind(this));

    return this;
  },

  /**
   * List of currently open connections.
   */
  connections: [],

  store: store

};

module.exports = filedb;