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
        return !validTimes.some(validTime => (new Date(validTime)).getTime() === (new Date(date)).getTime());
    };
    
    return (
        <div>
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