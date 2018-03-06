var events = require('events');
var util = require('util');

var debug = require('debug')('hci-usb');
var usb = require('usb');

var HCI_COMMAND_PKT = 0x01;
var HCI_ACLDATA_PKT = 0x02;
var HCI_EVENT_PKT = 0x04;

var OGF_HOST_CTL = 0x03;
var OCF_RESET = 0x0003;

function BluetoothHciSocket() {
  this._isUp = false;

  this._hciEventEndpointBuffer = new Buffer(0);
  this._aclDataInEndpointBuffer = new Buffer(0);
}

util.inherits(BluetoothHciSocket, events.EventEmitter);

BluetoothHciSocket.prototype.setFilter = function(filter) {
  // no-op
};

BluetoothHciSocket.prototype.bindRaw = function(devId) {
  this.bindUser(devId);

  this._mode = 'raw';

  this.reset();
};

BluetoothHciSocket.prototype.bindUser = function(devId) {
  this._mode = 'user';

  if (process.env.BLUETOOTH_HCI_SOCKET_USB_VID && process.env.BLUETOOTH_HCI_SOCKET_USB_PID) {
    var usbVid = parseInt(process.env.BLUETOOTH_HCI_SOCKET_USB_VID);
    var usbPid = parseInt(process.env.BLUETOOTH_HCI_SOCKET_USB_PID);

    debug('using USB VID = ' + usbVid + ', PID = ' + usbPid);

    if (process.env.BLUETOOTH_HCI_SOCKET_USB_BUS && process.env.BLUETOOTH_HCI_SOCKET_USB_ADDRESS) {
      var usbBus = parseInt(process.env.BLUETOOTH_HCI_SOCKET_USB_BUS);
      var usbAddress = parseInt(process.env.BLUETOOTH_HCI_SOCKET_USB_ADDRESS);

      debug('using USB BUS = ' + usbBus + ', Address = ' + usbAddress);

      var usbDevices = usb.getDeviceList();


      for (var i = 0; i < usbDevices.length; i++) {
        var usbDeviceDesc = usbDevices[i].deviceDescriptor;

        if ((usbDeviceDesc.idVendor == usbVid) &&
            (usbDeviceDesc.idProduct == usbPid) &&
            (usbDevices[i].busNumber == usbBus) &&
            (usbDevices[i].deviceAddress == usbAddress)) {
          this._usbDevice = usbDevices[i];
        }
      }
    } else {
      this._usbDevice = usb.findByIds(usbVid, usbPid);
    }
  } else {

          //console.dir(usb.getDeviceList())
          var usb_device_list = usb.getDeviceList()
          for (index in usb_device_list) {
            found_device = usb_device_list[index]
            if(found_device.deviceDescriptor.bDeviceClass == 224 &&
              found_device.deviceDescriptor.bDeviceProtocol == 1 &&
              found_device.deviceDescriptor.bDeviceSubClass == 1
              ) {
                  this._usbDevice = found_device
                  break;
                }
          }

          if(!this._usbDevice) {
            this._usbDevice =
            usb.findByIds(0x0CF3, 0xE300) || // Qualcomm Atheros QCA61x4
            usb.findByIds(0x0a5c, 0x21e8) || // Broadcom BCM20702A0
            usb.findByIds(0x19ff, 0x0239) || // Broadcom BCM20702A0
            usb.findByIds(0x0a12, 0x0001) || // CSR
            usb.findByIds(0x0b05, 0x17cb) || // ASUS BT400
            usb.findByIds(0x8087, 0x07da) || // Intel 6235
            usb.findByIds(0x8087, 0x07dc) || // Intel 7260
            usb.findByIds(0x8087, 0x0a2a) || // Intel 7265
            usb.findByIds(0x0489, 0xe07a) || // Broadcom BCM20702A1
            usb.findByIds(0x0a5c, 0x6412) || // Broadcom BCM2045A0
            usb.findByIds(0x050D, 0x065A) || // Belkin BCM20702A0
            usb.findByIds(0x03ee, 0x641f) ||
            usb.findByIds(0x03ee, 0x6438) ||
            usb.findByIds(0x03ee, 0x6440) ||
            usb.findByIds(0x03f0, 0x011d) ||
            usb.findByIds(0x03f0, 0x051d) ||
            usb.findByIds(0x03f0, 0x0624) ||
            usb.findByIds(0x03f0, 0x0c24) ||
            usb.findByIds(0x03f0, 0x171d) ||
            usb.findByIds(0x03f0, 0x181d) ||
            usb.findByIds(0x03f0, 0x231d) ||
            usb.findByIds(0x03f0, 0x2a1d) ||
            usb.findByIds(0x03f0, 0x311d) ||
            usb.findByIds(0x03f0, 0xd104) ||
            usb.findByIds(0x0400, 0x0807) ||
            usb.findByIds(0x0400, 0x080a) ||
            usb.findByIds(0x040a, 0x5012) ||
            usb.findByIds(0x041e, 0x5015) ||
            usb.findByIds(0x0442, 0xabba) ||
            usb.findByIds(0x044e, 0x2014) ||
            usb.findByIds(0x044e, 0x3001) ||
            usb.findByIds(0x044e, 0x3002) ||
            usb.findByIds(0x044e, 0x3003) ||
            usb.findByIds(0x044e, 0x3004) ||
            usb.findByIds(0x044e, 0x3005) ||
            usb.findByIds(0x044e, 0x3006) ||
            usb.findByIds(0x044e, 0x3007) ||
            usb.findByIds(0x044e, 0x300c) ||
            usb.findByIds(0x044e, 0x300d) ||
            usb.findByIds(0x044e, 0x3010) ||
            usb.findByIds(0x044e, 0x3017) ||
            usb.findByIds(0x044e, 0xffff) ||
            usb.findByIds(0x0451, 0x1234) ||
            usb.findByIds(0x0451, 0xffff) ||
            usb.findByIds(0x0458, 0x0061) ||
            usb.findByIds(0x0458, 0x0083) ||
            usb.findByIds(0x045e, 0x007e) ||
            usb.findByIds(0x045e, 0x009c) ||
            usb.findByIds(0x045e, 0x02b6) ||
            usb.findByIds(0x045e, 0x0708) ||
            usb.findByIds(0x045e, 0x070a) ||
            usb.findByIds(0x045e, 0x0745) ||
            usb.findByIds(0x0461, 0x4d75) ||
            usb.findByIds(0x046d, 0x0b02) ||
            usb.findByIds(0x046d, 0xb014) ||
            usb.findByIds(0x046d, 0xc054) ||
            usb.findByIds(0x046d, 0xc703) ||
            usb.findByIds(0x046d, 0xc705) ||
            usb.findByIds(0x046d, 0xc707) ||
            usb.findByIds(0x046d, 0xc708) ||
            usb.findByIds(0x046d, 0xc70d) ||
            usb.findByIds(0x046d, 0xc70e) ||
            usb.findByIds(0x046d, 0xc70f) ||
            usb.findByIds(0x046d, 0xc712) ||
            usb.findByIds(0x046d, 0xc715) ||
            usb.findByIds(0x046d, 0xc71a) ||
            usb.findByIds(0x046d, 0xc71d) ||
            usb.findByIds(0x046d, 0xc720) ||
            usb.findByIds(0x0471, 0x0809) ||
            usb.findByIds(0x0471, 0x1201) ||
            usb.findByIds(0x047d, 0x105d) ||
            usb.findByIds(0x047d, 0x105e) ||
            usb.findByIds(0x047d, 0x1152) ||
            usb.findByIds(0x047f, 0x4254) ||
            usb.findByIds(0x0483, 0x5000) ||
            usb.findByIds(0x0483, 0x5001) ||
            usb.findByIds(0x0489, 0xe00d) ||
            usb.findByIds(0x0489, 0xe00f) ||
            usb.findByIds(0x0489, 0xe011) ||
            usb.findByIds(0x0489, 0xe02c) ||
            usb.findByIds(0x0489, 0xe032) ||
            usb.findByIds(0x0489, 0xe042) ||
            usb.findByIds(0x0489, 0xe04d) ||
            usb.findByIds(0x049f, 0x0027) ||
            usb.findByIds(0x049f, 0x0036) ||
            usb.findByIds(0x049f, 0x0086) ||
            usb.findByIds(0x04ad, 0x2501) ||
            usb.findByIds(0x04bf, 0x0309) ||
            usb.findByIds(0x04bf, 0x030a) ||
            usb.findByIds(0x04bf, 0x030b) ||
            usb.findByIds(0x04bf, 0x030c) ||
            usb.findByIds(0x04bf, 0x0310) ||
            usb.findByIds(0x04bf, 0x0311) ||
            usb.findByIds(0x04bf, 0x0317) ||
            usb.findByIds(0x04bf, 0x0318) ||
            usb.findByIds(0x04bf, 0x0319) ||
            usb.findByIds(0x04bf, 0x0320) ||
            usb.findByIds(0x04bf, 0x0321) ||
            usb.findByIds(0x04ca, 0x2004) ||
            usb.findByIds(0x04ca, 0x2006) ||
            usb.findByIds(0x04ca, 0x2007) ||
            usb.findByIds(0x04ca, 0x3005) ||
            usb.findByIds(0x04ca, 0x300b) ||
            usb.findByIds(0x04ca, 0x300d) ||
            usb.findByIds(0x04ca, 0x300f) ||
            usb.findByIds(0x04ca, 0x3014) ||
            usb.findByIds(0x04d7, 0x1be4) ||
            usb.findByIds(0x04e8, 0x7021) ||
            usb.findByIds(0x0506, 0x00a0) ||
            usb.findByIds(0x0506, 0x00a1) ||
            usb.findByIds(0x0506, 0x00a2) ||
            usb.findByIds(0x050d, 0x0012) ||
            usb.findByIds(0x050d, 0x0013) ||
            usb.findByIds(0x050d, 0x0017) ||
            usb.findByIds(0x050d, 0x0081) ||
            usb.findByIds(0x050d, 0x0083) ||
            usb.findByIds(0x050d, 0x0084) ||
            usb.findByIds(0x050d, 0x0131) ||
            usb.findByIds(0x050d, 0x016a) ||
            usb.findByIds(0x050d, 0x065a) ||
            usb.findByIds(0x0519, 0xc002) ||
            usb.findByIds(0x0525, 0x100d) ||
            usb.findByIds(0x0525, 0xa220) ||
            usb.findByIds(0x0547, 0x0001) ||
            usb.findByIds(0x0547, 0x7777) ||
            usb.findByIds(0x055d, 0x0bb1) ||
            usb.findByIds(0x057c, 0x3800) ||
            usb.findByIds(0x057e, 0x0305) ||
            usb.findByIds(0x05a7, 0x4000) ||
            usb.findByIds(0x05a7, 0x4001) ||
            usb.findByIds(0x05a7, 0x4002) ||
            usb.findByIds(0x05a7, 0x4003) ||
            usb.findByIds(0x05ac, 0x1000) ||
            usb.findByIds(0x05ac, 0x8203) ||
            usb.findByIds(0x05ac, 0x8204) ||
            usb.findByIds(0x05ac, 0x8205) ||
            usb.findByIds(0x05ac, 0x8206) ||
            usb.findByIds(0x05ac, 0x820a) ||
            usb.findByIds(0x05ac, 0x820b) ||
            usb.findByIds(0x05ac, 0x820f) ||
            usb.findByIds(0x05ac, 0x8213) ||
            usb.findByIds(0x05ac, 0x8215) ||
            usb.findByIds(0x05ac, 0x8216) ||
            usb.findByIds(0x05ac, 0x8217) ||
            usb.findByIds(0x05ac, 0x8218) ||
            usb.findByIds(0x05ac, 0x821a) ||
            usb.findByIds(0x05ac, 0x821f) ||
            usb.findByIds(0x05ac, 0x8281) ||
            usb.findByIds(0x05ac, 0x8286) ||
            usb.findByIds(0x05ac, 0x828c) ||
            usb.findByIds(0x05ac, 0x8290) ||
            usb.findByIds(0x05ac, 0xffff) ||
            usb.findByIds(0x05b1, 0x1389) ||
            usb.findByIds(0x05d1, 0x0003) ||
            usb.findByIds(0x05e1, 0x0100) ||
            usb.findByIds(0x0609, 0xff12) ||
            usb.findByIds(0x070a, 0x4002) ||
            usb.findByIds(0x070a, 0x4003) ||
            usb.findByIds(0x07b8, 0xb02a) ||
            usb.findByIds(0x07b8, 0xb02b) ||
            usb.findByIds(0x07d1, 0xf101) ||
            usb.findByIds(0x07d1, 0xfc01) ||
            usb.findByIds(0x083a, 0xbb01) ||
            usb.findByIds(0x0858, 0x3102) ||
            usb.findByIds(0x085a, 0x003c) ||
            usb.findByIds(0x08ea, 0xabba) ||
            usb.findByIds(0x08ea, 0xabbb) ||
            usb.findByIds(0x08fd, 0x0001) ||
            usb.findByIds(0x0930, 0x0200) ||
            usb.findByIds(0x0930, 0x021c) ||
            usb.findByIds(0x0930, 0x0501) ||
            usb.findByIds(0x0930, 0x0502) ||
            usb.findByIds(0x0930, 0x0503) ||
            usb.findByIds(0x0930, 0x0505) ||
            usb.findByIds(0x0930, 0x0506) ||
            usb.findByIds(0x0930, 0x0507) ||
            usb.findByIds(0x0930, 0x0508) ||
            usb.findByIds(0x09d3, 0x000b) ||
            usb.findByIds(0x0a12, 0x0001) ||
            usb.findByIds(0x0a12, 0x0002) ||
            usb.findByIds(0x0a12, 0x0043) ||
            usb.findByIds(0x0a12, 0x1000) ||
            usb.findByIds(0x0a12, 0x1010) ||
            usb.findByIds(0x0a12, 0x1011) ||
            usb.findByIds(0x0a12, 0x1012) ||
            usb.findByIds(0x0a12, 0xffff) ||
            usb.findByIds(0x0a5c, 0x2000) ||
            usb.findByIds(0x0a5c, 0x2001) ||
            usb.findByIds(0x0a5c, 0x2009) ||
            usb.findByIds(0x0a5c, 0x200a) ||
            usb.findByIds(0x0a5c, 0x200f) ||
            usb.findByIds(0x0a5c, 0x201d) ||
            usb.findByIds(0x0a5c, 0x201e) ||
            usb.findByIds(0x0a5c, 0x2020) ||
            usb.findByIds(0x0a5c, 0x2021) ||
            usb.findByIds(0x0a5c, 0x2033) ||
            usb.findByIds(0x0a5c, 0x2035) ||
            usb.findByIds(0x0a5c, 0x2039) ||
            usb.findByIds(0x0a5c, 0x2045) ||
            usb.findByIds(0x0a5c, 0x2046) ||
            usb.findByIds(0x0a5c, 0x2047) ||
            usb.findByIds(0x0a5c, 0x205e) ||
            usb.findByIds(0x0a5c, 0x2100) ||
            usb.findByIds(0x0a5c, 0x2101) ||
            usb.findByIds(0x0a5c, 0x2110) ||
            usb.findByIds(0x0a5c, 0x2120) ||
            usb.findByIds(0x0a5c, 0x2121) ||
            usb.findByIds(0x0a5c, 0x2122) ||
            usb.findByIds(0x0a5c, 0x2123) ||
            usb.findByIds(0x0a5c, 0x2130) ||
            usb.findByIds(0x0a5c, 0x2131) ||
            usb.findByIds(0x0a5c, 0x2145) ||
            usb.findByIds(0x0a5c, 0x2148) ||
            usb.findByIds(0x0a5c, 0x2150) ||
            usb.findByIds(0x0a5c, 0x2151) ||
            usb.findByIds(0x0a5c, 0x2154) ||
            usb.findByIds(0x0a5c, 0x216a) ||
            usb.findByIds(0x0a5c, 0x216c) ||
            usb.findByIds(0x0a5c, 0x216d) ||
            usb.findByIds(0x0a5c, 0x216f) ||
            usb.findByIds(0x0a5c, 0x2198) ||
            usb.findByIds(0x0a5c, 0x219b) ||
            usb.findByIds(0x0a5c, 0x21b1) ||
            usb.findByIds(0x0a5c, 0x21b4) ||
            usb.findByIds(0x0a5c, 0x21b9) ||
            usb.findByIds(0x0a5c, 0x21ba) ||
            usb.findByIds(0x0a5c, 0x21bb) ||
            usb.findByIds(0x0a5c, 0x21bc) ||
            usb.findByIds(0x0a5c, 0x21bd) ||
            usb.findByIds(0x0a5c, 0x21d7) ||
            usb.findByIds(0x0a5c, 0x21e6) ||
            usb.findByIds(0x0a5c, 0x21e8) ||
            usb.findByIds(0x0a5c, 0x22be) ||
            usb.findByIds(0x0a5c, 0x4500) ||
            usb.findByIds(0x0a5c, 0x6410) ||
            usb.findByIds(0x0b05, 0x1712) ||
            usb.findByIds(0x0b05, 0x1715) ||
            usb.findByIds(0x0b05, 0x1716) ||
            usb.findByIds(0x0b05, 0x173c) ||
            usb.findByIds(0x0b05, 0x1751) ||
            usb.findByIds(0x0b05, 0x1788) ||
            usb.findByIds(0x0b05, 0x17cb) ||
            usb.findByIds(0x0b05, 0x180a) ||
            usb.findByIds(0x0b05, 0x1825) ||
            usb.findByIds(0x0b05, 0xb700) ||
            usb.findByIds(0x0b62, 0x000b) ||
            usb.findByIds(0x0b7a, 0x07d0) ||
            usb.findByIds(0x0bdb, 0x1000) ||
            usb.findByIds(0x0bdb, 0x1002) ||
            usb.findByIds(0x0c24, 0x0001) ||
            usb.findByIds(0x0c24, 0x0002) ||
            usb.findByIds(0x0c24, 0x0005) ||
            usb.findByIds(0x0c24, 0x000b) ||
            usb.findByIds(0x0c24, 0x000c) ||
            usb.findByIds(0x0c24, 0x000e) ||
            usb.findByIds(0x0c24, 0x000f) ||
            usb.findByIds(0x0c24, 0x0010) ||
            usb.findByIds(0x0c24, 0x0012) ||
            usb.findByIds(0x0c24, 0x0018) ||
            usb.findByIds(0x0c24, 0x0019) ||
            usb.findByIds(0x0c24, 0x0021) ||
            usb.findByIds(0x0c24, 0x0c24) ||
            usb.findByIds(0x0c24, 0xffff) ||
            usb.findByIds(0x0cf3, 0x3000) ||
            usb.findByIds(0x0cf3, 0x3002) ||
            usb.findByIds(0x0cf3, 0x3004) ||
            usb.findByIds(0x0cf3, 0x3005) ||
            usb.findByIds(0x0cf3, 0x3007) ||
            usb.findByIds(0x0cf3, 0x3008) ||
            usb.findByIds(0x0cf3, 0x311f) ||
            usb.findByIds(0x0cf3, 0xe006) ||
            usb.findByIds(0x0d62, 0x2026) ||
            usb.findByIds(0x0d9a, 0x0001) ||
            usb.findByIds(0x0db0, 0x1967) ||
            usb.findByIds(0x0db0, 0x3801) ||
            usb.findByIds(0x0db0, 0x6855) ||
            usb.findByIds(0x0db0, 0x6881) ||
            usb.findByIds(0x0db0, 0x688a) ||
            usb.findByIds(0x0db0, 0x6970) ||
            usb.findByIds(0x0db0, 0x697a) ||
            usb.findByIds(0x0db0, 0xa970) ||
            usb.findByIds(0x0db0, 0xa97a) ||
            usb.findByIds(0x0db0, 0xb970) ||
            usb.findByIds(0x0db0, 0xb97a) ||
            usb.findByIds(0x0df6, 0x0004) ||
            usb.findByIds(0x0df6, 0x0007) ||
            usb.findByIds(0x0df6, 0x000b) ||
            usb.findByIds(0x0df6, 0x0019) ||
            usb.findByIds(0x0df6, 0x001a) ||
            usb.findByIds(0x0df6, 0x21f4) ||
            usb.findByIds(0x0df7, 0x0700) ||
            usb.findByIds(0x0df7, 0x0720) ||
            usb.findByIds(0x0df7, 0x0722) ||
            usb.findByIds(0x0df7, 0x0730) ||
            usb.findByIds(0x0e39, 0x0137) ||
            usb.findByIds(0x0e55, 0x110a) ||
            usb.findByIds(0x0e8d, 0x763e) ||
            usb.findByIds(0x0f4d, 0x1000) ||
            usb.findByIds(0x0fe0, 0x0100) ||
            usb.findByIds(0x0fe0, 0x0101) ||
            usb.findByIds(0x0fe0, 0x0200) ||
            usb.findByIds(0x1046, 0x8901) ||
            usb.findByIds(0x104f, 0x0009) ||
            usb.findByIds(0x105b, 0xe065) ||
            usb.findByIds(0x1076, 0x0031) ||
            usb.findByIds(0x1076, 0x0032) ||
            usb.findByIds(0x10ab, 0x1002) ||
            usb.findByIds(0x10ab, 0x1005) ||
            usb.findByIds(0x1131, 0x1001) ||
            usb.findByIds(0x1131, 0x1002) ||
            usb.findByIds(0x1131, 0x1003) ||
            usb.findByIds(0x1131, 0x1004) ||
            usb.findByIds(0x1310, 0x0001) ||
            usb.findByIds(0x13d3, 0x3249) ||
            usb.findByIds(0x13d3, 0x3250) ||
            usb.findByIds(0x13d3, 0x3304) ||
            usb.findByIds(0x13d3, 0x3315) ||
            usb.findByIds(0x13d3, 0x3362) ||
            usb.findByIds(0x13d3, 0x3375) ||
            usb.findByIds(0x13d3, 0x3394) ||
            usb.findByIds(0x13d3, 0x3474) ||
            usb.findByIds(0x1457, 0x5124) ||
            usb.findByIds(0x148f, 0x1000) ||
            usb.findByIds(0x1557, 0x0003) ||
            usb.findByIds(0x1668, 0x0441) ||
            usb.findByIds(0x1668, 0x1441) ||
            usb.findByIds(0x1668, 0x2441) ||
            usb.findByIds(0x1668, 0x3441) ||
            usb.findByIds(0x16ca, 0x1502) ||
            usb.findByIds(0x1d50, 0x5124) ||
            usb.findByIds(0x2001, 0xf111) ||
            usb.findByIds(0x22b8, 0x0850) ||
            usb.findByIds(0x22b8, 0x2035) ||
            usb.findByIds(0x413c, 0x8000) ||
            usb.findByIds(0x413c, 0x8010) ||
            usb.findByIds(0x413c, 0x8103) ||
            usb.findByIds(0x413c, 0x8106) ||
            usb.findByIds(0x413c, 0x8110) ||
            usb.findByIds(0x413c, 0x8111) ||
            usb.findByIds(0x413c, 0x8120) ||
            usb.findByIds(0x413c, 0x8126) ||
            usb.findByIds(0x413c, 0x8127) ||
            usb.findByIds(0x413c, 0x8131) ||
            usb.findByIds(0x413c, 0x8140) ||
            usb.findByIds(0x413c, 0x8156) ||
            usb.findByIds(0x413c, 0x8160) ||
            usb.findByIds(0x413c, 0x8187) ||
            usb.findByIds(0x413c, 0x8501) ||
            usb.findByIds(0x8086, 0x110a) ||
            usb.findByIds(0x8086, 0x110b)
          }
        }

  if (!this._usbDevice) {
    throw new Error('No compatible USB Bluetooth 4.0 device found!');
  }

  this._usbDevice.open();

  this._usbDeviceInterface = this._usbDevice.interfaces[0];

  this._aclDataOutEndpoint = this._usbDeviceInterface.endpoint(0x02);

  this._hciEventEndpoint = this._usbDeviceInterface.endpoint(0x81);
  this._aclDataInEndpoint = this._usbDeviceInterface.endpoint(0x82);

  this._usbDeviceInterface.claim();
};

