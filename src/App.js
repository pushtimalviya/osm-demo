import React from "react";
import "./style.css";
import Map from "./Map";
import data from "./geoData.json";
import 'leaflet/dist/leaflet.css';


export default function App() {
  return (
    <Map  center={[20.5937, 78.9629]} zoom={4} data={data} />
  );
}
