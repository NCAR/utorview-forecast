'use client'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function InitSelect({ filteredInitTimes, selectedInitTime, onInitTimeSelect }) {
    console.log("Render occurred! InitSelect")

    const numericInitTimes = filteredInitTimes.map(date => date.getTime());

    const minDate = Math.min(...numericInitTimes);
    const maxDate = Math.max(...numericInitTimes);

    const marks = filteredInitTimes.map(date => ({
        value: date.getTime(),
        label: date.toUTCString()
    }));

    return (
        <div>
            <Box>
                <Slider 
                    aria-label="Model run init time"
                    value={(new Date(selectedInitTime)).getTime()}
                    getAriaValueText={dateValueText}
                    valueLabelFormat={dateValueText}
                    valueLabelDisplay="auto"
                    marks={marks}
                    step={null}
                    min={minDate}
                    max={maxDate}
                    onChange={e => onInitTimeSelect(e.target.value)} 
                />
            </Box>
        </div>
    )
}

function dateValueText(value) {
    return (new Date(value)).toUTCString();
}