/**
 * user 模型
 */
var mongodb = require('./db');
var crypto = require('crypto');
function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}
module.exports = User;
/**
 * 保存用户信息
 * @param callback
 */
User.prototype.save = function(callback){
	var md5 = crypto.createHash('md5');
	var emailMd5 = md5.update(this.email.toLowerCase()).digest('hex');
	var head = "http://www.gravatar.com/avatar/"+ emailMd5 + ".json";
	var user = {
			name	:	this.name,
			password	:	this.password,
			email	:	this.email,
			head	:	head
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(user,{safa:true},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user[0]);
			});
		});
	});
};

/**
 * 根据name查询user
 * @param name
 * @param callback
 */
User.get = function(name,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({name:name},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};

