'use client'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function ReflectivityCheck({ checked, onCheck }) {
    return (
        <FormControlLabel 
            sx={{paddingLeft: "2em"}}
            control={
                <Checkbox 
                    checked={checked}
                    onChange={onCheck}
                />
            } 
            label="Reflectivity" 
        />
    )
}

