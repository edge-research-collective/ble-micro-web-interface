import "./App.scss";
import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import SetupWifi from "./SetupWifi";
import BLEDevice from "./BLEDevice";

function App() {
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [device, setDevice] = useState();
  return (
    <Router>
      <div className="App">
        <Header device={device} />
        <Wrapper>
          <Sidebar />
          <div className="Body">
            <Switch>
              <Route path="/setup-wifi">
                <SetupWifi device={device} />
              </Route>
              <Route path="/">
                <Connect device={device} setDevice={setDevice} />
              </Route>
            </Switch>
          </div>
        </Wrapper>
      </div>
    </Router>
  );
}

function Header({ device }) {
  return (
    <div className="Header">
      <h1>The Thing!</h1>
      <h5
        className={`device-connected ${device ? "connected" : "disconnected"}`}
      >
        {device ? device.name : "disconnected"}
      </h5>
    </div>
  );
}

function Wrapper({ children }) {
  return <div className="Wrapper">{children}</div>;
}

function Sidebar() {
  return (
    <div className="Sidebar">
      <ul>
        <li>
          <Link to="/">Connect</Link>
        </li>
        <li>
          <Link to="/setup-wifi">Setup Wifi</Link>
        </li>
      </ul>
    </div>
  );
}

function Connect({ device, setDevice }) {
  const [namePrefix, setNamePrefix] = useState("Heltec");

  async function connectToDevice() {
    const newDevice = new BLEDevice();
    try {
      await newDevice.connect({ namePrefix });
    } catch (e) {
      console.error(e);
      return;
    }
    setDevice(newDevice);
  }

  return (
    <div>
      <h1>Welcome!</h1>
      <h2>Let's Connect to your BLE device.</h2>
      <label>Device Name Prefix</label>
      <input
        type="text"
        value={namePrefix}
        onChange={(e) => setNamePrefix(e.target.value)}
      ></input>
      <p>
        {namePrefix.length
          ? `We'll look for devices with Bluetooth names starting with "${namePrefix}".`
          : `We'll look for all devices.`}
      </p>
      <button onClick={connectToDevice}>Connect</button>
      <br />
      {device ? <small>Connected to {device.name}.</small> : ""}
    </div>
  );
}

export default App;
