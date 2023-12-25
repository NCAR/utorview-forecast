'use client'
import { useState } from 'react';
import Map from './Map.js';
import Chart from './Chart.js';
import CircularProgress from '@mui/material/CircularProgress';
import { formatDateAsString, getInitStrings, buildDataObject, get_wofs_domain_geom, get_selected_cell_geom, getMetadata} from './DataFetch.js';
import { useQuery } from '@tanstack/react-query';
import { decodeAsync } from '@msgpack/msgpack';

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"

let metadata;
let domain;
let cell_domain;

export default function Visualization({ selectedValidTime, selectedInitTime, filteredInitTimes, selectedEnsembleMember, checkedReflectivity, selectedReflectivityOpacity, selectedViews, onCellSelect }) {
    console.log("render occurred! Visualization")
    const [selectedPoint, setSelectedPoint] = useState(null);

    function handleSelectPoint(e) {
        console.log("pt selection detected")

        setSelectedPoint(e ? e.points[0].customdata : null);
        console.log(e ? e.points[0].customdata : null)

        if (e) {
            if (!selectedViews.includes("chart")) {
                onCellSelect(e, ["map", "chart"])
            } 
        }
    }

    const { isPending, isLoading, isError, data} = useQuery({
        queryKey: [formatDateAsString(new Date(selectedInitTime)) + "_" + formatDateAsString(new Date(selectedValidTime))],
        queryFn: async () => {
            console.log("---------------------------FETCH ATTEMPT MADE: initial init data -------------------------")
            let variable = "ML_PREDICTED_TOR";
            let initTimeURL = getInitStrings(urlPrefix, filePrefix, variable, [ new Date(selectedInitTime)], selectedValidTime)[0];
         
            let response = await fetch(initTimeURL)
            let decodedResponse = await decodeAsync(response.body)
            metadata = getMetadata(decodedResponse);
            let featureCollectionObj = await buildDataObject(decodedResponse)
            domain = get_wofs_domain_geom(metadata);
            return featureCollectionObj;
        }
    })

    const { isLoading: reflPending, isError: reflError, data: reflData} = useQuery({
        queryKey: ["Refl" + formatDateAsString(new Date(selectedInitTime)) + "_" + formatDateAsString(new Date(selectedValidTime))],
        queryFn: async () => {
            console.log("---------------------------FETCH ATTEMPT MADE: initial reflection data -------------------------")
            let variable = "COMPOSITE_REFL_10CM";
            let initTimeURL = getInitStrings(urlPrefix, filePrefix, variable, [ new Date(selectedInitTime)], selectedValidTime)[0];
         
            let response = await fetch(initTimeURL)
            let decodedResponse = await decodeAsync(response.body)

            let featureCollectionObj = await buildDataObject(decodedResponse)
    
            return featureCollectionObj;
        },
        enabled: !!checkedReflectivity
    })

    if (isPending || isLoading) {
        return (
            <div className="loading">
                <CircularProgress />
                Loading visualization...
            </div>
        )
    }

    if (data) {
        if (selectedPoint) {
            cell_domain = get_selected_cell_geom(metadata, selectedPoint[0], selectedPoint[1]);
        } else {
            cell_domain = null;
        }

        return (
            <div id="plotly-container">
                {reflPending && 
                    <CircularProgress sx={{position: "absolute", top: "50%", left: "50%", zIndex: 1000}}/>
                }

                {selectedViews.includes("map") &&
                    <Map 
                        data={data["MEM_" + selectedEnsembleMember]} 
                        reflData={(reflData && checkedReflectivity) ? reflData["MEM_" + selectedEnsembleMember] : null} 
                        selectedReflOpacity={selectedReflectivityOpacity} 
                        domain={domain} 
                        onSelectPoint={ handleSelectPoint } 
                        selectedCellData={cell_domain} 
                    />
                }

                {selectedViews.includes("chart") &&
                    <Chart 
                        selectedValidTime={ selectedValidTime }
                        selectedInitTime={ selectedInitTime }
                        selectedPoint={ selectedPoint } 
                        domain={ domain } 
                    />
                }
            </div>
        )
    }
}

