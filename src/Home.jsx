import { useEffect, useState } from 'react';
import { ExclamationTriangle, Google, Pencil } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import { toast} from 'react-hot-toast';
import Navbar from './components/Navbar';
import TomoiCalendar from './components/TomoiCalendar';

import JournalIcon from './assets/journal_menu_btn.svg?react';
import HabitsIcon from './assets/habits_menu_btn.svg?react';
import SlambookIcon from './assets/slambook_menu_btn.svg?react';
import StatsIcon from './assets/stats_menu_btn.svg?react';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import TomoiHomeMenuBtn from './components/TomoiHomeMenuBtn';

dayjs.extend(duration);

const calculateCountdown = () => {
    const today = dayjs().startOf('d');
    const target = today.add(30, 'hour');
    const diff = target.diff(dayjs());
    const countdown = dayjs.duration(diff);
    return {
        days: countdown.days(),
        hours: countdown.hours(),
        minutes: countdown.minutes()
    };
}

function Home() {
  const navigate = useNavigate();
  const [dailyEntryCountdown, setDailyEntryCountdown] = useState(calculateCountdown());
  
  useEffect (() => {
    const timer = setInterval (() => {
        setDailyEntryCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(timer);
  })

  return (
    <>
        <Navbar></Navbar>
        <div className='flex flex-col min-h-dvh h-screen w-full overflow-y-auto bg-white justify-center items-center'>
            <div className='flex w-full max-w-7xl h-[80%] items-stretch justify-center z-10 gap-4'>
                <div className='flex flex-col bg-[var(--tomoi-gray)] justify-center rounded-xl w-[35%] p-4 gap-4 h-full shadow-md/40'>
                    <TomoiCalendar></TomoiCalendar>
                    <div className='flex bg-white rounded-xl items-center justify-center grow-2 gap-3 border-dashed max-h-[15%] border-1'>
                        <div className='flex gap-4 px-5 w-[80%] items-center justify-center'>
                            <ExclamationTriangle width={40} height={40} className='fill-[var(--tomoi-yellow)]'></ExclamationTriangle>
                            <div className='flex flex-col items-center'>
                                <div className='text-sm text-center'>You haven't done your daily entry!</div>
                                <div className='italic text-center text-[var(--tomoi-gray-d)]'>
                                    {dailyEntryCountdown.days === 0 ? '' : dailyEntryCountdown.days + 'd '}
                                    {dailyEntryCountdown.hours === 0 ? '' : dailyEntryCountdown.hours + 'hr '}
                                    {dailyEntryCountdown.minutes === 0 ? '' : dailyEntryCountdown.minutes + 'min'} left</div>
                            </div>
                        </div>
                        <div className='border-l-1 border-dashed group h-full flex items-center justify-center w-[20%] rounded-r-xl bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-yellow-l)]'>
                            <Pencil width={30} height={30} className='fill-[var(--tomoi-gray-d)] group-hover:fill-[var(--tomoi-yellow)]'></Pencil>
                        </div>
                    </div>
                        
                </div>
                <div className='grid grid-flow-row grid-cols-2 grid-rows-4 bg-transparent w-[25%] gap-2'>
                    <TomoiHomeMenuBtn icon={<JournalIcon/>} btnName="Journal" colSpan="2" rowSpan="2" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)"></TomoiHomeMenuBtn>
                    <TomoiHomeMenuBtn icon={<HabitsIcon/>} btnName="Habits" colSpan="1" rowSpan="1" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)"></TomoiHomeMenuBtn>
                    <TomoiHomeMenuBtn icon={<SlambookIcon/>} btnName="Slambook" colSpan="1" rowSpan="1" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)"></TomoiHomeMenuBtn>
                    <TomoiHomeMenuBtn icon={<StatsIcon/>} btnName="Stats" colSpan="2" rowSpan="1" bgColor="var(--tomoi-gray)" textColor="var(--tomoi-gray-d)"></TomoiHomeMenuBtn>
                </div>
                <div className='flex flex-col w-[35%] gap-2'>
                    <div className='shadow-md/40 bg-[var(--tomoi-gray)] h-[50%] rounded-xl'> featured list </div>
                    <div className='flex flex-col h-[50%]'>
                        <div className='text-3xl font-bold'>Last activity</div>
                        <div className='shadow-md/40 bg-white rounded-xl h-full gap-2'>ENTRY</div>
                    </div>
                </div>
            </div>
            <div className='inset-text-shadow fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Home</div>
        </div>
    </>
  )
}

export default Home
