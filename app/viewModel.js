var ko = require('./resource/knockout.js');

var fworkchannel = function(address, parent) {
  var self = this;
  self.parent = parent;
  self.address = ko.observable(address);
  self.connected = ko.observable(false);
  self.colourclass = ko.computed(function() {
    if (self.connected() == false) {
      return 'bg-red';
    }
    if (self.parent.isArmed() == true) {
      return 'bg-green';
    }
    if ((self.parent.isArmed() == false) && (self.connected() == true)) {
      return 'bg-blue';
    }
  });
}

var fworknode = function(address, nodename, parent) {
  var self = this;
  self.parent = parent; //I'm passing this is so I cam remove the node if it loses the connection.
  self.nodename = ko.observable(nodename);
  self.orignodename = nodename;
  self.address = address;
  self.channels = ko.observableArray();
  self.processchannels = function(number) {
    for(i = 1; i <= number; i++) {
      self.channels.push(new fworkchannel(i, self));
    }
  };
  self.gridclass = ko.computed(function() {
    return 'cells' + self.channels().length;
  });
  self.isActive = ko.observable(false);
  self.isArmed = ko.observable(false);
  self.ws_connection = new WebSocket('ws://' + address + ':8080');
  self.ws_connection.onmessage = function(e) {
    console.log('Node Message Recieved: ' + e.data);
    var data = JSON.parse(e.data);
    switch(data.event) {
      case 'connection':
          self.nodename(data.name);
          self.processchannels(data.channels);
          break;
      case 'arm':
          self.isArmed(true);
          break;
      case 'disarm':
          self.isArmed(false);
          break;
      case 'connected':
          self.channels()[data.channel - 1].connected(true);
          break;
      case 'disconnected':
          self.channels()[data.channel - 1].connected(false);
          break;
    }
  }
  self.ws_connection.onopen = function(e) {
    self.isActive(true);
    console.log(e);
  };
  self.ws_connection.onclose = function(e) {
    self.isActive(false);
    showDialog('Connection Lost', self.nodename() + ' is no longer available', 'alert');
    self.parent.nodes.remove(self);
  }
  console.log('Setup ' + nodename + ' complete');
}

var appViewModel = function() {
  var self = this;
  self.tobs = ko.observable();
  self.udpListen = ko.observable(false);

  self.nodes = ko.observableArray();
  self.node_connection = function(address, nodename) {
    var isConnected = false;
    ko.utils.arrayForEach(self.nodes(), function(node) {
      if (node.address == address) {
        isConnected = true;
      }
    });
    if (!isConnected) {
      console.log('Not connected to ' + address + ', connecting now.');
      self.nodes.push(new fworknode(address, nodename, self));
    } else {
      console.log('Already connected to ' + address);
    }
  }
}
exports.viewModel = appViewModel;
