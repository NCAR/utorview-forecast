'use client'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function ModelControls({ filteredInitTimes, selectedInitTime, onInitTimeSelect }) {
    console.log("Render occurred! ModelControls")

    return (
        <div>
            {/* Init Times */}
            {/* <select
            value={selectedInitTime} 
            onChange={e => onInitTimeSelect(e.target.value)} 
            >
               {filteredInitTimes.map((initTime) => <option key={initTime.toUTCString()} value={initTime.toUTCString()}>{initTime.toUTCString()}</option>)}
            </select> */
            }

            <Box>
                <FormControl>
                    <InputLabel id="init-times-select-label">Init Times</InputLabel>
                    <Select
                    labelId="init-times-select-label"
                    id="init-times-select"
                    value={selectedInitTime}
                    label="Init Times"
                    onChange={e => onInitTimeSelect(e.target.value)}
                    >
                        {filteredInitTimes.map((initTime) => <MenuItem key={initTime.toUTCString()} value={initTime.toUTCString()}>{initTime.toUTCString()}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

        </div>
    )
}