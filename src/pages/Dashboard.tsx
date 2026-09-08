import React from "react";
import Sidebar from "../components/Sidebar";
import { Header } from "@/components/Header";
import MapComponent from "@/components/MapComponent";
import {
  TriangleAlert,
  Route,
  Users,
  CloudRain,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

const stats = [
  {
    title: "Active Flood Zones",
    value: "12",
    change: "+2 today",
    icon: TriangleAlert,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    title: "Roads Closed",
    value: "31",
    change: "+5 new",
    icon: Route,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "People Affected",
    value: "2,430",
    change: "Across Ahmedabad",
    icon: Users,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    title: "Rainfall (24h)",
    value: "182 mm",
    change: "Very Heavy",
    icon: CloudRain,
    color: "text-sky-700",
    bg: "bg-sky-50",
  },
];

const incidents = [
  {
    area: "Paldi Bridge",
    severity: "Critical",
    status: "Road Closed",
  },
  {
    area: "Sabarmati Riverfront",
    severity: "High",
    status: "Rescue Active",
  },
  {
    area: "Navrangpura",
    severity: "Moderate",
    status: "Water Logging",
  },
  {
    area: "Vastrapur",
    severity: "Low",
    status: "Monitoring",
  },
  {
    area: "Ashram Road",
    severity: "High",
    status: "Traffic Diversion",
  },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F7F1E4] overflow-hidden text-[#4A3328]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">

        {/* Title */}
        <div className="mt-4 mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-[#12352B]">
            Flood Analytics Dashboard
          </h1>

          <p className="text-[#8C7466] mt-1 text-sm">
            Ahmedabad · Live monitoring for Government & Field Officers
          </p>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-3xl bg-[#FFFDF8] border border-[#DDC8A6] p-5 shadow-sm"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`${card.color}`} size={22} />
                </div>

                <p className="text-sm text-[#8C7466]">{card.title}</p>

                <h2 className="text-3xl font-bold mt-2 text-[#12352B]">
                  {card.value}
                </h2>

                <div className="flex items-center gap-2 mt-3 text-xs text-green-700 font-medium">
                  <ArrowUpRight size={14} />
                  {card.change}
                </div>
              </div>
            );
          })}
        </section>

        {/* Chart & Map */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
          {/* Rainfall Chart */}
          <div className="xl:col-span-2 rounded-3xl bg-[#FFFDF8] border border-[#DDC8A6] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-[#12352B]">
                Rainfall Trend (Last 24 Hours)
              </h3>

              <span className="text-sm text-[#8C7466]">Updated 15 sec ago</span>
            </div>

            <div className="relative h-[250px]">
              <svg viewBox="0 0 500 240" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="fillRain"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[40, 90, 140, 190].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="500"
                    y1={y}
                    y2={y}
                    stroke="#E7DDCE"
                  />
                ))}

                <path
                  d="
                    M0 180
                    L50 165
                    L100 155
                    L150 130
                    L200 120
                    L250 95
                    L300 80
                    L350 65
                    L400 40
                    L450 30
                    L500 15
                    L500 220
                    L0 220
                    Z"
                  fill="url(#fillRain)"
                />

                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4"
                  points="
                    0,180
                    50,165
                    100,155
                    150,130
                    200,120
                    250,95
                    300,80
                    350,65
                    400,40
                    450,30
                    500,15
                  "
                />

                {[
                  [0, 180],
                  [50, 165],
                  [100, 155],
                  [150, 130],
                  [200, 120],
                  [250, 95],
                  [300, 80],
                  [350, 65],
                  [400, 40],
                  [450, 30],
                  [500, 15],
                ].map(([x, y]) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#2563EB"
                  />
                ))}
              </svg>
            </div>

            <div className="flex justify-between text-xs text-[#8C7466] mt-2">
              {[
                "00",
                "03",
                "06",
                "09",
                "12",
                "15",
                "18",
                "21",
                "Now",
              ].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* Live Map */}
          <div className="rounded-3xl bg-[#FFFDF8] border border-[#DDC8A6] shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 pb-3">
              <h3 className="font-semibold text-[#12352B]">Live Flood Map</h3>

              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Live
              </span>
            </div>

            <div className="h-[280px]">
              <MapComponent />
            </div>

            <div className="p-4 border-t border-[#E6D7BD] flex justify-between text-sm">
              <span className="text-[#8C7466]">Flood Zones</span>

              <span className="font-semibold text-[#12352B]">12 Active</span>
            </div>
          </div>
        </section>

        {/* bottom grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6 mb-8">
          {/* incidents */}
          <div className="lg:col-span-2 rounded-3xl bg-[#FFFDF8] border border-[#DDC8A6] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-[#12352B]">
                Recent Flood Incidents
              </h3>

              <span className="text-sm text-[#8C7466]">Today</span>
            </div>

            <div className="space-y-3">
              {incidents.map((item) => (
                <div
                  key={item.area}
                  className="rounded-2xl border border-[#EDE4D4] bg-[#FFFDF8] p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.area}</p>

                    <p className="text-sm text-[#8C7466]">{item.status}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.severity === "Critical"
                        ? "bg-red-100 text-red-700"
                        : item.severity === "High"
                        ? "bg-blue-100 text-blue-700"
                        : item.severity === "Moderate"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Panel */}
          <div className="rounded-3xl bg-[#FFFDF8] border border-[#DDC8A6] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <ShieldAlert className="text-[#12352B]" size={20} />
              <h3 className="font-semibold text-[#12352B]">
                Severity Breakdown
              </h3>
            </div>

            {[
              ["Critical Zones", "18%", "bg-red-700", "18%"],
              ["High Risk", "42%", "bg-blue-700", "42%"],
              ["Moderate Risk", "27%", "bg-sky-500", "27%"],
              ["Safe Area", "13%", "bg-green-600", "13%"],
            ].map(([label, value, color, width]) => (
              <div className="mb-5" key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{label}</span>

                  <span className="font-semibold">{value}</span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#E8E0D3] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width }}
                  />
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-[#12352B] text-white p-4 mt-6">
              <p className="text-xs uppercase tracking-wider text-green-300">
                System Status
              </p>

              <h4 className="font-semibold mt-1">Live Monitoring Enabled</h4>

              <p className="text-sm text-green-100 mt-2">
                Flood sensors, citizen reports and rainfall feeds updated every
                15 seconds.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}