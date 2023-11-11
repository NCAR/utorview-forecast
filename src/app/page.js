'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import ValidTimeFetch from './components/ValidTimeFetch.js';
import Controls from './components/Controls.js';
import DataFetch from './components/DataFetch.js';

const queryClient = new QueryClient();

export default function App() {
  console.log("Render occurred! App")
  const [initTimes, setInitTimes] = useState([]);
  const [validTimes, setValidTimes] = useState([]);
  const [selectedValidTime, setSelectedValidTime] = useState([]);

  // update states once the dates are fetched in ValidTimeFetch
  const handleDatesFetch = (initDates, validDates) => {
    setInitTimes(initDates);
    setValidTimes(validDates);
    setSelectedValidTime(validDates[36]);
  };

  // updates selected valid time on user input in Controls
  const handleSelectedValidTime = (validTime) => {
    setSelectedValidTime(validTime);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <p>Valid Time: {selectedValidTime}</p>
        <ValidTimeFetch onDatesFetch={ handleDatesFetch } />
        {validTimes.length > 0 && 
          <Controls validTimes={ validTimes } selectedValidTime={ selectedValidTime } onValidTimeSelect={ handleSelectedValidTime } /> 
        }
        {validTimes.length > 0 && 
          <DataFetch initTimes={ initTimes } selectedValidTime={ selectedValidTime }/> 
        }
      </main>
    </QueryClientProvider>
  )
}


