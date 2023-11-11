
let forecastLength = 180; //todo: change this to a global variable

export default function DataFetch({ initTimes, selectedValidTime }) {
    console.log("render occurred! DataFetch")
    let correspondingInitTimes = getCorrespondingInitTimes(initTimes, selectedValidTime);
    let initStrings = getInitStrings(correspondingInitTimes);
}

function getCorrespondingInitTimes(initTimes, selectedValidTime) {
    // Returns: an array of Date objects corresponding to model run init times that include predictions for the selected valid time.
    let selectedValidTimeUTC = new Date(selectedValidTime);

    let earliestInitTime = new Date(selectedValidTimeUTC.getTime() - forecastLength * 60 * 1000);
    let filteredInitTimes = initTimes.filter(date => date >= earliestInitTime && date <= selectedValidTimeUTC);

    return filteredInitTimes;
}

function getInitStrings(filteredInitTimes) {
    // Returns: an array of strings representing paths to messagepack files for the given init times.
    console.log(filteredInitTimes)

    let timeNumFormat = [];

    filteredInitTimes.forEach((time) => {
        let year = time.getUTCFullYear();
        let month = String(time.getUTCMonth() + 1).padStart(2, '0');
        let day = String(time.getUTCDate()).padStart(2, '0');
        let dateInNumberFormat = `${year}${month}${day}`;

        let hours = String(time.getUTCHours()).padStart(2, '0');
        let minutes = String(time.getUTCMinutes()).padStart(2, '0');
        let timeInNumberFormat = `${hours}${minutes}`;

        timeNumFormat.push([dateInNumberFormat, timeInNumberFormat])
    })
    console.log(timeNumFormat)
}
