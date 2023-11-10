'use client'
export default function Controls({ validDates }) {
    console.log("Render occurred! Controls")

    return (
        <div>
            <select>
                <option>{validDates[36]}</option>
            </select>
        </div>
    )
}