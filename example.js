var fdb = require('./'),
    util = require('util');

fdb.open('tmp/test-fdb', function (err, db) {

  db.use('bins')
    .save({
      _id: 'VTIN9PHZv5',
      '2': {
        html: '<html>Version 2 - edited again</html>'
      }
    })
    .exec(function (err, data) {
      console.log('saved:', util.inspect(data, { depth: null, colors: true }));
    });

  db.use('bins')
    .save({
      html: '<h1>Hello</h1>',
      js: 'console.log("No.");'
    })
    .save({
      _id: 'test',
      css: '.nose { color: red; }'
    })
    .exec(function (err, data) {
      console.log('saved:', util.inspect(data, { depth: null, colors: true }));
    });

  db.use('bins')
    .findById('test')
    .exec(function (err, data) {
      console.log('findById:', util.inspect(data, { depth: null, colors: true }));
    });

  // .find() here is optional
  db.use('bins')
    .find()
    .exec(function (err, data) {
      console.log(util.inspect(data, { depth: null, colors: true }));
    });

});