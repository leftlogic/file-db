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
   * Set up the query object.
   *
   * Returns the query object.
   */
  init: function () {
    this.data = {};
    this.type = this.types.query;
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
   * Returns the query object.
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
   * Returns the query object.
   */
  save: function (data) {
    if (this.type === this.types.get) return this;
    this.type = this.types.set;
    // Allow the _id to be overwritten, restore or generated
    data._id = data._id || this.data._id || shortid.generate();
    // Extend the existing query data
    this.data = _.extend({}, this.data, data);
    return this;
  }

};

module.exports = query;