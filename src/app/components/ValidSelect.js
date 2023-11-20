'use client'
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default function ValidSelect({ validTimes, selectedValidTime, onValidTimeSelect }) {
    console.log("Render occurred! ValidSelect")

    let subset = validTimes.slice(0, 250)

    const shouldDisableDate = (date) => {
        // Check if the date is not in the array of enabled dates
        return !validTimes.some(validTime => (new Date(validTime)).getTime() === (new Date(date)).getTime());
    };
    
    // console.log(selectedValidTime)
    // console.log(new Date(selectedValidTime))


    return (
        <div>
            {/* Valid Times
            <select
            value={selectedValidTime} 
            onChange={e => onValidTimeSelect(e.target.value)} 
            >
                {subset.map((validTime) => <option key={validTime} value={validTime}>{validTime}</option>)}
            </select> */}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker 
                    shouldDisableDate={shouldDisableDate}
                    shouldDisableTime={shouldDisableDate}
                    label="Valid Times" 
                    value={dayjs(selectedValidTime)}
                    ampm={false}
                    onChange={(newValue) => onValidTimeSelect(new Date(newValue))} 
                    timezone="UTC"
                    closeOnSelect={false}
                />
            </LocalizationProvider>
        </div>
    )
}