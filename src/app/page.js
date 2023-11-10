'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import DateFetch from './components/DateFetch.js';
import Controls from './components/Controls.js';

const queryClient = new QueryClient();

export default function App() {
  console.log("Render occurred! App")
  const [validDates, setValidDates] = useState([]);
  const [selectedValidTime, setSelectedValidTime] = useState([]);
  
  const handleDatesFetch = (datesArray) => {
    console.log("dates set")
    setValidDates(datesArray);
  };

  const handleSelectedValidTime = (validTime) => {
    console.log("selected valid time set")
    setSelectedValidTime(validTime);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <DateFetch onDatesFetch={ handleDatesFetch } />
        {validDates.length > 0 && <Controls validDates={validDates} />}
      </main>
    </QueryClientProvider>
  )
}


