'use client'

export default function ValidSelect({ validTimes, selectedValidTime, onValidTimeSelect }) {
    console.log("Render occurred! ValidSelect")

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