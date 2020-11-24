import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
export default function SetupWifi({ device }) {
  const [wifiConnected, setWifiConnected] = useState(false);
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [availableNetworks, setAvailableNetworks] = useState([]);

  console.log("WIFI");
  useEffect(() => {
    console.log("EFFECT");
    if (!device) return;
    device.addMessageHandler("WIFI_STATUS", (m) => {
      if (m.status === "CONNECTED") {
        setWifiConnected(true);
        setWifiSsid(m.ssid);
      } else {
        // disconnectAndFindNetworks();
      }
    });

    device.addMessageHandler("WIFI_NETWORKS", (m) => {
      setAvailableNetworks(m.networks);
    });

    getStatus();
    return () => {
      device.removeMessageHandler("WIFI_STATUS");
      device.removeMessageHandler("WIFI_NETWORKS");
    };
  }, [device]);

  function disconnectAndFindNetworks() {
    device.sendMessage({ command: "WIFI_SEARCH" });
  }

  function getStatus() {
    device.sendMessage({ command: "WIFI_STATUS" });
  }

  function connect() {
    device.sendMessage({
      command: "WIFI_CONNECT",
      SSID: wifiSsid,
      password: wifiPassword,
    });
  }

  if (!device) {
    return (
      <h1>
        Please <Link to="/">connect to a device</Link> first.
      </h1>
    );
  }
  if (wifiConnected) {
    return (
      <>
        <h1>Wifi connected to {wifiSsid}.</h1>
        <button onClick={disconnectAndFindNetworks}>Disconnect</button>
      </>
    );
  }
  return (
    <div>
      <h1>Setup Wifi</h1>
      <label>Network</label>
      <button onClick={disconnectAndFindNetworks}>Search for Networks</button>
      <select value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)}>
        {availableNetworks.map((n) => (
          <option value={n.SSID} key={n.SSID}>
            {n.SSID}
          </option>
        ))}
      </select>
      {/* <small>Or custom name</small>
      <input /> */}
      <label>Password</label>
      <input
        type="text"
        value={wifiPassword}
        onChange={(e) => setWifiPassword(e.target.value)}
      />
      <button onClick={connect}>Connect</button>
    </div>
  );
}
