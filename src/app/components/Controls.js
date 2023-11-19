'use client'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function Controls({ validTimes, selectedValidTime, onValidTimeSelect }) {
    console.log("Render occurred! Controls")

    let subset = validTimes.slice(0, 250)

    return (
        <div>
            Valid Times
            <select
            value={selectedValidTime} 
            onChange={e => onValidTimeSelect(e.target.value)} 
            >
                {subset.map((validTime) => <option key={validTime} value={validTime}>{validTime}</option>)}
            </select>
        </div>
    )
}