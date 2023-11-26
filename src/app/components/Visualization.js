'use client'
import Map from './Map.js';
import Chart from './Chart.js';
import { formatDateAsString, getInitStrings, buildDataObject } from './DataFetch.js';
import { useQuery } from '@tanstack/react-query';
import { decodeAsync } from '@msgpack/msgpack';
import proj4 from 'proj4';


let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

let wofs_x_length = 300;
let wofs_y_length = 300;
let resolution = 3000;
let radius = resolution / 2;

// reprojecting the data coordinates
let orig_proj = "WGS84";
let base_proj = "+proj=lcc +lat_0=34.321392 +lon_0=-98.0134 +lat_1=30 +lat_2=60 +a=6370000 +b=6370000 +ellps=WGS84";
let base_transformer = proj4(base_proj, orig_proj);

let mapData = [
    {
        type: 'scattermapbox',
        lon: [0],
        lat: [0],
        opacity: 0
    }
];

let mapLayout = {
    margin: { t: 3, b: 10, l: 10, r: 3 },
    uirevision:'true',
    mapbox: {
    style: "carto-darkmatter",
      center: {
        lat: 39,
        lon: -98,
      },
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
      zoom: 3,
    },
  };

let mapConfig = {responsive: true}

let chartLayout = {
    margin: { t: 30, b: 40, l: 30, r: 30 },
    uirevision:'true'
}

let chartConfig = {responsive: true}

export default function Visualization({ selectedValidTime, selectedInitTime, selectedEnsembleMember, checkedReflectivity, selectedReflectivityOpacity }) {
    console.log("render occurred! Visualization")

    const { isPending, isError, data} = useQuery({
        queryKey: [formatDateAsString(new Date(selectedInitTime)) + "_" + formatDateAsString(new Date(selectedValidTime))],
        queryFn: async () => {
            console.log("---------------------------FETCH ATTEMPT MADE: initial init data -------------------------")
            let initTimeURL = getInitStrings(urlPrefix, filePrefix, variable, [ new Date(selectedInitTime)], selectedValidTime)[0];
         
            let response = await fetch(initTimeURL)
            let decodedResponse = await decodeAsync(response.body)
            console.log(decodedResponse)
            let featureCollectionObj = await buildDataObject(decodedResponse)
            return featureCollectionObj;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })

    if (isPending) {
        return (
            <div>
                Loading data for visualization...
            </div>
        )
    }

    if (data) {
        console.log(data)
        let plot_geom = data["MEM_" + selectedEnsembleMember][0];
        let plot_coords = data["MEM_" + selectedEnsembleMember][1];
        let plot_values = data["MEM_" + selectedEnsembleMember][2];
        let total_grid_cells = plot_coords.length;

        mapData = {
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
        console.log([mapData].flat())
        return (
            <div id="plotly-container">
                <Map data={[mapData].flat()} layout={mapLayout} config={mapConfig} />
                <Chart layout={chartLayout} config={chartConfig} />
            </div>
        )
    }
}