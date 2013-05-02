# File DB

File DB is a (very limited) document database that uses directories and files to store its data, supporting nested key-value objects in named collections.

**Note:** It does not support storage of arrays. Give it objects with keys and values.

## Usage

The following code assumes you have installed `file-db` via npm and have this at the top of your file:

```javascript
var fdb = require('file-db');
```

### fdb

The main `file-db` lets you open a database.

#### Open a database

To open a connection to the database, use `open`, passing a path and a callback. The callback receives an error parameter and a connection object.

```javascript
fdb.open('tmp/example', function (err, db) {
  // . . .
  // Do your database stuff
  // . . .
});
```

### Connection

Connection objects allow you to choose a collection to query.

#### Query a collection

The `use` method chooses a collection and returns a query object that you can use to query that collection.

```javascript
var query = db.use('users');
```

### Query

Query objects are tied to a specific collection, allowing you to choose how to query it.

#### Running a query

Whatever the query object, you can run it using the `exec` method:

```javascript
query.exec(function (err, documents) {
  // Use the documents
});
```

#### Find all documents in a collection

The `find` method sets up the query to retrieve all documents from a collection.

```javascript
query.find()
     .exec(doSomethingWithIt);
```

#### Find a document by _id

The `find` method sets up the query to retrieve all documents from a collection.

```javascript
query.findById('some-id')
     .exec(doSomethingWithIt);
```

#### Saving data

The `save` method is an upsert for one document. That means it will create data you give it if it doesn't exist, and will generate an `_id` for the document if you don't give it one.

If you do give `save` an _id and the data does exist it will update the document.

`save` can be called multiple times – it appends to the data you've already added.

##### New document

```javascript
db.use('users')
  .save({ name: 'Tom' })
  .exec(doSomething);
```

##### New document with id

```javascript
db.use('users')
  .save({ _id: 'abc123' })
  .save({ name: 'Tom' })
  .exec(doSomething);
```

##### Update existing document

```javascript
db.use('users')
  .save({
    _id: 'abc123',
    name: 'phuu'
  })
  .exec(doSomething);
```

## Install

To install file-db, use npm:

`npm install file-db`

## License

MIT