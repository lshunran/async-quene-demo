var express = require('express');
var router = express.Router();
var method = require('./method');



router.get('/import/:date', method.import);

router.get('/save/:date', method.save);

//只有这个是有用的,其他是测试.
router.get('/saveInRedis/:date', method.saveInRedis);


/* GET home page. */
router.get('/', function(req, res, next) {

	res.send(req.body);

// 	var options = {
// 	  url: 'http://dataapi.skieer.com/SkieerDataAPI/BatchGetDataPaged?key=78207368-673c-474b-a533-b43dad40f7a2&from=2016-09-21%2012:00&to=2016-09-21%2013:00&pageindex=1&pageSize=500',
// 	  headers: {
// 	    'User-Agent': 'request'
// 	  }
//     };

//   request(options, function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     //res.send(body) // Show the HTML for the Google homepage.
//     //res.end();
//     //console.log(body);
//     parser.parseString(body, function (err, result) {
//         //console.log(result);
//         res.send(result);
//         //var list = result.DataList.Root;

//         var list = result.DataList.Root;
//         for(var i = 0; i < list.length; i++){
//         	console.log("-------------->" + i);
// 			connection.query('INSERT INTO dzdp_est_last SET ?', list[i], function(err, rows, fields) {
// 				if (err) throw err;
// 	 			//console.log('The solution is: ', rows[0].solution);

// 			});
//         }
//     });
//   }
// })
});

module.exports = router;
