'use client'
import { useQueries } from '@tanstack/react-query'
import { decodeAsync } from '@msgpack/msgpack'

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

export default function DataFetch({ filteredInitTimes, selectedValidTime }) {
    console.log("render occurred! DataFetch")
    let initStrings = getInitStrings(urlPrefix, filePrefix, variable, filteredInitTimes, selectedValidTime);

    const dataQueries = useQueries({
        queries: initStrings.map((initTimeURL, i) => {
          return {
            queryKey: [formatDateAsString(filteredInitTimes[i]) + "_" + formatDateAsString(new Date(selectedValidTime))],
            queryFn: async () => {
                console.log("---------------------------FETCH ATTEMPT MADE: init data -------------------------")
                let response = await fetch(initTimeURL)
                let decodedResponse = await decodeAsync(response.body)
                return decodedResponse;
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            retry: false
          }
        }),
    })

    const queryStatuses = dataQueries.map(query => {
        if (query.status === 'success') {
            return query.data;
        } 
        return null;
    });
}

export function formatDateAsString(time) {
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

export function getInitStrings(urlPrefix, filePrefix, variable, filteredInitTimes, selectedValidTime) {
    // Returns: an array of strings representing paths to messagepack files for the given init times.
    // Parameter urlPrefix: string variable set globally. First static section of URL to make messagepack requests to.
    // Parameter filePrefix: string variable set globally. Second static section of URL between the init time and valid time.
    // Parameter variable:  string variable set globally. Third static section of URL following the valid time and preceding the file extension.
    // Parameter filteredInitTimes: an array of Date objects corresponding to model run init times that contain the currently selected valid time.
    // Parameter selectedValidTime: a string representation of a Date object representing the currently selected valid time.

    let initStrings = [];
    let formattedSelect = formatDateAsString(new Date(selectedValidTime));
    let offsetFormattedSelect = formatDateAsString(new Date(new Date(selectedValidTime).getTime() + 86400000))

    filteredInitTimes.forEach((time) => {
        if (time.getUTCHours() <= 4) {
            initStrings.push(urlPrefix + formatDateAsString(new Date(time)) + "/" + filePrefix +  offsetFormattedSelect + "00" + "_" + variable + ".msgpk")
        } else {
            initStrings.push(urlPrefix + formatDateAsString(new Date(time)) + "/" + filePrefix +  formattedSelect + "00" + "_" + variable + ".msgpk")
        }
    })

    console.log(initStrings)
    return initStrings;
}