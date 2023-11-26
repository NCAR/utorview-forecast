'use client'
import { Suspense } from 'react';
import Map from './Map.js';
import Chart from './Chart.js';
import CircularProgress from '@mui/material/CircularProgress';
import { formatDateAsString, getInitStrings, buildDataObject, get_wofs_domain_geom } from './DataFetch.js';
import { useQuery } from '@tanstack/react-query';
import { decodeAsync } from '@msgpack/msgpack';
import proj4 from 'proj4';


let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

let domain;

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
     
            let featureCollectionObj = await buildDataObject(decodedResponse)
            domain = get_wofs_domain_geom(decodedResponse);

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
            <div className="loading">
                <CircularProgress />
                Loading visualization...
            </div>
        )
    }

    if (data) {
        return (
            <div id="plotly-container">
                <Suspense fallback={
                    <div className="loading">
                        <CircularProgress />
                        Loading visualization...
                    </div>}
                >
                    <Map data={data["MEM_" + selectedEnsembleMember]} domain={domain} />
                    <Chart layout={chartLayout} config={chartConfig} />
                </Suspense>
            </div>
        )
    }
}