

function TomoiHomeMenuBtn({icon, btnName, colSpan, rowSpan, ...props}) {
    return (
    <>
        <button
        {...props} className={`bg-[var(--tomoi-yellow)] rounded-xl col-span-${colSpan} row-span-${rowSpan}`}>
            <div data-text={btnName} className="text-5xl alt-font stroked"
                style={{"--inside-color":'var(--tomoi-yellow)'}}>{btnName}
            </div>
            {icon}
        </button>
    </>
    ) 
}

export default TomoiHomeMenuBtn