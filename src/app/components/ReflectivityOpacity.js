'use client'
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function ReflectivityOpacity({ enabled, selectedOpacity, onOpacitySelect }) {
    console.log("Render occurred! InitSelect")

    return (
        <div>
            <FormControlLabel sx={{minWidth: 200}}
                control={
                    <Slider   
                        disabled={!enabled}
                        sx={{marginLeft: "1em", marginRight: "1em"}}
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