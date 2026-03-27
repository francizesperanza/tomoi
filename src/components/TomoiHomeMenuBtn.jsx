import React from "react"
import { animate, stagger, createScope, set, random } from 'animejs'
import { useEffect, useRef } from "react";

function TomoiHomeMenuBtn({icon, btnName, colSpan, rowSpan, bgColor, textColor, ...props}) {
    const root = useRef(null);
    const scope = useRef(null);

    var textSize, iconSize, marginX, marginY;

    if (colSpan == 2 && rowSpan == 2) {
        marginX = 2
        marginY = 1
        iconSize = 15
        textSize = "5xl"
    } else if (colSpan == 2 && rowSpan == 1) {
        marginX = 0
        marginY = 5
        iconSize = 13
        textSize = "4xl"
    } else {
        marginX = 3
        marginY = 1
        iconSize = 10
        textSize = "3xl"
    }

    const btnIcon = React.cloneElement(icon, {
        className: `w-${iconSize} h-${iconSize} btn-icon fill-white text-white absolute`,
        style: {
            width: `${iconSize}em`,
            height: `${iconSize}em`,
            right: `-${marginX}em`,
            bottom: `-${marginY}em`,
        }
    });

    const onButtonLeave = (e) => {
        console.log('hovering')
        animate(e.currentTarget.querySelector('.btn-text'),{
            scale: [
                { to: 1, duration: 100},
            ],
            rotate: [
                { to: 0, duration: 200},
            ],
            translateX: [
                {to: 0, duration: 200}
            ],
            translateY: [
                {to: 0, duration: 200}
            ],
            '--inside-color': [
                {to: [null, `${textColor}`], duration: 0}
            ]
        });

        animate(e.currentTarget.querySelector('.btn-icon'),{
            scale: [
                { to: 1, duration: 100},
            ],
            rotate: [
                { to: 0, duration: 200},
            ],
            translateX: [
                {to: 0, duration: 200}
            ],
            translateY: [
                {to: 0, duration: 200}
            ]
        });

    }

    const onButtonHover = (e) => {
        console.log('hovering')
        animate(e.currentTarget.querySelector('.btn-text'),{
            scale: [
                { to: 1.1, duration: 100},
            ],
            rotate: [
                { to: -10, duration: 200},
            ],
            translateX: [
                {to: 10, duration: 200}
            ],
            translateY: [
                {to: -10, duration: 200}
            ],
            '--inside-color': 'black'
        });

        animate(e.currentTarget.querySelector('.btn-icon'),{
            scale: [
                { to: 1.1, duration: 100},
            ],
            rotate: [
                { to: 10, duration: 200},
            ],
            translateX: [
                {to: -10, duration: 200}
            ],
            translateY: [
                {to: -10, duration: 200}
            ],
        });

    }

    useEffect(() => {
    
        scope.current = createScope({ root }).add( self => {
        

        });
        return () => scope.current.revert()

    }, []);

    return (
    <>
        <button
        {...props} className={`shadow-md/40 relative inline-block rounded-xl overflow-hidden col-span-${colSpan} row-span-${rowSpan} bg-[${bgColor}]`}
            onMouseEnter={onButtonHover}
            onMouseLeave={onButtonLeave}
            ref={root}>
            <div data-text={btnName} className={`btn-text w-fit z-10 text-${textSize} alt-font stroked-overlap bottom-2 left-4`}
                style={{"--inside-color":`${textColor}`}}>{btnName}
            </div>
            {btnIcon}
        </button>
    </>
    ) 
}

export default TomoiHomeMenuBtn