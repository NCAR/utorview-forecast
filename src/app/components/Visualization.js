'use client'
import { formatDateAsString, getInitStrings } from './DataFetch.js';
import { useQuery } from '@tanstack/react-query'
import { decodeAsync } from '@msgpack/msgpack'
import dynamic from 'next/dynamic';

const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

export default function Visualization({ selectedValidTime, selectedInitTime, selectedEnsembleMember, checkedReflectivity, selectedReflectivityOpacity }) {
    console.log("render occurred! Visualization")

    // requests data that is already in cache after being fetched in DataFetch
    const { isPending, isError, data} = useQuery({queryKey: [formatDateAsString(new Date(selectedInitTime)) + "_" + formatDateAsString(new Date(selectedValidTime))],})

    if (isPending) {
        return <div>Loading data for visualization...</div>
    }

    if (data) {
        console.log(data)
        return <div>Requested data successfully loaded.</div>
    }
}