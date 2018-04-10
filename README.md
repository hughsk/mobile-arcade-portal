# Mobile Arcade Captive Portal Server

## Developing locally

Before you can run the server on your machine, you need to first install [Node.js](https://nodejs.org/). Then open a new terminal window, clone this repository and install the server's dependencies:

``` bash
git clone git@github.com:hughsk/mobile-arcade.git
cd mobile-arcade/CaptivePortal
npm install
```

After that, you can run the following from this directory to start the server:

``` bash
npm start
```

This will open a server on `http://localhost:3000/`. You can access it from this address on your computer, or alternatively find out your local IP address (e.g. `http://192.168.0.12:3000/`) using `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to access it from a phone that is connected to the same WiFi network.

Note that this will not always work on every network. If you're not able to connect to the server from your phone, I would recommend running a WiFi hotspot from that phone and connecting to that from your computer.