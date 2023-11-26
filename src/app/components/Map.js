'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

let mapConfig = {responsive: true}

export default function Map({ data, domain }) {
    console.log("render occurred! Map")
    let plot_geom = data[0];
    let plot_coords = data[1];
    let plot_values = data[2];
    let total_grid_cells = plot_coords.length;
    

    let mapData = {
        type: "choroplethmapbox",
        locations: Array.from(Array(total_grid_cells).keys()), // length of data (number of rows)
        marker: {
            line: {width: 0},
            opacity: 0.7
        },
        z: plot_values, // for use in the hover tooltip
        zmin: 0, zmax: 0.75,
        colorbar: {x: -0.12, thickness: 20},
        hoverinfo: "z",
        customdata: plot_coords, 
        colorscale: 'YlGnBu',
        geojson: plot_geom
    }; // referring to FeatureCollection generated from the data

    let mapLayout = {
        margin: { t: 3, b: 10, l: 10, r: 3 },
        uirevision:'true',
        mapbox: {
            style: "carto-darkmatter",
            center: {lon: domain[2][0], 
                lat: domain[2][1]},
            layers: [
            {
                sourcetype: "geojson",
                source: "/geojson-counties-fips.json", // county boundaries
                type: "line",
                color: "#BA9DD5",
                line: {"width": 0.25},
                below: "traces"
            },
            {
                sourcetype: "geojson",
                source: "/cnty_warn_bnds.json", // county warning boundaries
                type: "line",
                color: "yellow",
                line: {"width": 0.4, opacity: 0.0},
                below: "traces"
            }
            ],
            zoom: 5,
        },
    };

    return (
        <div id="map-container">
            <Plot id="map" data={[mapData].flat()} layout={mapLayout} config={mapConfig} />
        </div>
    )
}