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
   * Set up the query object by intialising some data.
   * This is altered by certain methods. Once the type has been set it
   * should not change, so all query methods should first check that the
   * currently set type is ok for them to use, and then set the type.
   *
   * Returns the query object.
   */
  init: function () {
    this.data = {};
    this.type = null;
    return this;
  },

  /**
   * Query types. This is a bit of a janky way of making sure finds don't
   * get melded with saves.
   */
  types: {
    find: 'find',
    findById: 'findById',
    save: 'save'
  },

  /**
   * Generic find.
   */
  find: function () {
    this.type = this.types.find;
    return this;
  },

  /**
   * Find an object by id in the given collection, suppied when the query was
   * created.
   *
   * Returns the query object.
   */
  findById: function (_id) {
    if (this.type === this.types.save) return this;
    this.type = this.types.findById;
    this.data._id = _id;
    return this;
  },

  /**
   * Add some data to the query to be saved. This can be called multiple times.
   *
   * Returns the query object.
   */
  save: function (data) {
    if (this.type === this.types.find) return this;
    this.type = this.types.save;
    // Allow the _id to be overwritten, restore or generated
    data._id = data._id || this.data._id || shortid.generate();
    // Extend the existing query data
    this.data = _.extend({}, this.data, data);
    return this;
  }

};

module.exports = query;