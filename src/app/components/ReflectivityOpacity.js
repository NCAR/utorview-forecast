'use client'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function ReflectivityOpacity({ selectedOpacity, onOpacitySelect }) {
    console.log("Render occurred! InitSelect")

    return (
        <div>
            <FormControlLabel sx={{minWidth: 200}}
                control={
                    <Slider   
                        sx={{marginLeft: "1em"}}
                        size="small"
                        aria-label="Reflectivity opacity slider"
                        value={selectedOpacity}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        onChange={e => onOpacitySelect(e.target.value)} 
                    />
                } 
                label="Opacity" 
                labelPlacement="start"
            />
        </div>
    )
}