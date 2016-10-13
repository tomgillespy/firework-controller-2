console.log('Starting Render Process');

var ko = require('./resource/knockout.js');
var m = require('./viewModel.js');

var vm = new m.viewModel();
ko.applyBindings(vm);

//Setup UDP autodiscovery server

setTimeout(function() {vm.tobs('Hellllllo'); console.log('Observable Set');}, 3000);

var PORT = 6000;
var dgram = require('dgram');
var server = dgram.createSocket({ type: "udp4", reuseAddr: true });
server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
    vm.udpListen(true);
});
server.on('message', function (message, remote) {
    vm.node_connection(remote.address, message);
});
server.bind(PORT, '0.0.0.0', false);
