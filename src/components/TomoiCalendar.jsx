import { useState } from 'react'
import { ArrowLeft, CaretLeftFill, CaretRightFill, CaretUpFill, CaretDownFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom'
import dayjs, {Dayjs} from 'dayjs';
import { Popover } from '@mui/material';

import isLeapYear from "dayjs/plugin/isLeapYear";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TomoiStepper from './TomoiStepper';


dayjs.extend(isLeapYear);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const yearSelection = Array.from (
    {length: 31},
    (_, index) => dayjs(Date.now()).year() + 1 - index
)
const monthSelection = dayjs.months();

const generateMonthData = (date) => {
    var dayInfo = {};
    const daysInPrevMonth = date.subtract(1, 'month').daysInMonth();
    const firstDayofMonth = date.startOf('month').day();

    dayInfo = {
        day: Number(date.format('D')),
        prevMonthDays: Array.from (
            {length: firstDayofMonth},
            (_, index) => daysInPrevMonth - index
        ).reverse(),
        days: Array.from (
            {length: date.daysInMonth()},
            (_, index) => index + 1
        ),
        remainingDays: Array.from (
            {length: 6 - date.endOf('month').day()},
            (_, index) => index + 1
        ),
        months: date.localeData().months()
    }
    return dayInfo
}


function TomoiCalendar() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(dayjs(Date.now()));
    const [anchorEl, setAnchorEl] = useState(null);
    const dayInfo = generateMonthData(currentDate);
    const today = dayjs(Date.now());
    const [monthStepperValue, setMonthStepperValue] = useState(dayjs(Date.now()).format('MMMM'));
    const [yearStepperValue, setYearStepperValue] = useState(dayjs(Date.now()).year());

    const open = Boolean(anchorEl);
    const id = open ? 'calendar-date-popover' : undefined;

    const isItToday = (day) => {
        const monthCurrent = currentDate.month();
        const yearCurrent = currentDate.year();
        const monthToday = today.month();
        const yearToday = today.year();
        return monthCurrent === monthToday && yearCurrent === yearToday && day === today.date()
    }

    const selectPreviousMonthDay = (day) => {
        const selectedDate = currentDate.subtract(1, 'month').date(day);
        setCurrentDate(selectedDate);
    }

    const selectCurrentMonthDay = (day) => {
        const selectedDate = currentDate.date(day);
        setCurrentDate(selectedDate);
    }

    const selectNextMonthDay = (day) => {
        const selectedDate = currentDate.add(1, 'month').date(day);
        setCurrentDate(selectedDate);
    }

    const openPopover = (e) => {
        setAnchorEl(e.currentTarget);
    }

    const closePopover = () => {
        const newDate = currentDate.month(dayjs(monthStepperValue, "MMMM").month()).year(yearStepperValue)
        setCurrentDate(newDate)
        setAnchorEl(null);
    }


  return (
    <>
        <div className='flex flex-col grow-2 w-full overflow-y-auto bg-white items-center rounded-xl p-4 gap-2'>
            <div className='flex gap-4 items-center justify-between w-full'>
                <div className='text-3xl font-bold hover:underline cursor-pointer' onClick={(e) => openPopover(e)}>{currentDate.format('MMMM D, YYYY')}</div>
                <div className='flex'>
                    <button type='button' className='p-2 rounded-l-md bg-[var(--tomoi-gray)] hover:bg-[var(--tomoi-gray-d)]' onClick={() => (setCurrentDate(currentDate.subtract(1, 'month')))}>
                        <CaretLeftFill width={20} height={20}></CaretLeftFill>
                    </button>
                    <button type='button' className='p-2 rounded-r-md bg-[var(--tomoi-gray)] hover:bg-[var(--tomoi-gray-d)] border-l-1' onClick={() => (setCurrentDate(currentDate.add(1, 'month')))}>
                        <CaretRightFill width={20} height={20}></CaretRightFill>
                    </button>
                </div>
            </div>
            <div className='grid grid-cols-7 w-full items-center justify-center gap-2'>
                <div className='grid grid-cols-7 col-span-7 w-full items-center justify-around bg-[var(--tomoi-yellow)] alt-font text-2xl rounded-full'>
                    {weekDays.map((day, index) => (
                        <div key={index} className='text-center'>{day}</div>
                    ))}
                </div>
                {dayInfo.prevMonthDays.map((day, index) => (
                    <div key={index} className='text-center text-2xl p-2 cursor-pointer text-[var(--tomoi-gray)] hover:bg-[var(--tomoi-yellow-l)]' onClick={() => selectPreviousMonthDay(day)}>{day}</div>
                ))}

                {dayInfo.days.map((day, index) => (
                    <div key={index} className={'text-center text-2xl p-2 cursor-pointer hover:bg-[var(--tomoi-yellow-l)]' 
                        + (isItToday(day) ? ' bg-[var(--tomoi-yellow)] rounded-full' : '')
                        + (currentDate.date() === day ? ' outline-2 outline-dashed outline-[var(--tomoi-yellow)]' : '')
                    }
                    onClick={() => selectCurrentMonthDay(day)}>{day}</div>
                ))}

                {dayInfo.remainingDays.map((day, index) => (
                    <div key={index} className='text-center text-2xl p-2 text-[var(--tomoi-gray)] cursor-pointer hover:bg-[var(--tomoi-yellow-l)]' onClick={() => selectNextMonthDay(day)}>{day}</div>
                ))}
            </div>
        </div>
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={closePopover}
            anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
        >
            <div className='flex'>
                <TomoiStepper stepList={monthSelection} onChange={setMonthStepperValue} value={monthStepperValue}></TomoiStepper>
                <TomoiStepper stepList={yearSelection} onChange={setYearStepperValue} value={yearStepperValue}></TomoiStepper>
            </div>
        </Popover>
    </>
  ) 
}

export default TomoiCalendar
