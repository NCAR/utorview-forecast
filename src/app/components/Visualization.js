'use client'
import Map from './Map.js';
import Chart from './Chart.js';
import { formatDateAsString, getInitStrings } from './DataFetch.js';
import { useQuery } from '@tanstack/react-query'
import { decodeAsync } from '@msgpack/msgpack'

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

const mapLayout = {
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
let chartConfig = {responsive: true}

const mapData = [
    {
        type: 'scattermapbox',
        lon: [0],
        lat: [0],
    }
];

const chartLayout = {
    margin: { t: 30, b: 40, l: 30, r: 30 }
}

export default function Visualization({ selectedValidTime, selectedInitTime, selectedEnsembleMember, checkedReflectivity, selectedReflectivityOpacity }) {
    console.log("render occurred! Visualization")

    // requests data that is already in cache after being fetched in DataFetch
    const { isPending, isError, data} = useQuery({queryKey: [formatDateAsString(new Date(selectedInitTime)) + "_" + formatDateAsString(new Date(selectedValidTime))],})

    if (isPending) {
        return (
        <div>
            Loading data for visualization...
        </div>)
    }

    if (data) {
        console.log(data)
        return (
            <div id="plotly-container">
                <Map data={mapData} layout={mapLayout} config={mapConfig} />
                <Chart layout={chartLayout} config={chartConfig} />
            </div>
        )
    }
}