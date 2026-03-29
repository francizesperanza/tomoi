import { useEffect, useState } from 'react';
import { EmojiFrown, ExclamationTriangle, Google, Pencil } from 'react-bootstrap-icons';
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
  const sampleText = "Want on this when she what would you. In how them or these, well two two there than give, by it about any up most want his who at. Us now do at, that these have as over I one, know some with our he no, person by not any do over give, my when in want, or an now into you with by want he get I do but not, at good, us this say my, most some use come she up if and, your him as now, good use no how us say, good like, now, do there"
  
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
                    <TomoiHomeMenuBtn icon={<JournalIcon/>} btnName="Journal" colSpan="2" rowSpan="2" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)" link="/journal"></TomoiHomeMenuBtn>
                    <TomoiHomeMenuBtn icon={<HabitsIcon/>} btnName="Habits" colSpan="1" rowSpan="1" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)" link="/habits"></TomoiHomeMenuBtn>
                    <TomoiHomeMenuBtn icon={<SlambookIcon/>} btnName="Slambook" colSpan="1" rowSpan="1" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)" link="/slambook"></TomoiHomeMenuBtn>
                    <TomoiHomeMenuBtn icon={<StatsIcon/>} btnName="Stats" colSpan="2" rowSpan="1" bgColor="var(--tomoi-gray)" textColor="var(--tomoi-gray-d)" link="/stats"></TomoiHomeMenuBtn>
                </div>
                <div className='flex flex-col w-[35%] gap-2'>
                    <div className='shadow-md/40 bg-[var(--tomoi-gray-l)] h-[50%] gap-1 rounded-xl flex flex-col p-3'>
                        <div className='text-3xl font-bold'>Featured List</div>
                        <div className='flex flex-col gap-3 items-center justify-center grow rounded-xl w-full border-[var(--tomoi-gray-d)] border-dashed border-2'>
                            <EmojiFrown width={60} height={60} className='text-[var(--tomoi-gray-d)]'></EmojiFrown>
                            <div className='text-[var(--tomoi-gray-d)]'>You haven't featured any lists.</div>
                        </div>
                    </div>
                    <div className='flex flex-col h-[50%] gap-1 p-2'>
                        <div className='text-3xl font-bold'>Last activity</div>
                        <div className='flex shadow-md/40 bg-white rounded-xl overflow-hidden h-full'>
                            <div className='relative grow-2 max-w-[50%] overflow-hidden bg-pink-200 p-3'>
                                <div className='absolute inset-0 bg-linear-to-b from-transparent to-white z-10'></div>
                                <div className='w-[15em] text-sm'>
                                    {sampleText}
                                </div>
                            </div>
                            <div className='grow-2 border-l-2 p-3 max-w-[50%] flex flex-col gap-3 items-between justify-around'>
                                <div>
                                    <div className='flex gap-3 justify-between items-center'>
                                        <div className='font-bold text-lg'>My First Entry</div>
                                        <div>#1</div>
                                    </div>
                                    <div>January 01, 2026</div>
                                    <div className='mt-1 px-3 bg-blue-300 w-fit rounded-full'>☺️ Happy</div>
                                </div>
                                
                                <div className='flex gap-3 flex-wrap'>
                                    <div className='px-2 border-1 border-dashed bg-[var(--tomoi-gray-l)]'>#blessed</div>
                                    <div className='px-2 border-1 border-dashed bg-[var(--tomoi-gray-l)]'>school</div>
                                    <div className='px-2 border-1 border-dashed bg-[var(--tomoi-gray-l)]'>dreams</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='inset-text-shadow fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Home</div>
        </div>
    </>
  )
}

export default Home
