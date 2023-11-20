'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import TimeFetch from './components/TimeFetch.js';
import ValidSelect from './components/ValidSelect.js';
import InitSelect from './components/InitSelect.js';
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

  // update states once the dates are fetched in TimeFetch
  const handleDatesFetch = (initDates, validDates) => {
    setInitTimes(initDates);
    setValidTimes(validDates);
    setSelectedValidTime(validDates[0]);
    let filteredInitTimes = getCorrespondingInitTimes(initDates, validDates[0]);
    setSelectedInitTime(filteredInitTimes[filteredInitTimes.length - 1].toUTCString());
  };

  // updates selected valid time and filtered init times on user input in Controls
  const handleSelectedValidTime = (validTime) => {
    setSelectedValidTime(validTime);
    let filteredInitTimes = getCorrespondingInitTimes(initTimes, validTime);
    setSelectedInitTime(filteredInitTimes[filteredInitTimes.length - 1].toUTCString());
  }

  // updates selected init time on user input in Model Controls
  const handleSelectedInitTime = (initTime) => {
    setSelectedInitTime(initTime);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <div>
          State tracker:
          <p>Valid Time: {selectedValidTime.toString()} </p>
          <p>Init Time: {new Date(selectedInitTime).toUTCString()}</p>
        </div>

        <TimeFetch onDatesFetch={ handleDatesFetch } />
        {validTimes.length > 0 && 
          <ValidSelect validTimes={ validTimes } selectedValidTime={ selectedValidTime } onValidTimeSelect={ handleSelectedValidTime } /> 
        }
        {initTimes.length > 0 && 
          <InitSelect filteredInitTimes={ getCorrespondingInitTimes(initTimes, selectedValidTime) } selectedInitTime={ selectedInitTime } onInitTimeSelect={ handleSelectedInitTime }/> 
        }
        { initTimes.length > 0 &&
          <DataFetch filteredInitTimes={ getCorrespondingInitTimes(initTimes, selectedValidTime) } selectedValidTime={ selectedValidTime } />
        }
        { initTimes.length > 0 &&
          <Visualization selectedValidTime={ selectedValidTime } selectedInitTime={ selectedInitTime } />
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


