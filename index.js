const express = require('express');
require('dotenv').config({path: __dirname + '/.env'});
console.log(__dirname);
const app = express();
const {Arduino} = require('./arduino.js')
const arduino = new Arduino('/dev/ttyACM0');

app.use(express.static('public'));

app.get('/api/pH', (req,res)=>{
	Get_pH_avg().then(data=>{
		res.send(data.toFixed(2));
	}).catch(err=>{
		res.send('Error?');
		console.log(err);
	});
});

app.get('/', (req,res)=>{
	res.sendFile(__dirname+'/index.html');
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
		//console.log('Get_pH::sending arduino signal');
		arduino.send('get_ph');
	});
}

function Get_pH_avg(){
	return new Promise( (resolve,reject)=>{
		let pH=0;
		let count=0;
		function Sum_pH(data){
			//console.log('Sum_pH::Entered');
			try{
				const n=Number.parseFloat(data);
				if(Number.isNaN(n)){
					console.log(`Invalid data from arduino:${JSON.stringify(data)}`);
					return;
				}
				pH+=n;
				count++;
				if(count>5){
					//console.log('Sum_pH::removing listener');
					arduino.removeListener('pH',Sum_pH);
					arduino.send('stop_data');
					resolve(pH/count);
				}
			}catch(err){reject(err);}
		}
		//console.log('sending read_data');
		arduino.on('pH',Sum_pH);
		arduino.send('read_data');
	});
}


console.log('Pinging Arduino');
arduino.once('ping',()=>{
	console.log('Arduino online!');
});
arduino.port.write('ping\r');