BluetoothHciSocket.prototype.bindControl = function() {
  this._mode = 'control';
};

BluetoothHciSocket.prototype.isDevUp = function() {
  return this._isUp;
};

BluetoothHciSocket.prototype.start = function() {
  if (this._mode === 'raw' || this._mode === 'user') {
    this._hciEventEndpoint.on('data', this.onHciEventEndpointData.bind(this));
    this._hciEventEndpoint.startPoll();

    this._aclDataInEndpoint.on('data', this.onAclDataInEndpointData.bind(this));
    this._aclDataInEndpoint.startPoll();
  }
};

BluetoothHciSocket.prototype.stop = function() {
  if (this._mode === 'raw' || this._mode === 'user') {
    this._hciEventEndpoint.stopPoll();
    this._hciEventEndpoint.removeAllListeners();

    this._aclDataInEndpoint.stopPoll();
    this._aclDataInEndpoint.removeAllListeners();
  }
};

BluetoothHciSocket.prototype.write = function(data) {
  debug('write: ' + data.toString('hex'));

  if (this._mode === 'raw' || this._mode === 'user') {
    var type = data.readUInt8(0);

    if (HCI_COMMAND_PKT === type) {
      this._usbDevice.controlTransfer(usb.LIBUSB_REQUEST_TYPE_CLASS | usb.LIBUSB_RECIPIENT_INTERFACE, 0, 0, 0, data.slice(1), function() {});
    } else if(HCI_ACLDATA_PKT === type) {
      this._aclDataOutEndpoint.transfer(data.slice(1));
    }
  }
};

