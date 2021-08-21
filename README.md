# PH-Tester-NodeJS

For use with the Atlas Scientific Analog Kit.  This assumes the kit is being read by an arduino, which is then passing data over USB to the Raspberry Pi.

The Arduino class handles reading and writing.  Data is read in, parsed, and then appropriate events are fired.

# Setup

This requires node. `sudo apt install node` 

1. Install dependencies
	```npm init```

2. Create the .env configuration file.
	```echo "port=80" > .env``` 

3. Run it!
	```npm start```

## Can't install Node?

https://hassancorrigan.com/blog/install-nodejs-on-a-raspberry-pi-zero/

## EACCESS permission denied 0.0.0.0:80  ?

By default, port 80 is blocked unless you're running as root.  Let's not do that. Instead, we'll give node special access to port 80.


```
sudo apt-get install libcap2-bin 
sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``
``` 


# Install as service	

1. Copy .setup/hydroponic.service to /lib/systemd/system/hydroponic.service
2. sudo systemctl reload-daemons
3. sudo systemctl enable hydroponic
4. sudo systemctl start hydroponic

To check the log output, use ```sudo systemctl status hydroponic```
