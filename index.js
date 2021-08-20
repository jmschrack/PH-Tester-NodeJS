const express = require('express');
console.log(require('dotenv').config({path: __dirname + '/.env'}));
console.log(__dirname);
const app = express();
const {Arduino} = require('./arduino.js')
const arduino = new Arduino('/dev/ttyACM0');


app.get('/', (req,res)=>{
	console.log(' entered /');
	//res.send('Hello World!');
	Get_pH().then(data=>{
		res.send('Current pH:'+data);
	}).catch(err=>{
		res.send('Error?');
		console.log(err);
	});
});

app.listen(process.env.port, ()=>{
	console.log(`Listening at ${process.env.port}`);
});


function Get_pH(){
	return new Promise( (resolve,reject)=>{
		arduino.once('pH',function(data){
			const pH=Number.parseFloat(data);
			if(Number.isNaN(pH)){
				reject(`Invalid data from arduino:${data}`);
			}else{
				resolve(pH);
			}
		});
		console.log('Get_pH::sending arduino signal');
		arduino.send('get_ph');
	});
}




console.log('Pinging Arduino');
arduino.port.write('ping\r');
