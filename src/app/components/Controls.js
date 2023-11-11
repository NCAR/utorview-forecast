'use client'
export default function Controls({ validTimes, selectedValidTime, onValidTimeSelect }) {
    console.log("Render occurred! Controls")

    return (
        <div>
            Valid Times
            <select
            value={selectedValidTime} 
            onChange={e => onValidTimeSelect(e.target.value)} 
            >
                <option value={validTimes[0]}>{validTimes[0]}</option>
                <option value={validTimes[1]}>{validTimes[1]}</option>
                <option value={validTimes[2]}>{validTimes[2]}</option>
                <option value={validTimes[36]}>{validTimes[36]}</option>
            </select>
        </div>
    )
}