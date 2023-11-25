'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

export default function Map({ data, layout, config}) {
    console.log("render occurred! Map")
    return (
        <div id="map-container">
            <Plot id="map" data={data} layout={layout} config={config} />
        </div>
    )

}