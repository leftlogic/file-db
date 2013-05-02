var fdb = require('./'),
    util = require('util');

fdb.open('/Users/tom/dev/tmp/test-fdb', function (err, db) {

  db.use('bins')
    .save({
      _id: 'VTIN9PHZv5',
      '2': {
        html: '<html>Version 2 - edited again</html>'
      }
    })
    .exec(function (err, bin) {
      console.log.apply(console, [].slice.call(arguments));
    });

  // db.use('bins')
  //   .save({
  //     html: '<h1>Hello</h1>',
  //     js: 'console.log("No.");'
  //   })
  //   .save({
  //     _id: 'test',
  //     css: '.nose { color: red; }'
  //   })
  //   .exec(function (err, bin) {
  //     console.log('saved:', bin);
  //   });

  // db.use('bins')
  //   .findById('abc')
  //   .exec(function (err, bin) {
  //     console.log('found:', bin);
  //   });

  // .find() here is optional
  // db.use('bins')
  //   .find()
  //   .exec(function (err, data) {
  //     console.log(util.inspect(data, { depth: null, colors: true }));
  //   });

});