const express = require('express');
require('dotenv').config({path: __dirname + '/.env'});
console.log(__dirname);
const app = express();
const {Arduino} = require('./arduino.js')
const arduino = new Arduino('/dev/ttyACM0');
const cron = require('node-cron');

const pHRecords=[];
const maxRecords=24*12;

app.use(express.static('public'));

app.get('/api/pH', (req,res)=>{
	Get_pH_avg().then(data=>{
		res.send(data.toFixed(2));
	}).catch(err=>{
		res.send('Error?');
		console.log(err);
	});
});

app.get('/api/pH-history',(req,res)=>{
	res.send(JSON.stringify(pHRecords));
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
					arduino.disableStream();
					resolve(pH/count);
				}
			}catch(err){reject(err);}
		}
		//console.log('sending read_data');
		arduino.on('pH',Sum_pH);
		arduino.enableStream();
	});
}

cron.schedule('*/5 * * * *', () => {
//  console.log('running a task every two minutes');
	Get_pH().then(data=>{
		pHRecords.push({time:Date.now(),pH:data});
		if(pHRecords.length>maxRecords){
			pHRecords.shift();
		}
	});
});



console.log('Pinging Arduino');
arduino.once('ping',()=>{
	console.log('Arduino online!');
});
arduino.port.write('ping\r');

