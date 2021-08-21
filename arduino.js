const SerialPort = require('serialport');
const EventEmitter = require('events');

class Arduino extends EventEmitter {
	constructor(serialPort){
		super();
		this.port=new SerialPort(serialPort,{baudRate:9600},function(err){
			if(err){
				console.log("Error opening SerialPort");
			}else{
				console.log("Serial port is opened!");
			}
		});

		this.port.on('readable',()=>{
			const data = this.port.read().toString();
			//console.log(`Arduino::readable:${data}:${JSON.stringify(data)}`);
			if(data.startsWith('s:')){
				this.emit('status',data);	
			}else if(data.startsWith('c:')){
				this.emit('calibrate',data);
			}else if(data.startsWith('PONG')){
				this.emit('ping');
			}else{
				this.emit('pH',data);
			}
		});

		this.send=function(msg){
			if(!msg.endsWith('\r')) msg+='\r';
			//console.log('Arduino::send:'+msg);
			this.port.write(msg);
		}
	}
}

module.exports={Arduino};





