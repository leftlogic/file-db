/**
 * Store
 */

var store = require('./store');

/**
 * Query
 */

var query = require('./query');

/**
 * Connection
 */

var connection = {

  init: function (config) {
    if (!config.store) throw new Error("Connection requires a store.");
    this.store = config.store;
    // Bind all the actions to this object
    Object.keys(this.actions).forEach(function (key) {
      this.actions[key] = this.actions[key].bind(this);
    }.bind(this));
    return this;
  },

  /**
   * Creates a new query object for the supplied collection string.
   *
   * Returns a new query object.
   */
  use: function (collection) {
    return Object.create(query).init({
      collection: collection,
      actions: this.actions
    });
  },

  /**
   * Database actions. Keys should match the values in query.types.
   */
  actions: {

    /**
     * Grab all the data for a given collection.
     */
    query: function (query, cb) {
      return this.store.query(query.collection, cb);
    },

    /**
     * Get some specific data by id.
     */
    get: function (query, cb) {
      return this.store.get(query.collection, query.data._id, cb);
    },

    /**
     * Save the data in query.data using the _id in the query.data object.
     * This might be nuts.
     */
    set: function (query, cb) {
      return this.store.set(query.collection, query.data._id, query.data, function (err, savedData) {
        return cb(null, savedData);
      });
    }

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