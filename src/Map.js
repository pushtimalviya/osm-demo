import React, { useState, useEffect } from "react";
import { Map, TileLayer, FeatureGroup, useLeaflet } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

const data =  [
  [
      [
        21.616579336740603,
        77.12016769252767
      ],
      [
        22.268764039073968,
        78.48223569073234
      ],
      [
        19.642587534013032,
        79.27311388323828
      ],
      [
        18.8543103618898,
        76.68079091891325
      ]
    ]
];

function EditableLayer(props) {
  const leaflet = useLeaflet();
  const editLayerRef = React.useRef();
  let drawControlRef = React.useRef();
  let {map} = leaflet;

  useEffect(() => {
    
    if (!props.showDrawControl) {
      map.removeControl(drawControlRef.current);
    } else {
      map.addControl(drawControlRef.current);
    }

    editLayerRef.current.leafletElement.clearLayers();
    editLayerRef.current.leafletElement.addLayer(props.layer);

    props.layer.on("click", function (e) {
      props.onLayerClicked(e, drawControlRef.current);
    });

  }, [props, map]);

  function onMounted(ctl) {
    drawControlRef.current = ctl;
  }

  const onCreat = e => {
    const { layerType, layer } = e;

    if (layerType === "polygon") {
        const coordinates = [];
        const latlngs = layer.getLatLngs()[0];

        for (var i = 0; i < latlngs.length; i++) {
          coordinates.push([latlngs[i].lat, latlngs[i].lng])
        }

        data.push(coordinates);
        props.updateCoordinates(data);
    }
  };

  const onEdit = e => {
    console.log(e);
    const { layers: { _layers } } = e;

    Object.values(_layers).map(({ _leaflet_id, editing }) => {
      console.log("_leaflet_id.....", )
    })
}

  return (
    <div>
      <FeatureGroup ref={editLayerRef}>
        <EditControl
          position="topright"
          onMounted={onMounted}
          onCreated={onCreat}
          onEdited={onEdit}
          {...props}
        />
      </FeatureGroup>
    </div>
  );
 }
 
function EditableGroup(props) {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);

  const [layer, setLayer] = useState(props.data)

  function updateCoordinates(newLayers){
    // console.log("state reset called",newLayers)
    setLayer(newLayers)
    console.log("state reset called",newLayers)
  }

  function handleLayerClick(e, drawControl) {
    setSelectedLayerIndex(e.target.feature.properties.editLayerId);
  }

  const polyLayerData =   {
    "type": "FeatureCollection",
    "features": []
  }

  for (let i = 0; i < layer.length ; i++ ) { 

    const geojson = {};
    geojson['type'] = 'Feature';
    geojson['properties'] = {};
    geojson['geometry'] = {};
    geojson['geometry']['type'] = "Polygon";

    // export the coordinates from the layer
    const coordinates = [];
    const latlngs = layer[i];

    for (let i = 0; i < latlngs.length; i++) {
        coordinates.push([latlngs[i][1], latlngs[i][0]])
    }

    geojson['geometry']['coordinates'] = [coordinates];
    polyLayerData.features.push(geojson)
  }

    let dataLayer = new L.GeoJSON(polyLayerData);
    let layers = [];
    let i = 0;

  dataLayer.eachLayer((layer) => {
    // console.log("leaflet id", layer._leaflet_id)
    layer.feature.properties.editLayerId = i;
    layers.push(layer);
    i++;
  });

 

  return (
    <div>
      {layers.map((layer, i) => {
        return (
          <EditableLayer
            updateCoordinates= {updateCoordinates}
            key={i}
            layer={layer}
            showDrawControl={i === selectedLayerIndex}
            onLayerClicked={handleLayerClick}
          />
        );
      })}
    </div>
  );
}

function MapExample(props) {

  const position = [20.5937, 78.9629];

  return (
    <Map 
      center={position}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "100Vh", width: "80%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <EditableGroup data={data}  />
    </Map>
  );
}

export default MapExample;
