import React, { useState, useEffect } from "react";
import { Map, TileLayer, FeatureGroup, useLeaflet } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

let edit = false;

const data = [
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

  // console.log("props in layer function....", props)
  
  const leaflet = useLeaflet();
  const editLayerRef = React.useRef();
  let drawControlRef = React.useRef();
  let { map } = leaflet;

  useEffect(() => {

    if (!props.showDrawControl) {
      map.removeControl(drawControlRef.current);
    } else {
      map.addControl(drawControlRef.current);
    }

    editLayerRef.current.leafletElement.clearLayers();
    if (props.layer) {
      editLayerRef.current.leafletElement.clearLayers();
      editLayerRef.current.leafletElement.addLayer(props.layer);
      props.layer.on("click", function (e) {
        console.log("on layer click")
        props.onLayerClicked(e, drawControlRef.current);
      });
    }
  });

  const onMounted = (ctl) => {
    drawControlRef.current = ctl;
  }

  const onCreate = e => {
    const { layerType, layer } = e;

    if (layerType === "polygon") {
      const coordinates = [];
      const latlngs = layer.getLatLngs()[0];

      for (var i = 0; i < latlngs.length; i++) {
        coordinates.push([latlngs[i].lat, latlngs[i].lng])
      }

      props.addNewLayer(coordinates);
    }
  };

  const onEdit = async (e) => {
    
   const { layers: { _layers } } = e;

   Object.values(_layers).map(({ feature, _leaflet_id, editing }) => {

    const coordinates = [];
    const latlngs = editing.latlngs[0][0];

    for (var i = 0; i < latlngs.length; i++) {
      coordinates.push([latlngs[i].lat, latlngs[i].lng])
    }

    setTimeout(()=>{
      props.updateCoordinates(feature.properties.editLayerId, coordinates);

    },1000)

   })

  //  if(!edit){
  // edit = true; 
  //  }
  }

  const onDelete = async (e) => {
    
    const { layers: { _layers } } = e;
  
    console.log("event on delete...", e )

    if ( _layers && _layers.feature) {
      // console.log("delete event called....", _layers)

      props.removePolygonLayer(_layers.feature.properties.editLayerId)
    }
  }

  return (
    <div >
      <FeatureGroup ref={editLayerRef}>
        <EditControl
          position="topright"
          onMounted={onMounted}
          onCreated={onCreate}
          onEdited={onEdit}
          onDeleted={onDelete}
          {...props}
        />
      </FeatureGroup>
    </div>
    
  );
}

function EditableGroup(props) {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);

  const [polyLayer, setPolyLayer] = useState(props.data)

  function addNewLayer(coordinates) {

    setTimeout (()=> {
      if ( polyLayer.indexOf(coordinates) === -1 ) {
        setPolyLayer([
          ...polyLayer,
          coordinates,
        ]);
      }
    },1000)
    
  };

  function updateCoordinates(index, newCoordinates) {
    const newLayers = [...polyLayer];
    newLayers[index] = newCoordinates;

    setPolyLayer(newLayers)
    props.loadOnEdit(newLayers)
  }


  function removePolygonLayer(index) {
    console.log("index to be removed from array....", index)
    const newLayers = polyLayer.splice(index, 1)
    setPolyLayer(newLayers)
    props.loadOnEdit(newLayers)
  }

  function handleLayerClick(e, drawControl) {
    setSelectedLayerIndex(e.target.feature.properties.editLayerId);
    // alert("You clicked on layer "+e.target.feature.properties.editLayerId)
  }

  const polyLayerData = {
    "type": "FeatureCollection",
    "features": []
  }


  for (let i = 0; i < polyLayer.length; i++) {

    const geojson = {};
    geojson['type'] = 'Feature';
    geojson['properties'] = { editLayerId: i };
    geojson['geometry'] = {};
    geojson['geometry']['type'] = "Polygon";

    // export the coordinates from the polyLayer
    const coordinates = [];
    const latlngs = polyLayer[i];

    if (latlngs && latlngs.length > 0) {
      for (let i = 0; i < latlngs.length; i++) {
        coordinates.push([latlngs[i][1], latlngs[i][0]])
      }
  
      geojson['geometry']['coordinates'] = [coordinates];
      polyLayerData.features.push(geojson)
    }
  }

  let dataLayer = new L.GeoJSON(polyLayerData);
  let layers = [];
  let i = 0;

  dataLayer.eachLayer((layer) => {
    layer.feature.properties.editLayerId = i;
    layers.push(layer);
    i++;
  });


  return (
    <>
    <div style={{ display: "flex" }}>
      { layers.length > 0 ?
        layers.map((mapLayer, i) => {
          return (
            <EditableLayer
              addNewLayer={addNewLayer}
              updateCoordinates={updateCoordinates}
              removePolygonLayer={removePolygonLayer}
              layerLength={polyLayer.length}
              key={i}
              layer={mapLayer}
              showDrawControl={i === selectedLayerIndex}
              onLayerClicked={handleLayerClick}
            />
          );
        }) : (
          <EditableLayer
            addNewLayer={addNewLayer}
            removePolygonLayer={removePolygonLayer}
            key={0}
            showDrawControl={true}
            onLayerClicked={handleLayerClick}
          />
        )
      }
    </div>
    </>
  );
}

function MapExample(props) {

  const position = [20.5937, 78.9629];

  const [loadState, setLoadState] = useState(false)

  const loadOnEdit = (newPolyCoordinates) =>{
    console.log("load component called")
    setLoadState(true)
  }

  return (
    <div> 
     <Map
      center={position}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "100Vh", width: "80%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      <EditableGroup data={data} 
        loadOnEdit= { loadOnEdit }
      />
    </Map>
  
    </div>
  );
}

export default MapExample;
