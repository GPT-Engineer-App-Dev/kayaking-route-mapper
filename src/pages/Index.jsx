import React, { useEffect } from 'react';
import { Container } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const center = [59.3706, 18.6984];

const DrawControl = () => {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        marker: false,
        circle: false,
        rectangle: false,
        polygon: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      saveRoute(drawnItems);
    });

    map.on(L.Draw.Event.EDITED, function () {
      saveRoute(drawnItems);
    });

    map.on(L.Draw.Event.DELETED, function () {
      saveRoute(drawnItems);
    });

    loadRoute(drawnItems);
  }, [map]);

  const saveRoute = (drawnItems) => {
    const data = drawnItems.toGeoJSON();
    localStorage.setItem('drawnRoute', JSON.stringify(data));
  };

  const loadRoute = (drawnItems) => {
    const data = localStorage.getItem('drawnRoute');
    if (data) {
      const geojson = JSON.parse(data);
      L.geoJSON(geojson).eachLayer((layer) => {
        drawnItems.addLayer(layer);
      });
    }
  };

  return null;
};

const Index = () => {
  return (
    <Container maxW="100vw" height="100vh" padding={0}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={center}></Marker>
        <DrawControl />
      </MapContainer>
    </Container>
  );
};

export default Index;