var client = null;
var REDIS_ADDRESS = '192.168.0.127';
var REDIS_PORT = '6666';
var REDIS_PASSWORD = '';
var redis = require('redis');


module.exports = Redis;

/**
 * 构造函数
 */
function Redis(obj) {
 	for (var key in obj) {
 		this[key] = obj[key];
 	}
}

//********************* 连接Redis数据库 *************************
Redis.connectRedis = function(){
	client = redis.createClient(REDIS_PORT, REDIS_ADDRESS, {});

	//client.auth(REDIS_PASSWORD);

	client.on("error", function (err) {
		console.log("Connect Failure. Error: " + err);
	});

	client.on("connect", function() {
		console.log('***** Connect To Redis Server Sucessfully! *****');
		// client.get("DB_TEST_VALUE", function (err, reply) {
		// 	if(!err && reply != null){
		// 		console.log(reply.toString());
		// 	}else{
		// 		console.log('Can Not Get Data From Redis DB! ');
		// 	}
		// });
	});

	  // client.set("string111", "Hello World", function (err, reply) {
   //  console.log(reply.toString());
  //});
}
//**************************************************************

Redis.getClient = function(){
	return client;
}
