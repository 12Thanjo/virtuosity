var virtuosity = require('../virtuosity-server/index.js');
const express = require("C:/Users/andre/OneDrive/programming/nodejs/scrybe/node_modules/express/index.js");
app = express();
const serv = require('http').Server(app);
process.env.PWD = process.cwd();

var httpPort = 16;

serv.listen(httpPort);
console.log(`Localhost Server Started on Port: ${httpPort}`);

// var ips = new Set(["204.137.250.149", "127.0.0.1"]);
// app.use((req, res, next)=>{
// 	var ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
// 	ip = ip.replace("::ffff:", "");
// 	if(ips.has(ip)){
// 		next();
// 	}else{
// 		virtuosity.cmd.log(`unknown IP: ${ip}`, virtuosity.cmd.color.red);
// 		res.send("<h1>Error 403</h1><p>Unauthorized Access</p>");
// 	}
// });

app.use(express.static(__dirname));

app.get('/', (req, res)=>{
	res.redirect('/virtuosity.html');
});