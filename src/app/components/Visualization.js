'use client'
import { formatDateAsString, getInitStrings } from './DataFetch.js';
import { useQuery } from '@tanstack/react-query'
import { decodeAsync } from '@msgpack/msgpack'

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

export default function Visualization({ selectedValidTime, selectedInitTime }) {
    console.log("render occurred! Visualization")


    const { isPending, isError, data} = useQuery({
        queryKey: [formatDateAsString(new Date(selectedInitTime)) + "_" + formatDateAsString(new Date(selectedValidTime))],
            queryFn: async () => {
                console.log("---------------------------FETCH ATTEMPT MADE: default init data -------------------------")
                let response = await fetch(getInitStrings(urlPrefix, filePrefix, variable, selectedInitTime, selectedValidTime)[0])
                let decodedResponse = await decodeAsync(response.body)
                return decodedResponse;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            retry: false
    })

    if (isPending) {
        return <div>Loading data for visualization...</div>
    }

    if (data) {
        console.log(data)
    }
}