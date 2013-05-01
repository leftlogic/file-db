/**
 * Dependencies
 */

var shortid = require('shortid'),
    _       = require('underscore');

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
  init: function (config) {
    if (!config.collection) throw new Error("Query requires a collection.");
    this.collection = config.collection;
    if (!config.actions) throw new Error("Query requires actions.");
    this.actions = config.actions;

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
    this.actions[this.type](this, cb);
    return this;
  }

};

module.exports = query;