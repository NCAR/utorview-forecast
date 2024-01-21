'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './/theme.js';

import TimeFetch from './components/TimeFetch.js';

import ValidSelect from './components/ValidSelect.js';
import InitSelect from './components/InitSelect.js';
import EnsembleSelect from './components/EnsembleSelect.js';
import ReflectivityCheck from './components/ReflectivityCheck.js';
import ReflectivityOpacity from './components/ReflectivityOpacity.js';
import ViewToggle from './components/ViewToggle.js';

import DataFetch from './components/DataFetch.js';
import Visualization from './components/Visualization.js';

let forecastLength = 180;

const queryClient = new QueryClient({
  defaultOptions: { queries: { 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: false
  } }
});

export default function App() {
  console.log("Render occurred! App")
  const [initTimes, setInitTimes] = useState([]);
  const [validTimes, setValidTimes] = useState([]);

  const [selectedInitTime, setSelectedInitTime] = useState([]);
  const [selectedValidTime, setSelectedValidTime] = useState([]);

  console.log(selectedValidTime)

  const [selectedEnsembleMember, setSelectedEnsembleMember] = useState("median");

  const [checkedReflectivity, setCheckedReflectivity] = useState(false);
  const [selectedReflectivityOpacity, setSelectedOpacity] = useState(10);

  const [selectedViews, setSelectedViews] = useState(() => ["map"]);

  // update states once the dates are fetched in TimeFetch
  const handleDatesFetch = (initDates, validDates) => {
    setInitTimes(initDates);
    setValidTimes(validDates);
    setSelectedValidTime(validDates[0]);
    let filteredInitTimes = getCorrespondingInitTimes(initDates, validDates[0]);
    setSelectedInitTime(filteredInitTimes[filteredInitTimes.length - 1].toUTCString());
  };

  // updates selected valid time and filtered init times on user input in calendar
  const handleSelectedValidTime = (validTime) => {
    setSelectedValidTime(validTime);
    let filteredInitTimes = getCorrespondingInitTimes(initTimes, validTime);
    setSelectedInitTime(filteredInitTimes[filteredInitTimes.length - 1].toUTCString());
  }

  // updates selected init time on user input in slider
  const handleSelectedInitTime = (initTime) => {
    setSelectedInitTime(initTime);
  }

  // updates selected ensemble member data
  const handleSelectedEnsembleMember = (ensembleMember) => {
    setSelectedEnsembleMember(ensembleMember);
  }

  // updates whether or not reflectivity is shown
  const handleCheckedReflectivity = () => {
    setCheckedReflectivity(!checkedReflectivity);
  }

  // updates opacity of reflectivity layer
  const handleSelectedOpacity = (opacity) => {
    setSelectedOpacity(opacity);
  }

  const handleSelectedViews = (e, shownViews) => {
    if (shownViews.length == 0) {
      shownViews = ["map", "chart"];
    }
    setSelectedViews(shownViews);
  }

  return (
    <ThemeProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
      <main>
        <div id="icons">
          <a href="https://ncar.ucar.edu/who-we-are/funding" target="_blank">
            <img
                id="nsf-icon"
                src="/utorview-forecast/nsf-icon.png"
                alt="NSF icon" 
            />
          </a>
          <a href="https://ncar.ucar.edu/</div>" target="_blank">
            <img
                id="ncar-icon"
                src="/utorview-forecast/ncar-icon.svg"
                alt="NCAR icon" 
            />
          </a>
          <a href="https://ncar.github.io/miles/" target="_blank">
            <img
                id="miles-icon"
                src="/utorview-forecast/miles-icon.png"
                alt="MILES icon" 
            />
          </a>
        </div>
        
        <div className="header-container">
          <h1>WoFS UNet Tornado Guidance Viewer</h1>
        </div>

        <div id="info-container">
          <img
                id="info-icon"
                src="/utorview-forecast/info.svg"
                alt="More information icon" 
                width="60"
            />
        </div>

        <TimeFetch onDatesFetch={ handleDatesFetch } />

        {validTimes.length > 0 && 
          <div id="controls-container">
            <div id="controls-top">
              <ValidSelect validTimes={ validTimes } selectedValidTime={ selectedValidTime } onValidTimeSelect={ handleSelectedValidTime } /> 
              <EnsembleSelect selectedEnsembleMember={ selectedEnsembleMember} onEnsembleMemberSelect={ handleSelectedEnsembleMember } />
              <ReflectivityCheck checked={ checkedReflectivity } onCheck={ handleCheckedReflectivity } />
              <ReflectivityOpacity enabled={ checkedReflectivity } selectedOpacity={ selectedReflectivityOpacity } onOpacitySelect={ handleSelectedOpacity} />
              <ViewToggle selectedViews={ selectedViews } onSelectedViews={ handleSelectedViews }/>
            </div>
            <div id="controls-range">
              <InitSelect filteredInitTimes={ getCorrespondingInitTimes(initTimes, selectedValidTime) } selectedInitTime={ selectedInitTime } onInitTimeSelect={ handleSelectedInitTime }/> 
            </div>
          </div>  
        }

        { initTimes.length > 0 &&
          <div id="visualization-container">
            <Visualization 
              selectedValidTime={ selectedValidTime } 
              selectedInitTime={ selectedInitTime } 
              filteredInitTimes={ getCorrespondingInitTimes(initTimes, selectedValidTime) }
              selectedEnsembleMember={ selectedEnsembleMember } 
              checkedReflectivity={ checkedReflectivity } 
              selectedReflectivityOpacity={ selectedReflectivityOpacity } 
              selectedViews={ selectedViews }
              onCellSelect={ handleSelectedViews }
            />
            <DataFetch filteredInitTimes={ getCorrespondingInitTimes(initTimes, selectedValidTime) } selectedValidTime={ selectedValidTime } />
          </div>
        }
      </main>
    </QueryClientProvider>
    </ThemeProvider>
  )
}

function getCorrespondingInitTimes(initTimes, selectedValidTime) {
  // Returns: an array of Date objects corresponding to model run init times that include predictions for the selected valid time.
  // Uses global variable forecastLength (default 180 mins).
  // Parameter initTimes: an array of Date objects corresponding to all model run init times.
  // Parameter selectedValidTime: a UTC string representation of the currently selected valid time.
  
  let selectedValidTimeUTC = new Date(selectedValidTime);
  let earliestInitTime = new Date(selectedValidTimeUTC.getTime() - forecastLength * 60 * 1000);
  let filteredInitTimes = initTimes.filter(date => date >= earliestInitTime && date <= selectedValidTimeUTC);

  return filteredInitTimes;
}


