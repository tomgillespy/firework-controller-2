var ko = require('./resource/knockout.js');

var fworknode = function(address, nodename) {
  var self = this;
  self.nodename = ko.observable(nodename);
  self.orignodename = nodename;
  self.address = address;
  self.isActive = ko.observable(false);
  self.ws_connection = new WebSocket('ws://' + address + ':8080');
  self.ws_connection.onopen = function() {
    self.isActive(true);
  };
  self.ws_connection.onMessage = function(e) {
    console.log('Node Message Recieved: ' + e.data);
  }
  console.log('Setup ' + nodename + ' complete');
}

var appViewModel = function() {
  var self = this;
  self.tobs = ko.observable();
  self.udpListen = ko.observable(false);

  self.nodes = ko.observableArray();
  self.node_connection = function(address, nodename) {
    console.log('Attempting to Add ' + address + ' to nodes. They identified as ' + nodename);
    var isConnected = false;
    ko.utils.arrayForEach(self.nodes(), function(node) {
      if (node.address == address) {
        isConnected = true;
      }
    });
    if (!isConnected) {
      console.log('Not connected to ' + address + ', connecting now.');
      self.nodes.push(new fworknode(address, nodename));
    } else {
      console.log('Already connected to ' + address);
    }
  }
}
exports.viewModel = appViewModel;
