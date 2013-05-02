/**
 * Dependencies
 */

var query = require('./query'),
    _ = require('underscore');

/**
 * Execution
 * Inherits from query.
 *
 * An execution object is the combination of a query, collection and store. It
 * is a special query that's constructed so that the exec method can be called
 * on it so data can be retrived by quering the collection in the store.
 */

// An execution's prototype is a query
var execution = Object.create(query);

// Extend the execution with new methods
_.extend(execution, {

  /**
   * Initialise the execution.
   *
   * This first sets the execution up by running the query init function on
   * itself, and then saves references to the passed collection and store.
   *
   * Returns the execution object.
   */
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
    find: function (cb) {
      return this.store.find(this.collection, cb);
    },

    /**
     * Get some specific data by id.
     */
    findById: function (cb) {
      return this.store.findById(this.collection, this.data._id, cb);
    },

    /**
     * Save the data in query.data using the _id in the query.data object.
     * This might be nuts.
     */
    save: function (cb) {
      return this.store.save(this.collection, this.data._id, this.data, function (err, savedData) {
        return cb(null, savedData);
      });
    }

  },

  /**
   * Execute the query by passing off to the action matching the query type.
   */
  exec: function (cb) {
    if (!this.type) return cb(new Error("Empty query."), []);
    this.actions[this.type].call(this, cb);
    return this;
  }

});

module.exports = execution;