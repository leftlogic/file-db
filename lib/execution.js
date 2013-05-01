/**
 * Dependencies
 */

var query = require('./query'),
    _ = require('underscore');

/**
 * Execution
 */

var execution = Object.create(query);

_.extend(execution, {

  init: function (config) {
    // Initialize this as a query
    query.init.call(this, config);

    if (!config.collection) throw new Error("Execution requires a collection.");
    this.collection = config.collection;
    if (!config.store) throw new Error("Execution requires a store.");
    this.store = config.store;

    return this;
  },

  /**
   * Database actions. Keys should match the values in query.types.
   */
  actions: {

    /**
     * Grab all the data for a given collection.
     */
    query: function (cb) {
      return this.store.query(this.collection, cb);
    },

    /**
     * Get some specific data by id.
     */
    get: function (cb) {
      return this.store.get(this.collection, this.data._id, cb);
    },

    /**
     * Save the data in query.data using the _id in the query.data object.
     * This might be nuts.
     */
    set: function (cb) {
      return this.store.set(this.collection, this.data._id, this.data, function (err, savedData) {
        return cb(null, savedData);
      });
    }

  },

  exec: function (cb) {
    this.actions[this.type].call(this, cb);
  }

});

module.exports = execution;