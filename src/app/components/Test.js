'use client'
let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

export default function Test() {
    console.log("TEST")
    // console.log(returnURL(202306290300))
    // console.log(returnURL(202306290300) == [202306290300, 20230630030000])
    // console.log(returnURL(202306290600) == [202306290300, 20230630060000])

    return (
        <div>
            <h3>Test results</h3>
            <p>Model run time, forecast minutes, URL integer 1, URL integer 2</p>
            <p>202306290300, 0, 202306290300, 20230630030000</p>
            <p>202306290300, 180, 202306290300, 20230630060000</p>

            <p>202306290100, 0, 202306290100, 20230630010000</p>
            <p>202306290100, 180, 202306290100, 20230630040000</p>

            <p>202306290000, 0, 202306290000, 20230630000000</p>
            <p>202306290000, 180, 202306290000,20230630030000</p>

            <p>202306292330, 0, 202306292330, 20230629 23 3000</p>
            <p>202306292330, 30, 202306292330, 20230630 00 0000</p>
            <p>202306292330, 35, 202306292330, 20230630 00 0500</p>
            <p>202306292330, 180, 202306292330, 20230630 02 3000</p>
        </div>
    )
}

function returnURL(forecastTime) {
    // Parameter forecastTime: integer
    forecastTime = forecastTime.toString()

    let date = new Date(Date.UTC(
        parseInt(forecastTime.substring(0, 4)),
        parseInt(forecastTime.substring(4, 6)) -1,
        parseInt(forecastTime.substring(6, 8)),
        parseInt(forecastTime.substring(8, 10)),
        parseInt(forecastTime.substring(10, 12)))
    );

    let URL = date;
    return URL.toUTCString();
}

function getInitStrings2(filteredInitTimes, selectedValidTime) {
    // Returns: an array of strings representing paths to messagepack files for the given init times.
    // Parameter urlPrefix: string variable set globally. First static section of URL to make messagepack requests to.
    // Parameter filePrefix: string variable set globally. Second static section of URL between the init time and valid time.
    // Parameter variable:  string variable set globally. Third static section of URL following the valid time and preceding the file extension.
    // Parameter filteredInitTimes: an array of Date objects corresponding to model run init times that contain the currently selected valid time.
    // Parameter selectedValidTime: a string representation of a Date object representing the currently selected valid time.

    let initStrings = [];
    let formattedSelect = formatDateAsString(new Date(selectedValidTime));

    // 

    filteredInitTimes.forEach((time) => {
        initStrings.push(urlPrefix + formatDateAsString(new Date(time)) + "/" + filePrefix +  formattedSelect + "00" + "_" + variable + ".msgpk")
    })

    return initStrings;
}
