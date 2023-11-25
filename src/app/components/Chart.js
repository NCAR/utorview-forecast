'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

export default function Chart({ data, layout, config}) {
    console.log("render occurred! Chart")
    return (
        <div id="chart-container">
            <Plot id="chart" data={data} layout={layout} config={config} />
        </div>
    )

}