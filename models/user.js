var db = require('./database.js');
var bcrypt = require('bcrypt-nodejs');

var salt = bcrypt.genSaltSync(10);

var User = db.Model.extend({
    tableName: 'users',
    hasTimestamps: false,

    //we need to overwrite constructor, because we want to store passwords in encrypted forms
    constructor: function(param){
        if(param != null && param.password != null){
            param.password = bcrypt.hashSync(param.password, salt);
        }
        db.Model.apply(this, arguments);
    }
});

//only what we need is tell to bookshelf which model should be used in the collection
var Users = new db.Collection();
Users.model = User;

module.exports = {
    User: User,
    Users: Users
};