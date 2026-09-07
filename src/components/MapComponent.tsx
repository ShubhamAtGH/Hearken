import React, { useEffect, useState, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, LocateFixed, Plus, Minus, Compass } from "lucide-react";
import { floodSensors } from "@/lib/floodSensors";
import { floodGeoJSON } from "@/lib/floodGeoJSON";



const MapComponent: React.FC = () => {
  const [satelliteView, setSatelliteView] = useState(false);
  const [floodOpacity, setFloodOpacity] = useState(0.22);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const riskColors = {
    low: "#16A34A",
    moderate: "#2563EB",
    high: "#EA580C",
    critical: "#B91C1C",
  } as const;

  const addFloodLayers = () => {
    if (!mapRef.current) return;

    if (mapRef.current.getSource("flood-zone")) return;

    mapRef.current.addSource("flood-zone", {
      type: "geojson",
      data: floodGeoJSON,
    });

    mapRef.current.addLayer({
      id: "flood-fill",
      type: "fill",
      source: "flood-zone",
      paint: {
       "fill-color": [
  "match",
  ["get", "risk"],
  "critical", "#991B1B",
  "high", "#2563EB",
  "moderate", "#60A5FA",
  "low", "#16A34A",
  "#2563EB"
],
        "fill-opacity": 0.25,
      },
    });

    mapRef.current.addLayer({
      id: "flood-outline",
      type: "line",
      source: "flood-zone",
      paint: {
       "line-color": [
  "match",
  ["get", "risk"],
  "critical", "#7F1D1D",
  "high", "#1D4ED8",
  "moderate", "#2563EB",
  "low", "#15803D",
  "#1D4ED8"
],
        "line-width": 3,
      },
    });
  };

  

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty/style.json",
      center: [72.5714, 23.0225],
      zoom: 12.8,
      pitch: 45,
      bearing: -10,
      dragRotate: true,
      touchPitch: true,
      pitchWithRotate: true,
      maxPitch: 75,
      maxZoom: 19,
      minZoom: 4,
      attributionControl: false,
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;
      addFloodLayers();

      const layers = mapRef.current?.getStyle().layers;
      const labelLayer = layers?.find(
        (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
      )?.id;

      if (labelLayer) {
        mapRef.current?.addLayer(
          {
            id: "3d-buildings",
            source: "openmaptiles",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#D5D5D5",
              "fill-extrusion-height": ["get", "render_height"],
              "fill-extrusion-base": ["get", "render_min_height"],
              "fill-extrusion-opacity": 0.85,
            },
          },
          labelLayer
        );
      }

      floodSensors.forEach((sensor) => {
        new maplibregl.Marker({
          color: riskColors[sensor.risk],
        })
          .setLngLat(sensor.coordinates)
          .addTo(mapRef.current!);
      });
      if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    const coords: [number, number] = [
      position.coords.longitude,
      position.coords.latitude,
    ];

    const dot = document.createElement("div");
    dot.className =
      "w-5 h-5 rounded-full bg-[#2563EB] border-[3px] border-white shadow-lg";

    userMarkerRef.current = new maplibregl.Marker({
      element: dot,
    })
      .setLngLat(coords)
      .addTo(mapRef.current!);
  });
}
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setFloodOpacity((prev) => (prev === 0.22 ? 0.38 : 0.22));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapRef.current.getLayer("flood-fill")) return;

    mapRef.current.setPaintProperty("flood-fill", "fill-opacity", floodOpacity);
  }, [floodOpacity]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Desktop Controls*/}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-10">
        <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 bg-[#FFFDF8] border border-[#DDC8A6] shadow-sm rounded-full w-8 h-14 flex items-center justify-center hover:bg-[#F5EEE0] transition-colors pointer-events-auto">
          <div className="w-1 h-6 rounded-full bg-[#C2AA8D]" />
        </button>

        <div className="absolute top-6 left-6 z-20">
          <div className="flex items-center gap-3 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDC8A6] px-4 py-2 shadow-sm pointer-events-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#16A34A] animate-ping opacity-70"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16A34A]"></span>
            </span>
          </div>
        </div>

        <div className="absolute top-6 right-6 flex flex-col gap-4 z-20 pointer-events-auto">
          <div className="bg-[#FFFDF8]/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#DDC8A6] overflow-hidden">
            <button
              onClick={() => {
                if (!mapRef.current) return;
                const next = !satelliteView;
                setSatelliteView(next);
                mapRef.current.setLayoutProperty(
                  "flood-fill",
                  "visibility",
                  next ? "visible" : "none"
                );
                mapRef.current.setLayoutProperty(
                  "flood-outline",
                  "visibility",
                  next ? "visible" : "none"
                );
              }}
              className="w-12 h-12 flex items-center justify-center hover:scale-105 hover:bg-[#F5EEE0] transition-all active:scale-95"
            >
              <Layers size={20} className="text-[#4A3328]" />
            </button>
            <div className="h-px bg-[#E8DAC4]" />
            <button
  onClick={() => {
    if (!mapRef.current || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        userMarkerRef.current?.remove();

        const dot = document.createElement("div");
        dot.className =
          "w-5 h-5 rounded-full bg-[#2563EB] border-[3px] border-white shadow-lg";

        userMarkerRef.current = new maplibregl.Marker({
          element: dot,
        })
          .setLngLat(coords)
          .addTo(mapRef.current!);

        mapRef.current?.flyTo({
          center: coords,
          zoom: 15,
          pitch: 60,
          bearing: 0,
          duration: 1200,
          essential: true,
        });
      },
      () => alert("Location permission denied."),
      { enableHighAccuracy: true }
    );
  }}
  className="w-12 h-12 flex items-center justify-center hover:scale-105 hover:bg-[#F5EEE0] transition-all active:scale-95"
