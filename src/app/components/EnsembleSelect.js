'use client'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

let numberOfEnsembleMembers = 18;
let ensembleNum = Array.from(Array(numberOfEnsembleMembers), (e,i)=>i+1); // creating option for ensemble members 1-18
let ensembleNumOpts = ensembleNum.map(num => ("Member " + (num)));
let ensembleLabels = ["Median", "Mean", "Max"].concat(ensembleNumOpts);
let ensembleValues = ["median", "mean", "max"].concat(ensembleNum);

export default function EnsembleSelect({ selectedEnsembleMember, onEnsembleMemberSelect}) {
    return (
        <Box>
            <FormControl >
                <InputLabel id="ensemble-member-select-label">Ensemble Member</InputLabel>
                <Select
                labelId="ensemble-member-select-label"
                id="ensemble-member-select"
                value={selectedEnsembleMember}
                label="Ensemble Member"
                onChange={e => onEnsembleMemberSelect(e.target.value)}
                >
                    {ensembleValues.map((ensembleValue, i) => <MenuItem key={ensembleValue} value={ensembleValue}>{ensembleLabels[i]}</MenuItem>)}
                </Select>
            </FormControl>
        </Box>
    )
}

