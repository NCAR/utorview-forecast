'use client'
import { useQueries } from '@tanstack/react-query'

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

export default function DataFetch({ filteredInitTimes, selectedValidTime }) {
    console.log("render occurred! DataFetch")
    let initStrings = getInitStrings(urlPrefix, filePrefix, variable, filteredInitTimes, selectedValidTime);

    const dataQueries = useQueries({
        queries: initStrings.map((initTimeURL) => {
          return {
            queryKey: [initTimeURL],
            queryFn: async () => {
                console.log("---------------------------FETCH ATTEMPT MADE: init data -------------------------")
                let data = await fetch(initTimeURL)
                return data
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            retry: false
          }
        }),
      })
}

function formatDateAsString(time) {
    // Returns: A string of numbers representing a date and time. e.g. June 29, 2023 at 23:30 returns '202306292330'.
    // Parameter time: A Date object.

    let year = time.getUTCFullYear();
    let month = String(time.getUTCMonth() + 1).padStart(2, '0');
    let day = String(time.getUTCDate()).padStart(2, '0');
    let dateInNumberFormat = `${year}${month}${day}`;

    let hours = String(time.getUTCHours()).padStart(2, '0');
    let minutes = String(time.getUTCMinutes()).padStart(2, '0');
    let timeInNumberFormat = `${hours}${minutes}`;

    return dateInNumberFormat + timeInNumberFormat;
}

function getInitStrings(urlPrefix, filePrefix, variable, filteredInitTimes, selectedValidTime) {
    // Returns: an array of strings representing paths to messagepack files for the given init times.
    // Parameter urlPrefix: string variable set globally. First static section of URL to make messagepack requests to.
    // Parameter filePrefix: string variable set globally. Second static section of URL between the init time and valid time.
    // Parameter variable:  string variable set globally. Third static section of URL following the valid time and preceding the file extension.
    // Parameter filteredInitTimes: an array of Date objects corresponding to model run init times that contain the currently selected valid time.
    // Parameter selectedValidTime: a string representation of a Date object representing the currently selected valid time.

    let initStrings = [];
    let formattedSelect = formatDateAsString(new Date(selectedValidTime));

    filteredInitTimes.forEach((time) => {
        initStrings.push(urlPrefix + formatDateAsString(new Date(time)) + "/" + filePrefix +  formattedSelect + "00" + "_" + variable + ".msgpk")
    })

    return initStrings;
}