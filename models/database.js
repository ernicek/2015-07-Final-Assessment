var Bookshelf = require('bookshelf');
var path = require('path');

var db = Bookshelf.initialize({
    client: 'sqlite3',
    connection: {
        host: '127.0.0.1',
        user: '',
        password: '',
        database: 'giphyviewer',
        charset: 'utf8',
        filename: path.join(__dirname, '../db/giphyviewer.sqlite')
    }
});

db.knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
        db.knex.schema.createTable('users', function (link) {
            link.increments('id').primary();
            link.string('username', 255);
            link.string('password', 255);
            link.string('githubid', 255);
        }).then(function (table) {
            console.log('Table users created');
        });
    }
});

module.exports = db;