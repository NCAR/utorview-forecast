'use client'
import { useQueries } from '@tanstack/react-query'
import { decodeAsync } from '@msgpack/msgpack'
import proj4 from 'proj4';

let urlPrefix = "https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
let filePrefix = "wofs_sparse_prob_"
let variable = "ML_PREDICTED_TOR"

let wofs_x_length = 300;
let wofs_y_length = 300;
let resolution = 3000;
let radius = resolution / 2;

// reprojecting the data coordinates
let orig_proj = "WGS84";
let base_proj = "+proj=lcc +lat_0=34.321392 +lon_0=-98.0134 +lat_1=30 +lat_2=60 +a=6370000 +b=6370000 +ellps=WGS84";
let base_transformer = proj4(base_proj, orig_proj);

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
                let featureCollectionObj = await buildDataObject(decodedResponse)
                return featureCollectionObj;
            }
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

function derive_new_proj(base_transformer, coord) {
    console.log("derive_new_proj() called")
    // Returns: a projection object (?), creates projection system from the data for transformation later
    let center_proj_x = coord[1] + (3000 * 150) + 1500
    let center_proj_y = coord[0] + (3000 * 150) + 1500
    let center_lonlat = base_transformer.forward([center_proj_y, center_proj_x])
    let proj ="+proj=lcc +lat_0=" + center_lonlat[1] + " +lon_0=" + center_lonlat[0] + " +lat_1=30 +lat_2=60 +a=6370000 +b=6370000 +ellps=WGS84";
  
    return proj
}
  
export async function buildDataObject(data) {
    console.log("-------------------build_data_object() called")
    // Returns: None. for each ensemble member of the requested messagepack data file, creates a FeatureCollection where each data coordinate is represented by a list of cornerpoints that center it
    // and saves it to a json.
    // Parameters on initialization: build_data_object(0,1,json,plot_d);
    let featureCollectionObj = {};

    let base_coord = base_transformer.inverse(data['se_coords']);
    let wofs_proj = derive_new_proj(base_transformer, base_coord);
    let transformer = proj4(wofs_proj, orig_proj);

    // // reprojecting the coordinates in the data
    let coord = transformer.inverse(data['se_coords'])
    let lon_array_m = create_coord_array(coord[0], wofs_x_length, resolution)
    let lat_array_m = create_coord_array(coord[1], wofs_y_length, resolution)
  
    // // creating a FeatureCollection for each ensemble member
    for (let ensemble in data) {
        let subset = data[ensemble];
        if (subset["rows"]) {
            let plot_data = create_geom_object(transformer, subset["rows"], subset["columns"], lon_array_m, lat_array_m);
            plot_data.push(subset["values"])
            featureCollectionObj[ensemble] = plot_data
        }
    }
    return featureCollectionObj;
}

function create_coord_array(coord, len, resolution) {
    console.log("create_coord_array() called")
    // Returns: an array of coordinates constructed based on the resolution and length of provided data
    let array = new Array(len);
    for (let i=0; i<len; i++) { array[i] = coord + (resolution * i); }
    return array
}

function create_geom(transformer, i, j, lons, lats) {
    console.log("create_geom() called")
    // Returns a list of five (?) coordinates representing the corners of a square on the grid in which a data coordinate is centered
  
    // radius representing the size of a grid cell to center the data point within corner coordinates
    let south_lat_m = lats[i] - radius
    let north_lat_m = lats[i] + radius
    let west_lon_m = lons[j] - radius
    let east_lon_m = lons[j] + radius
  
    let se = transformer.forward([east_lon_m, south_lat_m])
    let ne = transformer.forward([east_lon_m, north_lat_m])
    let sw = transformer.forward([west_lon_m, south_lat_m])
    let nw = transformer.forward([west_lon_m, north_lat_m])
  
    return [sw, nw, ne, se, sw]
}
  
function create_geom_object(transformer, i_indices, j_indices, lons, lats) {
    console.log("create_geom_object() called")
    // Returns: FeatureCollection representing the coordinate grid provided as parameters
    // Parameters on initialization: subset["rows"], subset["columns"], lon_array_m, lat_array_m
    let coords = new Array(i_indices.length)
  
    // making new FeatureCollection of size corresponding to the provided coordinate arrays
    let grid_obj = {type: "FeatureCollection", features: new Array(i_indices.length)}
    // constructing an array of cornerpoints for each part of the grid and adding it to the FeatureCollection
    for (let index=0; index < i_indices.length; index++ ) {
        coords[index] = [i_indices[index], j_indices[index]]
        let geom = create_geom(transformer, i_indices[index], j_indices[index], lons, lats)
        let grid_cell_obj = {type: "Feature",
                             id: index,
                             geometry: {type: "Polygon", coordinates: [geom]}}
        grid_obj["features"][index] = grid_cell_obj
    }
    return [grid_obj, coords]
}

export function get_wofs_domain_geom(metadata) {
    console.log("get_wofs_domain_geom() called")

    let transformer = metadata.transformer;
    let lon_array_m = metadata.lon_array_m;
    let lat_array_m = metadata.lat_array_m;

    let se = transformer.forward([lon_array_m[0], lat_array_m[0]]);
    let sw = transformer.forward([lon_array_m[wofs_x_length - 1], lat_array_m[0]]);
    let nw = transformer.forward([lon_array_m[wofs_x_length - 1], lat_array_m[wofs_y_length - 1]]);
    let ne = transformer.forward([lon_array_m[0], lat_array_m[wofs_y_length - 1]]);
    let center = transformer.forward([lon_array_m[Math.floor(wofs_x_length / 2)], lat_array_m[Math.floor(wofs_y_length / 2)]])
    let lons = [se[0], sw[0], nw[0], ne[0], se[0]]
    let lats = [se[1], sw[1], nw[1], ne[1], se[1]]

    return [lons, lats, center]
}

export function get_selected_cell_geom(metadata, i, j) {
    console.log("get_selected_cell_geom() called")

    // Adds a red outline to the selected cell when the user clicks on it
    let geom = create_geom(metadata.transformer, i, j, metadata.lon_array_m, metadata.lat_array_m)
    let lons = geom.map(item => item[0])
    let lats = geom.map(item => item[1])
  
    let cell_domain = {
        type: "scattermapbox",
        showlegend: false,
        mode: 'lines',
        line: {color: 'red', width: 2},
        lon: lons,
        lat: lats,
        hoverinfo: "skip"
    };
    return cell_domain
}

export function getMetadata(data) {
    let base_coord = base_transformer.inverse(data['se_coords']);
    let wofs_proj = derive_new_proj(base_transformer, base_coord);
    let transformer = proj4(wofs_proj, orig_proj);
    let coord = transformer.inverse(data['se_coords']);
    let lon_array_m = create_coord_array(coord[0], wofs_x_length, resolution);
    let lat_array_m = create_coord_array(coord[1], wofs_y_length, resolution);

    return {
        "base_coord": base_coord,
        "wofs_proj": wofs_proj,
        "transformer": transformer,
        "coord": coord,
        "lon_array_m": lon_array_m,
        "lat_array_m": lat_array_m
    }
}