BluetoothHciSocket.prototype.onHciEventEndpointData = function(data) {
  debug('HCI event: ' + data.toString('hex'));

  if (data.length === 0) {
    return;
  }

  // add to buffer
  this._hciEventEndpointBuffer = Buffer.concat([
    this._hciEventEndpointBuffer,
    data
  ]);

  if (this._hciEventEndpointBuffer.length < 2) {
    return;
  }

  // check if desired length
  var pktLen = this._hciEventEndpointBuffer.readUInt8(1);
  if (pktLen <= (this._hciEventEndpointBuffer.length - 2)) {

    var buf = this._hciEventEndpointBuffer.slice(0, pktLen + 2);

    if (this._mode === 'raw' && buf.length === 6 && ('0e0401030c00' === buf.toString('hex') || '0e0402030c00' === buf.toString('hex'))) {
      debug('reset complete');
      this._isUp = true;
    }

    // fire event
    this.emit('data', Buffer.concat([
      new Buffer([HCI_EVENT_PKT]),
      buf
    ]));

    // reset buffer
    this._hciEventEndpointBuffer = this._hciEventEndpointBuffer.slice(pktLen + 2);
  }
};

BluetoothHciSocket.prototype.onAclDataInEndpointData = function(data) {
  debug('ACL Data In: ' + data.toString('hex'));

  if (data.length === 0) {
    return;
  }

  // add to buffer
  this._aclDataInEndpointBuffer = Buffer.concat([
    this._aclDataInEndpointBuffer,
    data
  ]);

  if (this._aclDataInEndpointBuffer.length < 4) {
    return;
  }

  // check if desired length
  var pktLen = this._aclDataInEndpointBuffer.readUInt16LE(2);
  if (pktLen <= (this._aclDataInEndpointBuffer.length - 4)) {

    var buf = this._aclDataInEndpointBuffer.slice(0, pktLen + 4);

    // fire event
    this.emit('data', Buffer.concat([
      new Buffer([HCI_ACLDATA_PKT]),
      buf
    ]));

    // reset buffer
    this._aclDataInEndpointBuffer = this._aclDataInEndpointBuffer.slice(pktLen + 4);
  }
};

BluetoothHciSocket.prototype.reset = function() {
  var cmd = new Buffer(4);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(OCF_RESET | OGF_HOST_CTL << 10, 1);

  // length
  cmd.writeUInt8(0x00, 3);

  debug('reset');
  this.write(cmd);
};

module.exports = BluetoothHciSocket;

