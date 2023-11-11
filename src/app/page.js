'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import TimeFetch from './components/TimeFetch.js';
import Controls from './components/Controls.js';
import ModelControls from './components/ModelControls.js';

let forecastLength = 180;

const queryClient = new QueryClient();

export default function App() {
  console.log("Render occurred! App")
  const [initTimes, setInitTimes] = useState([]);
  const [validTimes, setValidTimes] = useState([]);

  const [filteredInitTimes, setFilteredInitTimes] = useState([]);
  const [selectedInitTime, setSelectedInitTime] = useState([]);
  const [selectedValidTime, setSelectedValidTime] = useState([]);

  // update states once the dates are fetched in ValidTimeFetch
  const handleDatesFetch = (initDates, validDates) => {
    setInitTimes(initDates);
    setValidTimes(validDates);
    setSelectedValidTime(validDates[0]);

    let filteredTimes = getCorrespondingInitTimes(initDates, validDates[0]);
    setFilteredInitTimes(filteredTimes)
    setSelectedInitTime(filteredTimes[0].toUTCString())
  };

  // updates selected valid time and filtered init times on user input in Controls
  const handleSelectedValidTime = (validTime) => {
    setSelectedValidTime(validTime);

    let filteredTimes = getCorrespondingInitTimes(initTimes, validTime);
    setFilteredInitTimes(filteredTimes)
    setSelectedInitTime(filteredTimes[0].toUTCString())
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
          <p>Init Time: {selectedInitTime.toString()}</p>
        </div>

        <TimeFetch onDatesFetch={ handleDatesFetch } />
        {validTimes.length > 0 && 
          <Controls validTimes={ validTimes } selectedValidTime={ selectedValidTime } onValidTimeSelect={ handleSelectedValidTime } /> 
        }
        {initTimes.length > 0 && 
          <ModelControls filteredInitTimes={ filteredInitTimes } selectedInitTime={ selectedInitTime } onInitTimeSelect={ handleSelectedInitTime }/> 
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


