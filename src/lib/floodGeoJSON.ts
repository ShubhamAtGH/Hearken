export const floodGeoJSON = {
  type: "FeatureCollection",
  features: [
   
    {
      type: "Feature",
      properties: {
        risk: "critical",
        river: "Sabarmati",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.553, 23.006],
          [72.558, 23.018],
          [72.563, 23.028],
          [72.569, 23.037],
          [72.574, 23.048],
          [72.578, 23.058],
          [72.582, 23.068],
          [72.587, 23.075],
          [72.591, 23.061],
          [72.587, 23.046],
          [72.581, 23.033],
          [72.575, 23.022],
          [72.569, 23.012],
          [72.563, 23.004],
          [72.553, 23.006],
        ]],
      },
    },

    {
      type: "Feature",
      properties: {
        risk: "critical",
        river: "Paldi Bridge",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.5638, 23.0125],
          [72.5655, 23.0148],
          [72.5680, 23.0158],
          [72.5692, 23.0130],
          [72.5672, 23.0102],
          [72.5645, 23.0098],
          [72.5638, 23.0125],
        ]],
      },
    },

    {
      type: "Feature",
      properties: {
        risk: "high",
        river: "Sabarmati Riverfront",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.5695, 23.0350],
          [72.5720, 23.0385],
          [72.5745, 23.0415],
          [72.5735, 23.0445],
          [72.5700, 23.0435],
          [72.5680, 23.0395],
          [72.5695, 23.0350],
        ]],
      },
    },

    {
      type: "Feature",
      properties: {
        risk: "moderate",
        river: "Navrangpura",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.5555, 23.0320],
          [72.5590, 23.0345],
          [72.5615, 23.0375],
          [72.5585, 23.0402],
          [72.5535, 23.0385],
          [72.5520, 23.0342],
          [72.5555, 23.0320],
        ]],
      },
    },

    {
      type: "Feature",
      properties: {
        risk: "low",
        river: "Vastrapur",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.5245, 23.0385],
          [72.5275, 23.0408],
          [72.5302, 23.0435],
          [72.5282, 23.0462],
          [72.5235, 23.0452],
          [72.5218, 23.0415],
          [72.5245, 23.0385],
        ]],
      },
    },

  
    {
      type: "Feature",
      properties: {
        risk: "high",
        river: "Ashram Road",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.5690, 23.0260],
          [72.5718, 23.0292],
          [72.5745, 23.0318],
          [72.5732, 23.0348],
          [72.5690, 23.0335],
          [72.5670, 23.0295],
          [72.5690, 23.0260],
        ]],
      },
    },
  ],
} as const;