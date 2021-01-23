import React, { useState, useEffect } from "react";
import { Map, TileLayer, FeatureGroup, useLeaflet } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

function EditableLayer(props) {

    let data = props.data;

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
            data.push(coordinates)
            console.log("coordinates....", data.length)
        }
    };


    return (
        <div>
            <FeatureGroup ref={editLayerRef}>
                <EditControl
                    position="topright"
                    onMounted={onMounted}
                    onCreated={onCreat}
                    onEdited={(e) => console.log(e)}
                    {...props}
                />
            </FeatureGroup>
        </div>
    );
}

function EditableGroup(props) {
    const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);

    function handleLayerClick(e, drawControl) {
        setSelectedLayerIndex(e.target.feature.properties.editLayerId);
    }


    const polyLayerData = {
        "type": "FeatureCollection",
        "features": []
    }

    for (let i = 0; i < props.data.length; i++) {

        const geojson = {};
        geojson['type'] = 'Feature';
        geojson['properties'] = {};
        geojson['geometry'] = {};
        geojson['geometry']['type'] = "Polygon";

        // export the coordinates from the layer
        const coordinates = [];
        const latlngs = props.data[i];

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
        layer.feature.properties.editLayerId = i;
        layers.push(layer);
        i++;
    });

    return (
        <div>
            {layers.map((layer, i) => {
                return (
                    <EditableLayer
                        key={i}
                        data={props.data}
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
        < Map
            center={position}
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: "100Vh", width: "80%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <EditableGroup data={props.data} />
        </Map>
    );
}

export default MapExample;
