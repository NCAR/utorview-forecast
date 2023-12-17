'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

let chartLayout = {
    margin: { t: 30, b: 40, l: 30, r: 30 },
    uirevision:'true'
}

let chartConfig = {responsive: true}

export default function Chart({ data, selectedPoint, domain }) {
    console.log("render occurred! Chart")

    console.log(data)

    // let fcst_dates = get_fcst_date_range(selectedModelRun,5);

    let spaghetti_traces = {
        // x: [fcst_dates[Math.floor(msg_file_len/2)]],
        // y: [0.25],
        type: 'scatter',
        showlegend: false,
        opacity: 0
    };

    // //dictionary for gray lines to show on spaghetti plot
    let wofs_domain = {
        type: "scatter",
        showlegend: false,
        mode: 'lines',
        line: {color: 'grey', width: 2},
        lon: domain[0],
        lat: domain[1],
    };

    // if (data) {
    //     let spaghetti_data = data;
    //     spaghetti_traces = build_traces(spaghetti_data, fcst_dates)
    // }

    // //dictionary for black line on spaghetti plot
    let cell_domain = {
        type: "scatter",
        showlegend: false,
        mode: 'lines',
        line: {color: 'black', width: 2},
        lon: null,
        lat: null
    };

    // let all_traces = [spaghetti_traces, wofs_domain, cell_domain].flat();

    // let layout = {
    //     showlegend: true,
    //     uirevision:'true',
    //     yaxis: {range: [0, 0.5], title: {text:'Probability of Tornado', font: {size: 20}}},
    //     xaxis: {range: [fcst_dates[0], fcst_dates[fcst_dates.length-1]], title: {text:'Forecast Date/Time', font: {size: 18}}, tickformat: '%m-%d %H:%M', tickangle: 35},
    //     shapes: [{
    //         type: 'line',
    //         x0: fcst_dates[0],
    //         y0: 0,
    //         x1: fcst_dates[0],
    //         y1: 0.5,
    //         opacity: 0.3,
    //         line: {color: 'rgba(0,128,26,0.68)',
    //             width: 10,
    //             opacity: 0.5
    //         }
    //     }],
    //     legend: {
    //         y: 1,
    //         x: 0.95,
    //         font: {size: 18},
    //     }
    // }

    let config = {responsive: true}

    return (
        <div id="chart-container">
            chart placeholder
            {/* <Plot id="chart" data={data} layout={layout} config={config} /> */}
        </div>
    )

}

function build_traces(trace_data, fcst_dates) {
    console.log("build_traces() called")

    // iterates over spaghetti data to build a list of dictionaries that can be used to build lines in plotly for the spaghetti plot
    // also takes care of styling the mean and median lines
    let all_traces = []
    let forecast_minutes = fcst_dates;
    for (let i=1; i<=trace_data.length; i++) {
        var trace = {
          x: forecast_minutes,
          y: trace_data[i],
          type: 'scatter',
          showlegend: false,
          line: {color: 'lightgrey', width: 1}
        };
        all_traces.push(trace)
    }
    var mean = {
          name: "Mean",
          x: forecast_minutes,
          y: trace_data["ens_mean"],
          type: 'scatter',
          line: {color: 'black', width: 4}
        };
    all_traces.push(mean)

    var median = {
          name: 'Median',
          x: forecast_minutes,
          y: trace_data["ens_median"],
          type: 'scatter',
          line: {color: 'black', width: 2, dash: 'dot'}
        };
    all_traces.push(median)

    return all_traces
}

async function spaghetti(i, j, msg_file_len, json) {
    console.log("spaghetti() called")
    // getting the data associated with point i, j on the map
    const calc_mean = array => array.reduce((a, b) => a + b) / array.length
    const calc_median = (arr) => {return arr.slice().sort((a, b) => a - b)[Math.floor(arr.length / 2)]; };

    let d = {'length': 18, 'ens_mean': [], 'ens_median': []}
        for (let m of d3.range(0, ((msg_file_len-1) * 5) + 5, 5)) {
            let fm = "fm_" + m
            let f = json[fm]
            let ens_all_ts = []
            for (let mem=1; mem<19; mem++) {
                if (m===0) { d[mem] = [] }
                var member = "MEM_" + String(mem)
                var found = false
                let row_indices = f[member]['rows'].flatMap((x, z) => x === i ? z : [])
                for (let index=0; index<row_indices.length; index++) {
                    if (f[member]['columns'][row_indices[index]] === j) {
                        d[mem].push(f[member]['values'][row_indices[index]])
                        found = true
                    }
                }
                if (found === false) { d[mem].push(0) }
                ens_all_ts.push(d[mem][m/5])
            }
        let mean_ens = calc_mean(ens_all_ts)
        let median_ens = calc_median(ens_all_ts)
        d['ens_mean'].push(mean_ens)
        d['ens_median'].push(median_ens)
    }
    return d
}


function getFcstDateRange(selectedModelRun, interval) {
    console.log("get_fcst_date_range() called")
    // get list of forecast dates/times based on the given interval of minutes
    let datetime = selectedModelRun;
  
    let year = datetime.substring(0, 4);
    let month = parseInt(datetime.substring(4, 6)) - 1;
    let day = datetime.substring(6, 8);
    let start_hour = datetime.substring(8, 10);
    let start_min = datetime.substring(10, 12);
    let start_hour_int = parseInt(start_hour);
    let start_date = new Date(year, month, day, start_hour, start_min);
    if (start_hour_int <=4)
    {
      start_date = new Date(start_date.getTime() + 86400000);
    }
    var end_date = new Date(start_date.getTime() + 3 * 3600000 + 5 * 60000);
    let date_range = d3.timeMinutes(start_date,
            end_date, interval);
    return date_range;
}


  function get_ens_file_strings(selectedModelRun, file_prefix, interval, variable) {
    console.log("get_ens_file_strings() called")
    // Returns: a list of strings representing URLs to messagepack datasets corresponding to the requested data for the requested time
    // Parameters being used in initialization: "wofs_sparse_prob_",5,"ML_PREDICTED_TOR"
    // file_prefix, interval, and variable are used in order to construct the proper URL at the end

    // taking the currently selected value of the date dropdown menu and parsing it into parts
    const formatTime = d3.timeFormat("%Y%m%d%H%M00");
    var datetime = selectedModelRun;
    var year = datetime.substring(0, 4);
    var month = parseInt(datetime.substring(4, 6)) - 1
    var day = datetime.substring(6, 8)
    var start_hour = datetime.substring(8, 10)
    var start_min = datetime.substring(10, 12)
    var start_hour_int = parseInt(start_hour)

    if (start_hour_int <=4)
    {
        var start_date = new Date(year, month, day, start_hour, start_min);
        start_date = new Date(start_date.getTime() + 86400000);
    }
    else
    {
        start_date = new Date(year, month, day, start_hour, start_min);
    }
    var end_date = new Date(start_date.getTime() + 3 * 3600000 + 5 * 60000)

    // returning a list of time objects - minutes separated by interval within the time range
    var end_hour =  end_date.getHours()
    var date_range = d3.timeMinutes(start_date, end_date, interval)

    // creating list of strings corresponding to the URLs to the relevant messagepack datasets corresponding to the 
    // list of timestamps just created
    let file_list = [];
    let init_time = datetime.substring(0, 8)
    date_range.forEach(function(x) {file_list.push("https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
        + init_time + start_hour + start_min + "/" + file_prefix +  formatTime(x) + "_" + variable + ".msgpk")});
    return file_list;
}