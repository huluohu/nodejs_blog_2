/**
 * dao模块
 */

var settings = require('../settings')
	,Db = require('mongodb').Db
	,Connection = require('mongodb').Connection
	,Server = require('mongodb').Server;
//创建并导出数据库连接实例
module.exports = new Db(settings.db, new Server(settings.host,
		Connection.DEFAULT_PORT), {safe : true}
);