>
  <LocateFixed size={20} className="text-[#4A3328]" />
</button>
          </div>

          <button
            onClick={() => {
              if (!mapRef.current) return;
              mapRef.current.easeTo({
                bearing: 0,
                pitch: 45,
                duration: 900,
                easing: (t) => t * (2 - t),
              });
            }}
            className="w-12 h-12 hover:scale-105 transition-all duration-150 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDC8A6] flex items-center justify-center shadow-sm hover:bg-[#F5EEE0] active:scale-95"
          >
            <Compass size={18} className="text-[#4A3328]" />
          </button>

          <div className="bg-[#FFFDF8]/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#DDC8A6] overflow-hidden">
            <button
              onClick={() =>
                mapRef.current?.easeTo({
                  zoom: mapRef.current.getZoom() + 1,
                  duration: 500,
                })
              }
              className="w-12 h-12 flex items-center justify-center hover:scale-105 hover:bg-[#F5EEE0] transition-all active:scale-95"
            >
              <Plus size={20} className="text-[#4A3328]" />
            </button>
            <div className="h-px bg-[#E8DAC4]" />
            <button
              onClick={() =>
                mapRef.current?.easeTo({
                  zoom: mapRef.current.getZoom() - 1,
                  duration: 500,
                })
              }
              className="w-12 h-12 flex items-center justify-center hover:bg-[#F5EEE0] transition-all active:scale-95"
            >
              <Minus size={20} className="text-[#4A3328]" />
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-6 left-6 z-20 rounded-2xl bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDC8A6]  shadow-sm w-auto pointer-events-auto">
          <p className="text-xs m-2 uppercase tracking-widest text-[#8C7466] mb-3">
            Flood Risk
          </p>
          {[
            ["Safe", "#BBF7D0"],
            ["Low", "#BFDBFE"],
            ["Moderate", "#60A5FA"],
            ["High", "#2563EB"],
            ["Critical", "#991B1B"],
          ].map(([label, color]) => (
            <div
              key={label}
              className="flex m-1 items-center "
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm gap-2 text-[#4A3328]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default  MapComponent