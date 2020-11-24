import str2ab from "string-to-arraybuffer";
import ab2str from "arraybuffer-to-string";

const UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHARACTERISTIC = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

export default class BLEDevice {
  constructor() {
    this._messageHandlers = [];
    this.connected = false;
  }
  async connect({ namePrefix }) {
    this._device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix }],
      optionalServices: [UART_SERVICE],
    });
    if (!this._device) return;
    this.name = this._device.name;
    this._server = await this._device.gatt.connect();
    this._service = await this._server.getPrimaryService(UART_SERVICE);
    this._characteristicRx = await this._service.getCharacteristic(
      UART_RX_CHARACTERISTIC
    );
    this._characteristicTx = await this._service.getCharacteristic(
      UART_TX_CHARACTERISTIC
    );
    this._characteristicTx.startNotifications();
    this._characteristicTx.addEventListener(
      "characteristicvaluechanged",
      (e) => {
        const message = JSON.parse(ab2str(e.target.value.buffer));
        this._handleMessage(message);
      }
    );
  }

  addMessageHandler(name, handler) {
    this._messageHandlers.push({ name, handler });
    console.log(this._messageHandlers);
  }

  removeMessageHandler(name) {
    const index = this._messageHandlers.findIndex((h) => h.name === name);
    if (index > -1) {
      this._messageHandlers.splice(index, 1);
    }
  }

  async sendMessage(message) {
    console.log("SENDING", message);
    const payload = str2ab(JSON.stringify(message));
    await this._characteristicRx.writeValue(payload);
  }

  _handleMessage(message) {
    console.log("TX VALUE CHANGE");
    console.log({ TxVal: message });
    const { payload } = message;
    const { handler } = this._messageHandlers.find((h) => h.name === payload);
    if (!handler) {
      console.warn(
        `Received message with payload ${payload}. No handler found!`
      );
      return;
    }
    handler(message);
  }
}
