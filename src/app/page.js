'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import TimeFetch from './components/TimeFetch.js';

import ValidSelect from './components/ValidSelect.js';
import InitSelect from './components/InitSelect.js';
import EnsembleSelect from './components/EnsembleSelect.js';
import ReflectivityCheck from './components/ReflectivityCheck.js';
import ReflectivityOpacity from './components/ReflectivityOpacity.js';

import DataFetch from './components/DataFetch.js';
import Visualization from './components/Visualization.js';

let forecastLength = 180;

const queryClient = new QueryClient();

export default function App() {
  console.log("Render occurred! App")
  const [initTimes, setInitTimes] = useState([]);
  const [validTimes, setValidTimes] = useState([]);

  const [selectedInitTime, setSelectedInitTime] = useState([]);
  const [selectedValidTime, setSelectedValidTime] = useState([]);

  const [selectedEnsembleMember, setSelectedEnsembleMember] = useState("median");

  const [checkedReflectivity, setCheckedReflectivity] = useState(false);
  const [selectedReflectivityOpacity, setSelectedOpacity] = useState(10);

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

  const handleSelectedEnsembleMember = (ensembleMember) => {
    setSelectedEnsembleMember(ensembleMember);
  }

  const handleCheckedReflectivity = () => {
    setCheckedReflectivity(!checkedReflectivity);
  }

  const handleSelectedOpacity = (opacity) => {
    setSelectedOpacity(opacity);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <div className="header-container">
          <h1>WoFS UNet Tornado Guidance Viewer</h1>
        </div>
        <TimeFetch onDatesFetch={ handleDatesFetch } />
        {validTimes.length > 0 && 
          <div id="controls-container">
            <div id="controls-top">
              <ValidSelect validTimes={ validTimes } selectedValidTime={ selectedValidTime } onValidTimeSelect={ handleSelectedValidTime } /> 
              <EnsembleSelect selectedEnsembleMember={ selectedEnsembleMember} onEnsembleMemberSelect={ handleSelectedEnsembleMember } />
              <ReflectivityCheck checked={ checkedReflectivity } onCheck={handleCheckedReflectivity} />
              <ReflectivityOpacity selectedOpacity={ selectedReflectivityOpacity } onOpacitySelect={ handleSelectedOpacity} />
            </div>
            <div id="controls-range">
              <InitSelect filteredInitTimes={ getCorrespondingInitTimes(initTimes, selectedValidTime) } selectedInitTime={ selectedInitTime } onInitTimeSelect={ handleSelectedInitTime }/> 
            </div>
          </div>  
        }
        { initTimes.length > 0 &&
          <div id="visualization-container">
            <Visualization selectedValidTime={ selectedValidTime } selectedInitTime={ selectedInitTime } selectedEnsembleMember={ selectedEnsembleMember } checkedReflectivity={ checkedReflectivity } selectedReflectivityOpacity={ selectedReflectivityOpacity }/>
            <DataFetch filteredInitTimes={ getCorrespondingInitTimes(initTimes, selectedValidTime) } selectedValidTime={ selectedValidTime } />
          </div>
        }
      </main>
    </QueryClientProvider>
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


