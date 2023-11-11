'use client'
let forecastLength = 180; //todo: change this to a global variable
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"
let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"

export default function InitTimeFetch({ initTimes, selectedValidTime }) {
    console.log("render occurred! InitTimeFetch")

    let correspondingInitTimes = getCorrespondingInitTimes(initTimes, selectedValidTime);
    let initStrings = getInitStrings(urlPrefix, filePrefix, variable, correspondingInitTimes, selectedValidTime);

    return (
        <div>
            <select>
                {correspondingInitTimes.map((initTime) => <option key={initTime.toUTCString()} value={initTime.toUTCString()}>{initTime.toUTCString()}</option>)}
            </select>
        </div>
    )
}

function getCorrespondingInitTimes(initTimes, selectedValidTime) {
    // Returns: an array of Date objects corresponding to model run init times that include predictions for the selected valid time.
    // Parameter initTimes: an array of Date objects corresponding to all model run init times.
    // Parameter selectedValidTime: a UTC string representation of the currently selected valid time.

    let selectedValidTimeUTC = new Date(selectedValidTime);

    let earliestInitTime = new Date(selectedValidTimeUTC.getTime() - forecastLength * 60 * 1000);
    let filteredInitTimes = initTimes.filter(date => date >= earliestInitTime && date <= selectedValidTimeUTC);

    return filteredInitTimes;
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
