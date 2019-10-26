import { useState, useEffect } from 'react'

function setCSSVariable(variable, value) {
    document.documentElement.style.setProperty(variable, value)
}

function resetCSSVariable(variable) {
    document.documentElement.style.removeProperty(variable)
}

export default function SettingsColorScheme() {

    const [ currentColor, setCurrentColor ] = useState('')

    function resetToDefault() {
        resetCSSVariable('--primary-color')
        setCurrentColorToCurrentlySetColor()
    }

    function setCurrentColorToCurrentlySetColor() {
        setCurrentColor(window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color'))
    }

    useEffect(() => {
        setCurrentColorToCurrentlySetColor()
    }, [])

    useEffect(() => {
        localStorage.setItem('overrideDefaultColor', currentColor)
        setCSSVariable('--primary-color', currentColor)
    }, [currentColor])

    return (
        <div>
            <div className="label">Pick Color</div>
            <input type="color" value={currentColor} onChange={e => setCurrentColor(e.target.value)}></input>

            <div className="mt-1em">
                <button onClick={resetToDefault}>Reset to Default Color</button>
            </div>
        </div>
    )
}
