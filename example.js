var fdb = require('./');

fdb.open('~/dev/tmp/test-fdb', function (err, db) {

  // db.use('bins')
  //   .save({
  //     html: '<html></html>',
  //     js: 'console.log("Hello.");'
  //   })
  //   .exec(function (err, bin) {
  //     console.log.apply(console, [].slice.call(arguments));
  //   });

  db.use('bins')
    .save({
      html: '<h1>Hello</h1>',
      js: 'console.log("No.");'
    })
    .save({
      _id: 'test',
      css: '.nose { color: red; }'
    })
    .exec(function (err, bin) {
      console.log('saved:', bin);
    });

  db.use('bins')
    .find('test')
    .exec(function (err, bin) {
      console.log('found:', bin);
    });

  db.use('bins')
    .exec(function () {
      console.log.apply(console, [].slice.call(arguments));
    });

});