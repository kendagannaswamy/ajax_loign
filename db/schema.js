var mongoose = require("mongoose");
var Schema = mongoose.Schema;




exports.users = function ()
{
    var customers = mongoose.Schema( {

        _id :Schema.ObjectId,
        name: String,
        ip: String,
    	userId:String,
		password:String,
		active:Number,
    	createdAt:Date,
        selectFont:String,
        status:Number		
			
		
    });

    var users = mongoose.model('users', customers);
}


