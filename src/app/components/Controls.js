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
                <option value={validTimes[36]}>{validTimes[36]}</option>
                <option value={validTimes[35]}>{validTimes[35]}</option>
                <option value={validTimes[34]}>{validTimes[34]}</option>
            </select>
        </div>
    )
}