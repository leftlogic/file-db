/**
 * Dependencies
 */

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    async = require('async');

/**
 * Collection, directory or file descriptor
 */
var descriptor = {

  /**
   * Setup the descriptor with a root path and a name. It resolves the root
   * with the name to construct a path.
   *
   * The descriptor's type can be assigned here, otherwise it will be
   * automatically detected. When setting up a collection, you'll want to set
   * the type here to 'descriptor.types.collection'.
   *
   * Returns the descriptor object.
   */
  init: function (options) {
    this.root = options.root;
    this.name = options.name;
    this.path = path.resolve(this.root, this.name);
    this.type = options.type || this.types.directory;
    return this;
  },

  /**
   * Grab all data from this descriptor. This also checks the type so that the
   * correct action is used.
   */
  find: function (cb) {
    this.stat(function (err) {
      if (err) return cb(err);
      this.actions[this.type].find.call(this, cb);
    }.bind(this));
  },

  /**
   * Find a particular document by id. Inefficient becuase it builds the full
   * tree of the database every time.
   * TODO optimise
   */
  findById: function (_id, cb) {
    this.stat(function (err) {
      if (err) return cb(err);
      this.actions[this.type].find.call(this, function (err, documents) {
        if (err) return cb(err);
        var match = null;
        documents.some(function (document) {
          if (document._id === _id) {
            match = document;
            return true;
          }
          return false;
        });
        return cb(err, match);
      });
    }.bind(this));
  },

  save: function (_id, data, cb) {
    if (this.type !== this.types.collection) {
      this.type = descriptor.types.file;
      if (typeof data === "object") this.type = descriptor.types.directory;
    }
    this.actions[this.type].save.call(this, _id, data, cb);
  },

  /**
   * Descriptor types
   */
  types: {
    directory: 'directory',
    file: 'file',
    collection: 'collection'
  },

  /**
   * Actions
   *
   * The top-level keys should match the values of the descriptor.types object.
   * Within each type, all the database methods should be implemented. A
   * collection should reall be Object.created from the descriptor object. Hmm.
   */
  actions: {

    /**
     * Collection Methods
     */
    collection: {

      /**
       * Grab all data from within the collection.
       */
      find: function (cb) {
        // Make sure this collection exists before querying it
        this.ensure(function (err) {
          if (err) return cb(err);
          // Read the directory. This returns simple string names, so we have to
          // map over this list, creating a new descriptor for each. The
          // descriptor determines it's own type.
          fs.readdir(this.path, function (err, files) {
            if (err) return cb(err);
            // Map over the files, creating descriptors.
            async.map(files, this.findChild.bind(this), function (err, children) {
              // All child descriptors have been created, so we have a full
              // descriptor structure. Now pass it back to the querier as a
              // usable object.
              this.children = children;
              // Convert this descriptor to an object format, which calls the
              // same method its children recursively, essentially converting
              // itself to an more usable.
              var obj = this.toJSON(),
                  // This is a collection descriptor, so convert the top level
                  // objects into an array.
                  arr = Object.keys(obj).map(function (_id) {
                    return obj[_id];
                  });
              // Send 'em on back
              cb(err, arr);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      },

      /**
       * Save or update the collection.
       *
       * It creates a descriptor for the main document folder, using the _id,
       * then when all children have been saved it builds a JSON (usable object)
       * version and sends it on back.
       */
      save: function (_id, data, cb) {
        this.ensure(function (err) {
          if (err) return cb(err);
          Object.create(descriptor).init({
            root: this.path,
            name: _id
          }).save(_id, data, function (err, document) {
            if (err) return cb(err);
            cb(err, document.toJSON());
          });
        }.bind(this));
      },

      /**
       * Convert this collection descriptor to a usable object.
       *
       * Returns an object.
       */
      toJSON: function () {
        return this.children.reduce(function (memo, child) {
          memo[child.name] = child.toJSON();
          return memo;
        }, {});
      }

    },

    directory: {

      /**
       * Grab all data from within this directory.
       */
      find: function (cb) {
        // We know this directory exists, so no need to check right now
        fs.readdir(this.path, function (err, files) {
          if (err) return cb(err);
          // Map over the children, constructing an array of file descriptors.
          // These will be converted toJSON recursively by the collection find
          // method.
          async.map(files, this.findChild.bind(this), function (err, children) {
            // We've got all the children – save them and send it on back.
            this.children = children;
            cb(err, this);
          }.bind(this));
        }.bind(this));
      },

      /**
       * Save data within this diretory.
       *
       * It extracts the keys of the data, then hands off the key and the data
       * to the saveChild method to set up. File descriptors, when being save,
       * are responsible for creating themselves.
       *
       * Once the the children have been saved it filters out the undefined ones
       * (the _id key should not be saved).
       */
      save: function (_id, data, cb) {
        // Create this directory if it's not there already
        this.ensure(function (err) {
          if (err) return cb(err);
          // Grab each of the key from the data and hand it off to a child
          // descriptor to be created.
          async.map(Object.keys(data), function (name, cb) {
            // Don't save _id data
            if (name === '_id') return cb(null);
            // Save data for the current child
            this.saveChild(name, data[name], cb);
          }.bind(this), function (err, children) {
            // We've got all the children – save them and send it on back,
            // removing the undefined ones first.
            this.children = children.filter(function (child) {
              return !!child;
            });
            cb(err, this);
          }.bind(this));
        }.bind(this));
      },

      /**
       * Convert this directory object to an object. This uses the directory
       * name as the _id of the object, and then adds the children on, using
       * their names as keys. A child directory will set up it's own _id.
       *
       * Returns an object.
       */
      toJSON: function () {
        var obj = this.children.reduce(function (memo, child) {
          memo[child.name] = child.toJSON();
          return memo;
        }, { _id: this.name });
        return obj;
      }

    },

    file: {

      /**
       * Grab the data from a file using utf8 encoding. This just adds a data
       * key to this, ready to be used or toJSON'd later.
       */
      find: function (cb) {
        fs.readFile(this.path, 'utf8', function (err, data) {
          if (err) return cb(err);
          this.data = data;
          cb(err, this);
        }.bind(this));
      },

      /**
       * Save an update to a file using utf8 encoding, then save the passed
       * data as this descriptor's data, and head back.
       */
      save: function (name, data, cb) {
        fs.writeFile(this.path, data, 'utf8', function (err) {
          if (err) return cb(err);
          this.data = data;
          cb(err, this);
        }.bind(this));
      },

      /**
       * Convert a file to a usable format. For a file, it just uses the file's
       * data. Nothing fancy.
       */
      toJSON: function () {
        return this.data;
      }

    }

  },

  /**
   * Make sure that the directory at this.path exists. If it doesn't, create it.
   * mkdir -p this.path.
   */
  ensure: function (cb) {
    mkdirp(this.path, cb);
  },

  exists: function (cb) {
    fs.exists(this.path, cb);
  },

  /**
   * Unless this is a collection, stat the path of this descriptor to determine
   * how to interact with it.
   */
  stat: function (cb) {
    if (this.type === this.types.collection) return cb(null);
    fs.stat(this.path, function (err, stats) {
      if (err) return cb(err);
      if (stats.isDirectory()) this.type = this.types.directory;
      if (stats.isFile()) this.type = this.types.file;
      cb(null);
    }.bind(this));
  },

  /**
   * Create a new descriptor for the given child, and begin the finding process
   * on it.
   */
  findChild: function (name, cb) {
    Object.create(descriptor).init({
      root: this.path,
      name: name
    }).find(cb);
  },

  /**
   * Create a new descriptor for the child and save it. Ignore children called
   * _id.
   */
  saveChild: function (name, data, cb) {
    Object.create(descriptor).init({
      root: this.path,
      name: name
    }).save(name, data, cb);
  },

  /**
   * Convert this descriptor to a usable object. This just hands off to the
   * action for the current descriptor's type.
   */
  toJSON: function () {
    return this.actions[this.type].toJSON.call(this);
  }

};

module.exports = descriptor;