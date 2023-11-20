'use client'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function InitSelect({ filteredInitTimes, selectedInitTime, onInitTimeSelect }) {
    console.log("Render occurred! InitSelect")

    const numericInitTimes = filteredInitTimes.map(date => date.getTime());

    let minDate = Math.min(...numericInitTimes);
    let maxDate = Math.max(...numericInitTimes);

    // center slider if only one init time is available
    if (filteredInitTimes.length == 1) {
        minDate = numericInitTimes[0] - 1;
        maxDate = numericInitTimes[0] + 1;
    } 
    
    const marks = filteredInitTimes.map(date => ({
        value: date.getTime(),
        label: date.toDateString() + "\n" + date.toTimeString()
    }));

    return (
        <div>
            <Box sx={{paddingLeft: "10em", paddingRight: "10em"}}>
                <Slider 
                    // components={{ MarkLabel: "p" }}
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
    return ((new Date(value)).toUTCString());
}