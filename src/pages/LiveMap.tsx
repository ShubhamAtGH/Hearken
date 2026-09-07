import { useEffect, useState, useRef } from "react";
import { floodSensors } from "@/lib/floodSensors";
import * as maplibregl from 'maplibre-gl';
import { NavLink } from "react-router-dom";
import { floodGeoJSON } from "@/lib/floodGeoJSON";
import Sidebar from "@/components/Sidebar";
import {
  Search,
  Map,
  ChartColumn,
  TriangleAlert,
  House,
  Settings,
  Layers,
  LocateFixed,
  Plus,
  Minus,
  Route,
  Compass,
} from "lucide-react";



export default function LiveMap() {

  const [satelliteView, setSatelliteView] = useState(false);
  const [showFloodLayer, setShowFloodLayer] = useState(true);
  const [floodOpacity, setFloodOpacity] = useState(0.22);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);


  const SHEET_SNAPS = { peek: 16, half: 46, full: 88 } as const;
  const [sheetHeightVh, setSheetHeightVh] = useState<number>(SHEET_SNAPS.peek);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartHeightRef = useRef<number>(SHEET_SNAPS.peek);
  const dragMovedRef = useRef(false);

  const snapSheetTo = (key: keyof typeof SHEET_SNAPS) => {
    setIsDraggingSheet(false);
    setSheetHeightVh(SHEET_SNAPS[key]);
  };

  const handleSheetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartYRef.current = e.clientY;
    dragStartHeightRef.current = sheetHeightVh;
    dragMovedRef.current = false;
    setIsDraggingSheet(true);
  };

  const handleSheetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSheet) return;
    const deltaPx = dragStartYRef.current - e.clientY;
    if (Math.abs(deltaPx) > 4) dragMovedRef.current = true;
    const deltaVh = (deltaPx / window.innerHeight) * 100;
    const next = Math.min(
      SHEET_SNAPS.full,
      Math.max(SHEET_SNAPS.peek, dragStartHeightRef.current + deltaVh)
    );
    setSheetHeightVh(next);
  };

  const handleSheetPointerUp = () => {
    if (!isDraggingSheet) return;

    // A tap (no real drag) on the handle toggles between peek and half.
    if (!dragMovedRef.current) {
      setIsDraggingSheet(false);
      setSheetHeightVh((prev) =>
        prev <= SHEET_SNAPS.peek + 1 ? SHEET_SNAPS.half : SHEET_SNAPS.peek
      );
      return;
    }

    const mid1 = (SHEET_SNAPS.peek + SHEET_SNAPS.half) / 2;
    const mid2 = (SHEET_SNAPS.half + SHEET_SNAPS.full) / 2;
    let target: keyof typeof SHEET_SNAPS = "peek";
    if (sheetHeightVh > mid2) target = "full";
    else if (sheetHeightVh > mid1) target = "half";
    snapSheetTo(target);
  };

  // 0 -> 1 progress between "half" and "full", used to fade in a backdrop
  const sheetBackdropOpacity = Math.min(
    1,
    Math.max(
      0,
      (sheetHeightVh - SHEET_SNAPS.half) / (SHEET_SNAPS.full - SHEET_SNAPS.half)
    )
  ) * 0.4;

  const riskColors = {
    low: "#16A34A",
    moderate: "#2563EB",
    high: "#EA580C",
    critical: "#B91C1C",
  } as const;

  const addFloodLayers = () => {
    if (!mapRef.current) return;

    // Don't add twice
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

    // Create the map
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,

      // Beautiful light style
      style: "https://tiles.openfreemap.org/styles/liberty",

      center: [72.5714, 23.0225], // Ahmedabad
      zoom: 12.8,

      pitch: 45,
      bearing: -10,


      // Apple Maps feeling
      dragRotate: true,
      touchPitch: true,
      pitchWithRotate: true,

      maxPitch: 75,
      maxZoom: 19,
      minZoom: 4,

      attributionControl: false,
    });


    // Wait until map is ready
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
      // Add all flood sensors
      floodSensors.forEach((sensor) => {
        new maplibregl.Marker({
          color: riskColors[sensor.risk],
        })
          .setLngLat(sensor.coordinates)
          .addTo(mapRef.current!);
      });
    });

    // Cleanup when component unmounts
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setFloodOpacity((prev) =>
        prev === 0.22 ? 0.38 : 0.22
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapRef.current.getLayer("flood-fill")) return;

    mapRef.current.setPaintProperty(
      "flood-fill",
      "fill-opacity",
      floodOpacity
    );
  }, [floodOpacity]);


  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F7F1E4]">

      {/* =========================================
          DESKTOP: ICON RAIL (Hidden on Mobile)
      ========================================= */}
      <Sidebar />

      {/* =========================================
          DESKTOP: WORKSPACE PANEL (Hidden on Mobile)
      ========================================= */}
      <aside className="hidden md:flex w-[340px] shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-[#E6D7BD] bg-[#F7F1E4] p-5 z-20">
        <h1 className="font-serif text-2xl text-[#4A3328] mb-6">Hearken</h1>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-full bg-[#FFFDF8] border border-[#E6D7BD] px-4 py-3">
          <Search size={18} className="text-[#8C7466]" />
          <input
            placeholder="Search city, river, shelter..."
            className="w-full bg-transparent outline-none text-[#4A3328] placeholder:text-[#8C7466]"
          />
        </div>

        {/* Desktop Cards */}
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-[#991B1B] p-5 text-[#F7F1E4]">
            <p className="text-xs uppercase tracking-widest opacity-80">Flood Alert</p>
            <h2 className="mt-2 text-xl font-semibold">Sabarmati River</h2>
            <p className="mt-2 text-sm opacity-80">Water level increasing rapidly.</p>
          </div>

          <div className="rounded-3xl bg-[#4A3328] p-5 border border-[#E6D7BD]/20">
            <h3 className="text-[#E6D7BD] font-semibold text-xs tracking-wider uppercase mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button className="flex items-center justify-center gap-2 p-2.5 bg-[#9E1B1B] hover:bg-[#b52020] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
                <TriangleAlert className="w-4 h-4 shrink-0" />
                SOS Rescue
              </button>
              <button className="flex items-center justify-center gap-2 p-2.5 bg-[#3B281F] hover:bg-[#2F2018] text-[#E6D7BD] rounded-xl text-xs font-medium border border-[#E6D7BD]/10 transition-colors">
                <TriangleAlert className="w-4 h-4 shrink-0" />
                Report Hazard
              </button>
              <button className="flex items-center justify-center gap-2 p-2.5 bg-[#3B281F] hover:bg-[#2F2018] text-[#E6D7BD] rounded-xl text-xs font-medium border border-[#E6D7BD]/10 transition-colors">
                <Route className="w-4 h-4 shrink-0" />
                Safe Routes
              </button>
              <button className="flex items-center justify-center gap-2 p-2.5 bg-[#3B281F] hover:bg-[#2F2018] text-[#E6D7BD] rounded-xl text-xs font-medium border border-[#E6D7BD]/10 transition-colors">
                <Search className="w-4 h-4 shrink-0" />
                Helplines
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-[#4A3328] p-5 border border-[#E6D7BD]/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[#E6D7BD]/70 text-xs font-medium uppercase tracking-wider">Live Weather</h3>
                <p className="text-[#E6D7BD] text-3xl font-bold mt-1">27°C</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded-full text-[11px] font-medium">
                  Heavy Rain
                </span>
                <p className="text-[#E6D7BD]/60 text-xs mt-1">Sabarmati Basin</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E6D7BD]/10 text-center">
              <div className="bg-[#3B281F] p-2.5 rounded-2xl">
                <p className="text-[#E6D7BD]/50 text-[10px] uppercase font-medium">Rainfall</p>
                <p className="text-[#E6D7BD] text-xs font-bold mt-0.5">52 mm/h</p>
              </div>
              <div className="bg-[#3B281F] p-2.5 rounded-2xl">
                <p className="text-[#E6D7BD]/50 text-[10px] uppercase font-medium">Humidity</p>
                <p className="text-[#E6D7BD] text-xs font-bold mt-0.5">92%</p>
              </div>
              <div className="bg-[#3B281F] p-2.5 rounded-2xl">
                <p className="text-[#E6D7BD]/50 text-[10px] uppercase font-medium">Wind</p>
                <p className="text-[#E6D7BD] text-xs font-bold mt-0.5">28 km/h</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================
          SHARED MAP AREA (Desktop + Mobile)
      ========================================= */}
      <main className="relative flex-1 h-full w-full overflow-hidden">

        {/* Single Map Reference ensures MapLibre doesn't break across screen resizes */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* =========================================
            DESKTOP-ONLY MAP OVERLAYS
        ========================================= */}
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
              <span className="text-sm font-medium text-[#4A3328]">Live Monitoring</span>
            </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-4 z-20 pointer-events-auto">
            <div className="bg-[#FFFDF8]/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#DDC8A6] overflow-hidden">
              <button
                onClick={() => {
                  if (!mapRef.current) return;
                  const next = !satelliteView;
                  setSatelliteView(next);
                  mapRef.current.setLayoutProperty("flood-fill", "visibility", next ? "visible" : "none");
                  mapRef.current.setLayoutProperty("flood-outline", "visibility", next ? "visible" : "none");
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
                      mapRef.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 15, pitch: 60, bearing: 0, speed: 1.2, curve: 1.5, essential: true });
                    },
                    () => alert("Location permission denied.")
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
                mapRef.current.easeTo({ bearing: 0, pitch: 45, duration: 900, easing: (t) => t * (2 - t) });
              }}
              className="w-12 h-12 hover:scale-105 transition-all duration-150 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDC8A6] flex items-center justify-center shadow-sm hover:bg-[#F5EEE0] active:scale-95"
            >
              <Compass size={18} className="text-[#4A3328]" />
            </button>

            <div className="bg-[#FFFDF8]/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#DDC8A6] overflow-hidden">
              <button
                onClick={() => mapRef.current?.easeTo({ zoom: mapRef.current.getZoom() + 1, duration: 500 })}
                className="w-12 h-12 flex items-center justify-center hover:scale-105 hover:bg-[#F5EEE0] transition-all active:scale-95"
              >
                <Plus size={20} className="text-[#4A3328]" />
              </button>
              <div className="h-px bg-[#E8DAC4]" />
              <button
                onClick={() => mapRef.current?.easeTo({ zoom: mapRef.current.getZoom() - 1, duration: 500 })}
                className="w-12 h-12 flex items-center justify-center hover:bg-[#F5EEE0] transition-all active:scale-95"
              >
                <Minus size={20} className="text-[#4A3328]" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDC8A6] px-5 py-3 shadow-sm flex items-center gap-4 pointer-events-auto">
            <span className="text-sm text-[#8C7466]">06:00</span>
            <div className="w-44 h-1 rounded-full bg-[#E8DAC4] relative">
              <div className="absolute left-0 top-0 h-full w-2/3 rounded-full bg-[#12352B]" />
              <div className="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#12352B]" />
            </div>
            <span className="text-sm font-medium text-[#4A3328]">Now</span>
          </div>

          <div className="absolute bottom-6 left-6 z-20 rounded-3xl bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDC8A6] p-4 shadow-sm w-48 pointer-events-auto">
            <p className="text-xs uppercase tracking-widest text-[#8C7466] mb-3">Flood Risk</p>
            {[
              ["Safe", "#BBF7D0"],
              ["Low", "#BFDBFE"],
              ["Moderate", "#60A5FA"],
              ["High", "#2563EB"],
              ["Critical", "#991B1B"],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-3 mb-2 last:mb-0">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-[#4A3328]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================
            MOBILE-ONLY OVERLAYS
        ========================================= */}
        <div className="md:hidden absolute inset-0 pointer-events-none z-10">

          {/* Mobile Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto flex gap-2 w-full mt-2">
            <div className="flex-1 flex items-center gap-3 rounded-full bg-[#FFFDF8]/95 backdrop-blur-md border border-[#DDC8A6] px-4 py-3 shadow-sm">
              <Search size={18} className="text-[#8C7466]" />
              <input
                placeholder="Search location..."
                className="w-full bg-transparent outline-none text-[#4A3328] placeholder:text-[#8C7466]"
              />
            </div>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FFFDF8]/95 backdrop-blur-md border border-[#DDC8A6] shadow-sm text-[#4A3328]">
              <Layers size={18} />
            </button>
          </div>

          {/* Mobile Controls Right */}
          <div className="absolute top-24 right-4 flex flex-col gap-3 pointer-events-auto">
            <button
              onClick={() => {
                if (!mapRef.current || !navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition((pos) => {
                  mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15, pitch: 60 });
                });
              }}
              className="w-10 h-10 rounded-full bg-[#FFFDF8]/95 backdrop-blur-md border border-[#DDC8A6] flex items-center justify-center shadow-sm text-[#4A3328] hover:scale-105 active:scale-95"
            >
              <LocateFixed size={18} />
            </button>
            <button
              onClick={() => mapRef.current?.easeTo({ bearing: 0, pitch: 45, duration: 900 })}
              className="w-10 h-10 rounded-full bg-[#FFFDF8]/95 backdrop-blur-md border border-[#DDC8A6] flex items-center justify-center shadow-sm text-[#4A3328] hover:scale-105 active:scale-95"
            >
              <Compass size={18} />
            </button>
          </div>

          {/* Backdrop: dims the map as the sheet approaches full height */}
          {sheetBackdropOpacity > 0.01 && (
            <div
              onClick={() => snapSheetTo("half")}
              className="absolute inset-0 bg-black pointer-events-auto transition-opacity"
              style={{ opacity: sheetBackdropOpacity }}
            />
          )}

          {/* =========================================
              MOBILE DRAGGABLE BOTTOM SHEET 
          ========================================= */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-auto flex flex-col rounded-t-3xl bg-[#F7F1E4] border-t border-[#DDC8A6] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] overflow-hidden"
            style={{
              height: `${sheetHeightVh}vh`,
              transition: isDraggingSheet ? "none" : "height 300ms cubic-bezier(0.32, 0.72, 0, 1)",
              touchAction: "none",
            }}
          >
            {/* Drag handle + header (drag / tap target) */}
            <div
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerUp}
              onPointerCancel={handleSheetPointerUp}
              className="shrink-0 pt-2.5 pb-3 px-5 cursor-grab active:cursor-grabbing"
            >
              <div className="w-9 h-1.5 rounded-full bg-[#DDC8A6] mx-auto mb-3" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl text-[#4A3328]">Hearken</h1>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#8C7466] bg-[#EFE4CC] px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#16A34A] animate-ping opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                </span>
              </div>


              <div className="rounded-2xl bg-[#991B1B] p-3.5 mt-3 text-[#F7F1E4] shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-80 mb-0.5">Flood Alert</p>
                  <h2 className="text-sm font-semibold">Sabarmati River Rising</h2>
                </div>
                <TriangleAlert size={20} className="opacity-80 shrink-0 ml-3" />
              </div>
            </div>

            {/* Scrollable body */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 space-y-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {/* Quick Actions */}
              <div className="rounded-3xl bg-[#4A3328] p-5 border border-[#E6D7BD]/20">
                <h3 className="text-[#E6D7BD] font-semibold text-xs tracking-wider uppercase mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button className="flex items-center justify-center gap-2 p-2.5 bg-[#9E1B1B] hover:bg-[#b52020] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
                    <TriangleAlert className="w-4 h-4 shrink-0" />
                    SOS Rescue
                  </button>
                  <button className="flex items-center justify-center gap-2 p-2.5 bg-[#3B281F] hover:bg-[#2F2018] text-[#E6D7BD] rounded-xl text-xs font-medium border border-[#E6D7BD]/10 transition-colors">
                    <TriangleAlert className="w-4 h-4 shrink-0" />
                    Report Hazard
                  </button>
                  <button className="flex items-center justify-center gap-2 p-2.5 bg-[#3B281F] hover:bg-[#2F2018] text-[#E6D7BD] rounded-xl text-xs font-medium border border-[#E6D7BD]/10 transition-colors">
                    <Route className="w-4 h-4 shrink-0" />
                    Safe Routes
                  </button>
                  <button className="flex items-center justify-center gap-2 p-2.5 bg-[#3B281F] hover:bg-[#2F2018] text-[#E6D7BD] rounded-xl text-xs font-medium border border-[#E6D7BD]/10 transition-colors">
                    <Search className="w-4 h-4 shrink-0" />
                    Helplines
                  </button>
                </div>
              </div>

              {/* Live Weather */}
              <div className="rounded-3xl bg-[#4A3328] p-5 border border-[#E6D7BD]/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[#E6D7BD]/70 text-xs font-medium uppercase tracking-wider">Live Weather</h3>
                    <p className="text-[#E6D7BD] text-3xl font-bold mt-1">27°C</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded-full text-[11px] font-medium">
                      Heavy Rain
                    </span>
                    <p className="text-[#E6D7BD]/60 text-xs mt-1">Sabarmati Basin</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E6D7BD]/10 text-center">
                  <div className="bg-[#3B281F] p-2.5 rounded-2xl">
                    <p className="text-[#E6D7BD]/50 text-[10px] uppercase font-medium">Rainfall</p>
                    <p className="text-[#E6D7BD] text-xs font-bold mt-0.5">52 mm/h</p>
                  </div>
                  <div className="bg-[#3B281F] p-2.5 rounded-2xl">
                    <p className="text-[#E6D7BD]/50 text-[10px] uppercase font-medium">Humidity</p>
                    <p className="text-[#E6D7BD] text-xs font-bold mt-0.5">92%</p>
                  </div>
                  <div className="bg-[#3B281F] p-2.5 rounded-2xl">
                    <p className="text-[#E6D7BD]/50 text-[10px] uppercase font-medium">Wind</p>
                    <p className="text-[#E6D7BD] text-xs font-bold mt-0.5">28 km/h</p>
                  </div>
                </div>
              </div>

              {/* Nearby shelters */}
              <div>
                <h3 className="text-[#8C7466] font-semibold text-xs tracking-wider uppercase mb-3 px-1">
                  Find Nearby
                </h3>
                <div className="space-y-2.5">
                  {[
                    { icon: House, label: "Relief Shelters", tint: "bg-purple-500" },
                    { icon: TriangleAlert, label: "Rescue Boat Points", tint: "bg-[#EA580C]" },
                    { icon: Route, label: "Safe Evacuation Routes", tint: "bg-[#2563EB]" },
                    { icon: Search, label: "Medical Aid Camps", tint: "bg-emerald-600" },
                  ].map(({ icon: Icon, label, tint }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 rounded-2xl bg-[#FFFDF8] border border-[#E6D7BD] px-4 py-3 hover:bg-[#F5EEE0] transition-colors"
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${tint}`}>
                        <Icon size={16} />
                      </span>
                      <span className="text-sm text-[#4A3328] font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>


              <NavLink
                to="/dashboard"
                className="block rounded-3xl bg-[#12352B] p-4 text-center shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-center gap-3">
                  <ChartColumn size={20} className="text-white" />
                  <span className="text-white font-semibold">
                    Open Analytics Dashboard
                  </span>
                </div>
              </NavLink>

              {/* Flood Risk Legend */}
              <div className="rounded-3xl bg-[#FFFDF8] border border-[#DDC8A6] p-4">
                <p className="text-xs uppercase tracking-widest text-[#8C7466] mb-3">Flood Risk</p>
                {[
                  ["Safe", "#BBF7D0"],
                  ["Low", "#BFDBFE"],
                  ["Moderate", "#60A5FA"],
                  ["High", "#2563EB"],
                  ["Critical", "#991B1B"],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-3 mb-2 last:mb-0">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-[#4A3328]">{label}</span>
                  </div>
                ))}
              </div>


            </div>
          </div>
        </div>
      </main>
    </div>
  );
}