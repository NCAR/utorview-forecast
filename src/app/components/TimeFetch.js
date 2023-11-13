'use client'
import { useQuery } from '@tanstack/react-query'

let datesURL = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/available_dates.csv"
let validInitHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
let forecastLength = 180;
let forecastInterval = 5;
let forecastMinutesArray = Array.from({ length: (forecastLength / forecastInterval) + 1 }, (_, index) => index * forecastInterval).reverse();

export default function TimeFetch({ onDatesFetch }) {
    // Makes fetch request to available_dates.csv to get list of valid model run times.
    console.log("Render occurred! ValidTimeFetch")
    const { isPending, isError, data} = useQuery({
        queryKey: [datesURL],
        queryFn: async () => {
            console.log("---------------------------FETCH ATTEMPT MADE: dates-------------------------")
            const data = await fetch(datesURL).then((res) => res.text());
            const initDatesList = formatInitTimes(data);
            const validDatesList = formatValidTimes(initDatesList);

            onDatesFetch(initDatesList, validDatesList);
            return data
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })

    if (isPending) {
        return <span>Loading available model run dates...</span>
    }

    if (isError) {
        return <span>Error fetching dates - try again later.</span>
    }
}

function formatInitTimes(data) {
    // Returns: array of Date objects representing valid model run times (init times).
    // Parameter data: text representation of a fetched csv file containing valid model run datetimes.
    let run_date_strs = data.split("\n");
    let dates = [];
    for (let i=0; i< run_date_strs.length; i++) {
        dates.push(new Date(Date.UTC(
            parseInt(run_date_strs[i].substring(0, 4)),
            parseInt(run_date_strs[i].substring(4, 6)) -1,
            parseInt(run_date_strs[i].substring(6, 8)),
            parseInt(run_date_strs[i].substring(8, 10)),
            parseInt(run_date_strs[i].substring(10, 12)))
        ));
    }
    dates = dates.filter(function(d) {return validInitHours.includes(d.getUTCHours());});
    dates = dates.sort((a, b) => b - a);
    return dates;
}

function formatValidTimes(initDatesList) {
    // Returns: array of UTC Date strings representing unique valid forecast times (valid times).
    // Parameter initDatesList: an array of Date objects representing valid model run times (init times).
    const newDatesArray = initDatesList.flatMap(initDate => {
        return forecastMinutesArray.map(minutes => {
            const validDate = new Date(initDate);
            validDate.setMinutes(initDate.getMinutes() + minutes);
            return validDate.toUTCString();
        });
    });

    return Array.from(new Set(newDatesArray));
}

