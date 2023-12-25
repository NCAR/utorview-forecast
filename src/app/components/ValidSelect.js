'use client'
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ValidSelect({ validTimes, selectedValidTime, onValidTimeSelect }) {
    console.log("Render occurred! ValidSelect")

    let localValidTimes = validTimes.map(validTime => {
        let localDate = new Date(validTime);
        return new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
    });

    let localValidTimeStrings = localValidTimes.map(localValidTime => localValidTime.toString());

    const shouldDisableTime = (time) => {
        const offsetMinutes = time.utcOffset();
        const utcTimestamp = time.valueOf() - offsetMinutes * 60000;
        return !localValidTimeStrings.includes(new Date(utcTimestamp).toString());
    };

    const shouldDisableDay = (date) => {
        const day = date.date();      
        const month = date.month();   
        const year = date.year();     
    
        for (let validDate of localValidTimes) {
            validDate = new Date(validDate.getTime() - (validDate.getTimezoneOffset() * 60000));
            if (
                validDate.getFullYear() === year &&
                validDate.getMonth() === month &&
                validDate.getDate() === day
            ) {
                return false;
            }
        }
        return true;
    }
    
    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker 
                    shouldDisableDate={shouldDisableDay}
                    shouldDisableTime={shouldDisableTime}
                    label="Valid Times" 
                    value={dayjs(selectedValidTime)}
                    ampm={false}
                    onChange={(newValue) => {
                        if (!shouldDisableTime(newValue)) {
                            onValidTimeSelect(new Date(dayjs.utc(newValue)))
                        }
                    }} 
                    timezone="system"
                    closeOnSelect={false}
                    slotProps={{ textField: { size: "small" } }}
                />
            </LocalizationProvider>
        </div>
    )
}