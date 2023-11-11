'use client'
export default function ModelControls({ filteredInitTimes, selectedInitTime, onInitTimeSelect }) {
    console.log("Render occurred! Controls")
    console.log(selectedInitTime)
    console.log(typeof selectedInitTime)
    return (
        <div>
            Init Times
            <select
            value={selectedInitTime} 
            onChange={e => onInitTimeSelect(e.target.value)} 
            >
               {filteredInitTimes.map((initTime) => <option key={initTime.toUTCString()} value={initTime.toUTCString()}>{initTime.toUTCString()}</option>)}
            </select>
        </div>
    )
}