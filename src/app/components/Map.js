'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

let mapConfig = {responsive: true}

export default function Map({ data, reflData, selectedReflOpacity, domain, onSelectPoint, selectedCellData }) {
    console.log("render occurred! Map")
    let plot_geom = data[0];
    let plot_coords = data[1];
    let plot_values = data[2];
    let total_grid_cells = plot_coords.length;

    let allTraces = [];

    let mapData = {
        type: "choroplethmapbox",
        locations: Array.from(Array(total_grid_cells).keys()), // length of data (number of rows)
        marker: {
            line: {width: 0},
            opacity: 0.7
        },
        z: plot_values, // for use in the hover tooltip
        zmin: 0, zmax: 0.75,
        colorbar: {
            title: {text: 'Probability', font: {color: 'white'}},
            x: 0, 
            thickness: 20, 
            tickfont: {color: 'white'},  
            bgcolor: 'rgba(0, 0, 0, 0.5)'
        },
        hoverinfo: "z",
        customdata: plot_coords, 
        colorscale: 'YlGnBu',
        geojson: plot_geom
    }; // referring to FeatureCollection generated from the data

    let reflMapData;

    let mapLayout = {
        margin: { t: 3, b: 5, l: 5, r: 5 },
        uirevision:'true',
        mapbox: {
            style: "carto-darkmatter",
            center: {lon: domain[2][0], 
                lat: domain[2][1]},
            layers: [
            {
                sourcetype: "geojson",
                source: "/utorview-forecast/simplified-geojson-counties-fips.json", // county boundaries
                type: "line",
                color: "#BA9DD5",
                line: {"width": 0.25},
                below: "traces"
            },
            {
                sourcetype: "geojson",
                source: "/utorview-forecast/simplified_cnty_warn_bnds.json", // county warning boundaries
                type: "line",
                color: "yellow",
                line: {"width": 0.4, opacity: 0.0},
                below: "traces"
            }
            ],
            zoom: 5,
        },
    };

    if (reflData) {
        let plot_geom_r = reflData[0];
        let plot_coords_r = reflData[1];
        let plot_values_r = reflData[2];
        let total_grid_cells_r = plot_coords_r.length;

        let refl_alpha = selectedReflOpacity/100;
    
        reflMapData = {
          type: "choroplethmapbox",
          locations: Array.from(Array(total_grid_cells_r).keys()),
          marker: {
            line: {width: 0},
            opacity: refl_alpha
          },
          z: plot_values_r,
          zmin: 0, zmax: 80,
          colorbar: { 
            title: {text: 'dBZ', font: {color: 'white'}},
            orientation: 'h', 
            thickness: 15, 
            y: -0.001, 
            x: 0.51, 
            len: 0.95, 
            tickfont: {color: 'white'}, 
            bgcolor: 'rgba(0, 0, 0, 0.5)', 
            ticklabelposition: "outside top"
          },
          hoverinfo: "skip",
          customdata: plot_coords_r,
          colorscale: 'Jet',
          geojson: plot_geom_r
        };
      } 

    // pushing all requested data to an array that is then passed to Plotly
    allTraces.push(mapData)
    if (reflData) {allTraces.push(reflMapData)}
    if (selectedCellData) {allTraces.push(selectedCellData)}
    allTraces = allTraces.flat();

    return (
        <div id="map-container" onClick={() => onSelectPoint(null)}>
            <Plot id="map" data={allTraces} layout={mapLayout} config={mapConfig} onClick={(e) => onSelectPoint(e)}/>
        </div>
    )
}