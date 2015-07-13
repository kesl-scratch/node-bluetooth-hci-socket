var events = require('events');

var binding = require('./build/Release/binding.node');
var BluetoothHciSocket = binding.BluetoothHciSocket;

inherits(BluetoothHciSocket, events.EventEmitter);

// extend prototype
function inherits(target, source) {
  for (var k in source.prototype) {
    target.prototype[k] = source.prototype[k];
  }
}

BluetoothHciSocket.prototype.getAddress = function() {
  return this.getAddressBytes().toString('hex').match(/.{1,2}/g).reverse().join(':');
};

BluetoothHciSocket.prototype.getAddressType = function() {
  return 'public';
};

module.exports = BluetoothHciSocket;
