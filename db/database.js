var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var dbs = config.database;
var mongoose = require("mongoose");
console.log("Database : "+dbs);
uri = "mongodb://localhost:27017/"+dbs;
console.log(uri)
mongoose.connect(uri);
mongoose.set('debug', true);
module.exports.mongoose = mongoose;

var dbSchema = require("./schema.js");

//Create Shared Models here
module.exports.dataModels = {
    
     userModel : mongoose.model('users',dbSchema.users())
    
}