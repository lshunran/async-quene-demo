var xml2js = require('xml2js');
var publicUtils = require('../publicUtils/redisUtils');
var parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false, mergeAttrs: true });   //xml -> json
var request = require('request');
var mysql      = require('mysql');
var rp = require('request-promise');
var async = require('async');
var connection = mysql.createConnection({
  host     : 'guanshantech.mysql.rds.aliyuncs.com',
  user     : 'gst_admin',
  password : 'Guanshantech2016',
  database : 'dianping'
});
var options = {
  //url: 'http://dataapi.skieer.com/SkieerDataAPI/BatchGetDataPaged?key=78207368-673c-474b-a533-b43dad40f7a2&from=2016-09-21%2012:00&to=2016-09-21%2013:00&pageindex=1&pageSize=1000',
  headers: {
    'User-Agent': 'request'
  }
};

var baseURL = 'http://dataapi.skieer.com/SkieerDataAPI/BatchGetDataPaged?key=78207368-673c-474b-a533-b43dad40f7a2';
var time = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];


//用的是async的quene来实现，一次并发request n次请求，收到response收插入redis
exports.saveInRedis = function(req, res, next){
	var date = req.params.date;
	var client = publicUtils.getClient();

	var q = async.queue(function(task, callback) {
	    var i = task.i;
	    var pageindex = task.pageindex;
	    options['url'] = baseURL + '&from=' + date + '%20' + time[i] + '&to=' + date + '%20' + time[i+1] + '&pageindex=' + pageindex +'&pageSize=1000';
		request(options, function (error, response, body) {
			console.log('response.statusCode: ->>>>'+response.statusCode);
			console.log('error: ->>>>'+error);
			if (!error && response.statusCode == 200) {
				parser.parseString(body, function (err, result) {
					var key = time[i]+pageindex+'new';
					console.log('result: ->>>>' + result);
					if(typeof(result) != 'undefined' && result != null){
						if(typeof(result.DataList.Root) != 'undefined'){
							//一系列判断数据合格后就插
							client.set(key, JSON.stringify(result.DataList.Root), function(err, reply){
								console.log('result of ' + date + key + 'is : ' + reply);
								callback();						
							});
						}else{
							console.log('2222');
							callback();
						}
					}else{
						console.log('result:' + pageindex);
						callback();
					}

				});
			}else{
				console.log('response.statusCode is not 200');
				callback()
			}

		});

	}, 5);//并发数 n,可设置

	q.drain = function() {
	    console.log('finish alllllllllllllllllllllllll');
	    res.send('finish all');
	};

	//将所有请求放进队列,一天有24小时，一小时最多有36页，一次只能request 1页
	var count = 0;
	for(var i = 0; i < 24; i++){
		for(var j = 1; j < 36; j++){
			count++;
			q.push({i: i, pageindex: j}, function() {
				console.log('length: ' + q.length());
			    //console.log('finished processing key:' + key);
			});
		}
	}
	console.log(count);

	
}



var cacheList = [];
exports.save = function(req, res, next){
	// var date = req.params.date;
	// //options['url'] = 'http://dataapi.skieer.com/SkieerDataAPI/BatchGetDataPaged?key=78207368-673c-474b-a533-b43dad40f7a2&from=2016-09-21%2012:00&to=2016-09-21%2013:00&pageindex=1&pageSize=1000';
	// var boot = ['1'];
	// requestAll(0, 1, date, boot);
	// res.send('finish');
	// 
	
	// create a queue object with concurrency 2
	var q = async.queue(function(task, callback) {
	    console.log('hello ' + task.name);
	    callback();
	}, 2);

	// assign a callback
	q.drain = function() {
	    console.log('all items have been processed');
	};

	// add some items to the queue
	q.push({name: 'foo'}, function(err) {
	    console.log('finished processing foo');
	});
	q.push({name: 'bar'}, function (err) {
	    console.log('finished processing bar');
	});

	// add some items to the queue (batch-wise)
	q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
	    console.log('finished processing item');
	});

	// add some items to the front of the queue
	q.unshift({name: 'bar'}, function (err) {
	    console.log('finished processing bar');
	});


}

var requestAll = function(timeindex, pageindex, date, list){
	if(typeof(list) != 'undefined'){
		options['url'] = baseURL + '&from=' + date + '%20' + time[timeindex] + '&to=' + date + '%20' + time[timeindex + 1] + '&pageindex=' + pageindex +'&pageSize=1000';
		//options['url'] = 'http://www.baidu.com';
		request(options, function (error, response, body) {
			if(!error){  
				parser.parseString(body, function (err, result) {
					var List = result.DataList.Root;
					console.log(List);
					if(typeof(List) != 'undefined'){
						var item = [];
						for(var i = 0; i < List.length; i++){
							item = [];
							for(var k in List[i]){
								//console.log(List.length);
								item.push(List[i][k]);
							}
							cacheList.push(item);
							console.log("length:" + cacheList.length);
						};

						console.log("pageindex:" + pageindex);
						pageindex++;
						requestAll(timeindex, pageindex, date, List);
					}else{
						requestAll(timeindex, pageindex, date, List);

					};


				});

			}
		});
	}else if(typeof(list) == 'undefined' && timeindex <=23){
		timeindex++;
		pageindex = 1;
		var boot = ['1'];
		requestAll(timeindex, pageindex, date, boot);
	};
	return;
}

exports.import = function(req, res, next){
	console.log(req.params);
	var count = 0;

	var date = req.params.date;
	for(var i = 0; i < 1; i++){

	var notNull = true ;
	var pageindex = 1;
	options['url'] = baseURL + '&from=' + date + '%20' + time[i] + '&to=' + date + '%20' + time[i+1] + '&pageindex=' + pageindex +'&pageSize=1000';

	while(notNull){
	  request(options, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    //res.send(body) // Show the HTML for the Google homepage.
	    //res.end();
	    //console.log(body);
	    parser.parseString(body, function (err, result) {
	        var list = result.DataList.Root;
	        if(list.length > 0){
	        	notNull = true;
	        	pageindex++;
		        for(var j = 0; j < list.length; j++){
		        	console.log("-------------->" + j);
					connection.query('INSERT INTO dzdp_est_last SET ?', list[j], function(err, rows, fields) {
						if (err) throw err;
			 			//console.log('The solution is: ', rows[0].solution);
			 			count++;
			 			console.log("-------->"+count);
					});
		        }
	    	}else{
	    		notNull = false;
	    	}

	    });

	  }
	});
}
}

}

