import { useState } from 'react'
import { ArrowLeft, CaretLeftFill, CaretRightFill, CaretUpFill, CaretDownFill } from 'react-bootstrap-icons';
import dayjs, {Dayjs} from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";

function TomoiStepper({stepList, onChange, value}) {

    const currentIndex = stepList.indexOf(value);
    console.log(value)

    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(stepList.length, currentIndex + 2);

    const stepListSlice = stepList.slice(start, end);

    const moveUp = () => {
        const nextIndex = (currentIndex - 1 + stepList.length) % stepList.length;(currentIndex + 1) % stepList.length;
        onChange(stepList[nextIndex]);
    }

    const moveDown = () => {
        const nextIndex = (currentIndex + 1) % stepList.length;
        onChange(stepList[nextIndex]);
    }

    return (
    <>
        <div className='flex flex-col items-center justify-center px-5 py-2 min-w-[8rem]'>
            <button className='group w-full flex items-center justify-center' onClick={() => moveUp()}>
                <CaretUpFill  width={20} height={20} className='group-hover:fill-[var(--tomoi-yellow)]'></CaretUpFill>
            </button>

            {currentIndex === 0 && <div className='h-[1.5rem]'></div>}
            
            {stepListSlice.map((li, index) => (
                <div key={index} className={'h-[1.5rem]' + ( li === value  ? ' text-black' : ' text-[var(--tomoi-gray)]')}>{li}</div>
            ))}

            {currentIndex === stepList.length-1 && <div className='h-[1.5rem]'></div>}

            <button className='group w-full flex items-center justify-center' onClick={() => moveDown()}>
                <CaretDownFill  width={20} height={20} className='group-hover:fill-[var(--tomoi-yellow)]'></CaretDownFill>
            </button>
        </div>
    </>
    ) 
}

export default TomoiStepper