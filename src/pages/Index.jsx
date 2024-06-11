import React, { useEffect, useState, useRef } from 'react';
import { Container, Box, Text } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const center = [59.3706, 18.6984];

const DrawControl = ({ setTotalLength }) => {
  const map = useMap();
  const drawnItemsRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
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

    const handleDrawnItemsChange = () => {
      const data = drawnItems.toGeoJSON();
      localStorage.setItem('drawnRoute', JSON.stringify(data));
      updateTotalLength(drawnItems);
    };

    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      handleDrawnItemsChange();
    });

    map.on(L.Draw.Event.EDITED, handleDrawnItemsChange);
    map.on(L.Draw.Event.DELETED, handleDrawnItemsChange);

    loadRoute(drawnItems);
  }, [map]);

  const loadRoute = (drawnItems) => {
    const data = localStorage.getItem('drawnRoute');
    if (data) {
      const geojson = JSON.parse(data);
      L.geoJSON(geojson).eachLayer((layer) => {
        drawnItems.addLayer(layer);
      });
      updateTotalLength(drawnItems);
    }
  };

  const updateTotalLength = (drawnItems) => {
    const layers = drawnItems.getLayers();
    let totalLength = 0;
    layers.forEach((layer) => {
      if (layer instanceof L.Polyline) {
        const latlngs = layer.getLatLngs();
        totalLength += latlngs.reduce((acc, latlng, index, array) => {
          if (index === 0) return 0;
          return acc + array[index - 1].distanceTo(latlng);
        }, 0);
      }
    });
    setTotalLength(totalLength);
  };

  return null;
};

const Index = () => {
  const [totalLength, setTotalLength] = useState(0);

  return (
    <Container maxW="100vw" height="100vh" padding={0}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={center}></Marker>
        <DrawControl setTotalLength={setTotalLength} />
      </MapContainer>
      <Box position="absolute" top={4} left={4} bg="white" p={4} borderRadius="md" boxShadow="md">
        <Text>Total Route Length: {(totalLength / 1000).toFixed(2)} km</Text>
      </Box>
    </Container>
  );
};

export default Index;