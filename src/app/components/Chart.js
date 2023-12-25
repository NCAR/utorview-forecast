'use client'
import { useMemo } from "react";
import { useQueries } from '@tanstack/react-query'
import { decodeAsync } from '@msgpack/msgpack'
import { formatDateAsString, buildDataObject } from './DataFetch.js';
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

let numberOfEnsembleMembers = 18;
let forecastLength = 180;
let forecastInterval = 5;
let forecastMinutesArray = Array.from({ length: (forecastLength / forecastInterval) + 1 }, (_, index) => index * forecastInterval).reverse();


export default function Chart({ selectedValidTime, selectedInitTime, selectedPoint, domain }) {
    console.log("render occurred! Chart")

    let validStartTime = useMemo(() => 
        (new Date(selectedInitTime).getUTCHours() <= 4) ? 
            (new Date(new Date(selectedInitTime).getTime() + 86400000)) : new Date(selectedInitTime),
        [selectedInitTime, selectedValidTime]
    );    
    
    let forecastDates = useMemo(() => 
        forecastMinutesArray.map(timestamp => 
            new Date(validStartTime.getTime() + (timestamp * 60000))
        ),
        [selectedInitTime, selectedValidTime, validStartTime]
    );
    
    let initStrings = getOneModelRunStrings(selectedInitTime, forecastDates);

    const chartDataQueries = useQueries({
        queries: initStrings.map((initTimeURL, i) => {
          return {
            queryKey: [formatDateAsString(new Date(selectedInitTime)) + "-" + formatDateAsString(forecastDates[i])],
            queryFn: async () => {
                console.log("---------------------------FETCH ATTEMPT MADE: chart data -------------------------")
                let response = await fetch(initTimeURL);
                let decodedResponse = await decodeAsync(response.body);
                return decodedResponse;
            }
          }
        }),
    })

    if (!selectedPoint) {
        let data = [
            {
              type: 'scatter',
              x: [],
              y: []
            }
          ];
        
          let layout = {
            margin: {t: 25, b: 90, l: 70, r: 60},
            xaxis: {
              title: 'Forecast Date/Time',
              range: [0,1],
              showticklabels: false,
              titlefont: {size: 18}
            },
            yaxis: {
              title: 'Probability of Tornado',
              range: [0,1],
              showticklabels: false,
              titlefont: {size: 20}
            },
            annotations: [
              {
                x: 0.5,
                y: 0.5,
                xref: 'paper',
                yref: 'paper',
                text: 'Select a cell on the map to get spaghetti plot data.',
                showarrow: false,
                font: {
                  family: 'Arial',
                  size: 14
                }
              }
            ]
          };

          let config = {responsive: true};
          return (
            <div id="chart-container">
                <Plot id="chart" data={data} layout={layout} config={config} />
            </div>
        )
    }

    const cellData = chartDataQueries.map(query => {
        if (query.status === 'success') {
            return getSelectedCellData(query.data, selectedPoint);
        } 
        return null;
    });


    if (cellData.some(e => e === null)) {
        return (
            <div id="chart-container">
                Building spaghetti plot...
            </div>
        )
    } else {
        let calcMean = (arr) => {return arr.reduce((a, b) => a + b) / arr.length};
        let calcMedian = (arr) => {return arr.slice().sort((a, b) => a - b)[Math.floor(arr.length / 2)]; };

        let chartMean = [];
        let chartMedian = [];

        for (let row of cellData) {
            chartMean.push(calcMean(row));
            chartMedian.push(calcMedian(row));
        }

        let chartData = cellData.reduce((acc, array) => {
            array.forEach((value, index) => {
              if (!acc[index + 1]) acc[index + 1] = [];
              acc[index + 1].push(value);
            });
            return acc;
        }, {});

        chartData["ens_mean"] = chartMean;
        chartData["ens_median"] = chartMedian;

        window.dispatchEvent(new Event('resize'));

        //dictionary for gray lines to show on spaghetti plot
        let wofs_domain = {
            type: "scatter",
            showlegend: false,
            mode: 'lines',
            line: {color: 'grey', width: 2},
            lon: domain[0],
            lat: domain[1],
        };

        //dictionary for black line on spaghetti plot
        let cell_domain = {
            type: "scatter",
            showlegend: false,
            mode: 'lines',
            line: {color: 'black', width: 2},
            lon: null,
            lat: null
        };

        let spaghetti_traces = buildTraces(chartData, forecastDates);
        let all_traces = [spaghetti_traces, wofs_domain, cell_domain].flat();

        let layout = {
            showlegend: true,
            uirevision:'true',
            margin: {t: 25, b: 90, l: 70, r: 60},
            yaxis: {range: [0, 0.5], title: {text:'Probability of Tornado', font: {size: 20}}},
            xaxis: {range: [forecastDates[0], forecastDates[forecastDates.length-1]], title: {text:'Forecast Date/Time', font: {size: 18}}, tickformat: '%m-%d %H:%M', tickangle: 35},
            shapes: [{
                type: 'line',
                x0: forecastDates[0],
                y0: 0,
                x1: forecastDates[0],
                y1: 0.5,
                opacity: 0.3,
                line: {color: 'rgba(0,128,26,0.68)',
                    width: 10,
                    opacity: 0.5
                }
            }],
            legend: {
                y: 1,
                x: 0.95,
                font: {size: 18},
            }
        }
        let config = {responsive: true};

        return (
            <div id="chart-container">
                <Plot id="chart" data={all_traces} layout={layout} config={config} />
            </div>
        )
    }
}

function buildTraces(data, forecastDates) {
    console.log("build_traces() called")

    let all_traces = [];

    Object.entries(data).slice(0, numberOfEnsembleMembers).forEach(([key, data], i) => {
        var trace = {
          x: forecastDates,
          y: data,
          type: 'scatter',
          showlegend: false,
          line: {color: 'lightgrey', width: 1}
        };
        all_traces.push(trace)
    });

    var mean = {
          name: "Mean",
          x: forecastDates,
          y: data["ens_mean"],
          type: 'scatter',
          line: {color: 'black', width: 4}
        };
    all_traces.push(mean)

    var median = {
          name: 'Median',
          x: forecastDates,
          y: data["ens_median"],
          type: 'scatter',
          line: {color: 'black', width: 2, dash: 'dot'}
        };
    all_traces.push(median)

    return all_traces
}

function getOneModelRunStrings(selectedInitTime, forecastDates) {
    // Returns: an array of strings representing paths to messagepack files for the next forecastInterval for the given model run. Used to get the URLs needed to construct the spaghetti plot.
    // Parameter selectedInitTime: A Date string representing the currently selected init time (aka model run).
    // Parameter forecastDates: An array of Date objects representing each timestamp of data outputted by the selected model.

    let runInitStrings = [];

    let formattedInit = formatDateAsString(new Date(selectedInitTime));

    for (let timestamp of forecastDates) {
        let formattedValidTime = formatDateAsString(timestamp)
        runInitStrings.push(urlPrefix + formattedInit + "/" + filePrefix + formattedValidTime + "00_" + variable + ".msgpk");
    }

    return runInitStrings;
}

function getSelectedCellData(decodedResponse, selectedPoint) {
    let yValues = [];
    Object.entries(decodedResponse).slice(0, numberOfEnsembleMembers).forEach(([key, message]) => {
        let index = message.rows.findIndex((row, idx) => row === selectedPoint[0] && message.columns[idx] === selectedPoint[1]);
        yValues.push(index !== -1 ? message.values[index] : 0);
    });
    return yValues;
}