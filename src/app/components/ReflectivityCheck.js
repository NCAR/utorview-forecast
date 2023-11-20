'use client'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function ReflectivityCheck({ checked, onCheck }) {
    return (
        <FormControlLabel 
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

