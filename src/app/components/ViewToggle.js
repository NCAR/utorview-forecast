'use client'
import Image from 'next/image';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function ViewToggle({ selectedViews, onSelectedViews }) {
    window.dispatchEvent(new Event('resize'));
    
    return (
        <ToggleButtonGroup
        value={ selectedViews }
        onChange={onSelectedViews}
        aria-label="toggling display of map or chart"
        sx={{paddingLeft: "2em"}}
      >
        <ToggleButton value="map" aria-label="map">
            <Image
                src="/utorview-forecast/map-icon.svg"
                width={20}
                height={20}
                alt="Map icon"
            />
        </ToggleButton>
        <ToggleButton value="chart" aria-label="chart">
            <Image
                src="/utorview-forecast/chart-icon.svg"
                width={20}
                height={20}
                alt="Chart icon"
            />
        </ToggleButton>
      </ToggleButtonGroup>
    )
}