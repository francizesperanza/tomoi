import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query'
import { EmojiFrown, ExclamationTriangle, Google, Pencil, Star, StarFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import { toast} from 'react-hot-toast';
import Navbar from './components/Navbar';
import TomoiCalendar from './components/TomoiCalendar';
import { TextStyleKit, Color } from '@tiptap/extension-text-style'
import Image from "@tiptap/extension-image";
import { TextAlign } from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'
import { generateHTML } from '@tiptap/core'
import { useEntry } from './components/EntryProvider';
import { useAuth } from './components/AuthProvider'
import axios from 'axios'

import JournalIcon from './assets/journal_menu_btn.svg?react';
import HabitsIcon from './assets/habits_menu_btn.svg?react';
import SlambookIcon from './assets/slambook_menu_btn.svg?react';
import StatsIcon from './assets/stats_menu_btn.svg?react';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isToday from 'dayjs/plugin/isToday';
import TomoiHomeMenuBtn from './components/TomoiHomeMenuBtn';
import LoadingComponent from './components/LoadingComponent';

dayjs.extend(duration);
dayjs.extend(isToday);

const calculateCountdown = () => {
    const today = dayjs().startOf('d');
    const target = today.add(24, 'hour');
    const diff = target.diff(dayjs());
    const countdown = dayjs.duration(diff);
    return {
        days: countdown.days(),
        hours: countdown.hours(),
        minutes: countdown.minutes()
    };
}

const feelingMap = {
        'Happy': 'var(--tomoi-yellow-l)',
        'Sad': 'var(--tomoi-blue-l)',
        'Angry': 'var(--tomoi-red-l)',
        'Excited': 'var(--tomoi-orange-l)',
        'Anxious': 'var(--tomoi-violet-l)',
        'Neutral': 'var(--tomoi-gray-l)',
        'Reflective': 'var(--tomoi-cyan-l)',
        'Peaceful': 'var(--tomoi-green-l)',
        'Lovestruck': 'var(--tomoi-pink-l)',
}

function Home() {
  const navigate = useNavigate();
  const {entrySet, setSelectedDate, setLoading, loading, setView} = useEntry();
  const {user} = useAuth();
  const [dailyEntryCountdown, setDailyEntryCountdown] = useState(calculateCountdown());
  const sampleText = "Want on this when she what would you. In how them or these, well two two there than give, by it about any up most want his who at. Us now do at, that these have as over I one, know some with our he no, person by not any do over give, my when in want, or an now into you with by want he get I do but not, at good, us this say my, most some use come she up if and, your him as now, good use no how us say, good like, now, do there"
  
  const writeTodayEntry = () => {
    setSelectedDate(dayjs(Date.now()).startOf('day'))
    console.log(dayjs().isToday())
    setView('calendar')
    navigate('/journal')
  }
  const goToLatestActivityEntry = (date) => {
    setSelectedDate(dayjs(date))
    setView('calendar')
    navigate('/journal')
  }

  const { data: latestEntry = {}, isPending: isLoadingLatestEntry, latestEntryError } = useQuery ({
    queryKey: ["latest-entry", user?.userID],
    queryFn: () => getLatestEntry(user),
    enabled: !!user
  })

  const { data: lastActivityEntry = {}, isPending: isLoadingLastActivityEntry, lastActivityEntryError } = useQuery ({
    queryKey: ["last-activity-entry", user?.userID],
    queryFn: () => getLastActivityEntry(user),
    enabled: !!user
  })

  const getLatestEntry = async(user) => {

    if (!user)
        return {}

    try {
        const userID = user.userID

        const API_URL = import.meta.env.VITE_API_URL
        const response = await axios.get(`${API_URL}/get-latest-entry`, {
            params: {
                userID
            }
        })
        console.log(response.data)
        return response.data
    } catch (err) {
        console.error('Error getting latest entry:', err);
    }

    return {}
}

const getLastActivityEntry = async(user) => {

    if (!user)
        return {}

    try {
        const userID = user.userID

        const API_URL = import.meta.env.VITE_API_URL
        const response = await axios.get(`${API_URL}/get-last-edited-entry`, {
            params: {
                userID
            }
        })
        console.log(response.data)
        return response.data;
    } catch (err) {
        console.error('Error getting last activity entry:', err);
    }

    return {}
}

useEffect (() => {
    const timer = setInterval (() => {
        setDailyEntryCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(timer);
})
    

  return (
    <>
        <div className='bg-[var(--tomoi-yellow-l)]'>
            <Navbar></Navbar>
            <div className='flex flex-col min-h-dvh h-screen w-full overflow-y-auto justify-center items-center'>
                <div className='flex w-full max-w-7xl h-[80%] items-stretch justify-center z-10 gap-4'>
                    <div className='flex flex-col bg-[var(--tomoi-gray)] justify-center rounded-xl w-[35%] p-4 gap-4 h-full shadow-md/40 '>
                        <TomoiCalendar></TomoiCalendar>

                        {
                            isLoadingLatestEntry ?
                            <div className='relative overflow-hidden bg-[var(--tomoi-white)] p-4 rounded-xl flex flex-col items-center h-[15%] outline-dashed outline-2 justify-center group'>
                                <LoadingComponent></LoadingComponent>
                            </div>
                            : !dayjs(latestEntry.dateCreated).isToday() || !latestEntry ?
                            <div className='flex bg-white rounded-xl items-center justify-center grow-2 gap-3 max-h-[15%] outline-[var(--tomoi-gray-d)] outline-dashed outline-2'>
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
                                <div onClick={() => writeTodayEntry()} className='border-l-2 border-dashed border-[var(--tomoi-gray-d)] group h-full flex items-center justify-center w-[20%] rounded-r-xl bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-yellow-l)]'>
                                    <Pencil width={30} height={30} className='fill-[var(--tomoi-gray-d)] group-hover:fill-[var(--tomoi-yellow)]'></Pencil>
                                </div>
                            </div>
                            :
                            <div className='flex bg-white rounded-xl items-center justify-center grow-2 gap-3 max-h-[15%] outline-[var(--tomoi-gray-d)] outline-dashed outline-2'>
                                <div className='flex gap-4 w-fit items-center py-3 justify-between'>
                                    <div className='text-5xl'>🎉</div>
                                    <div className='flex flex-col items-center'>
                                        <div className='text-sm text-left'>You already wrote an entry today!</div>
                                    </div>
                                </div>
                            </div>
                        }
                        
                    </div>
                    <div className='grid grid-flow-row grid-cols-2 grid-rows-4 bg-transparent w-[25%] gap-2'>
                        <TomoiHomeMenuBtn icon={<JournalIcon/>} btnName="Journal" colSpan="2" rowSpan="2" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)" link="/journal"></TomoiHomeMenuBtn>
                        <TomoiHomeMenuBtn icon={<HabitsIcon/>} btnName="Habits" colSpan="1" rowSpan="1" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)" link="/habits"></TomoiHomeMenuBtn>
                        <TomoiHomeMenuBtn icon={<SlambookIcon/>} btnName="Slambook" colSpan="1" rowSpan="1" bgColor="var(--tomoi-yellow)" textColor="var(--tomoi-yellow)" link="/slambook"></TomoiHomeMenuBtn>
                        <TomoiHomeMenuBtn icon={<StatsIcon/>} btnName="Stats" colSpan="2" rowSpan="1" bgColor="var(--tomoi-gray)" textColor="var(--tomoi-gray-d)" link="/stats"></TomoiHomeMenuBtn>
                    </div>
                    <div className='flex flex-col w-[35%] gap-2'>
                        <div className='flex flex-col h-[50%] gap-1'>
                            <div data-text="Last activity" className='stroked-left font-bold text-3xl'
                            style={{"--inside-color": 'black'}}>Last activity</div>
                            {
                                isLoadingLastActivityEntry ?
                                <div className='relative overflow-hidden bg-[var(--tomoi-white)] p-4 rounded-xl shadow-md/20 hover:shadow-md/40 flex flex-col items-center grow-1 justify-center group'>
                                    <LoadingComponent></LoadingComponent>
                                </div>
                                : lastActivityEntry?.content &&
                                <div onClick={() => {goToLatestActivityEntry(lastActivityEntry.dateCreated)}} className='relative overflow-hidden bg-[var(--tomoi-white)] p-4 rounded-xl shadow-md/20 hover:shadow-md/40 flex flex-col items-start grow-1 justify-end group'>
                                    <div className='absolute text-md font-bold z-50 select-none pointer-events-none right-2'>#{lastActivityEntry.postNumber}</div>
                                    <div className='absolute top-3'
                                        dangerouslySetInnerHTML={{
                                            __html: generateHTML(JSON.parse(lastActivityEntry.content), [StarterKit, TextStyleKit, Image, TextAlign])
                                        }}>
                                    </div>
                                    <div className='absolute inset-0 rounded-xl bg-linear-to-b from-1% from-transparent via-[var(--tomoi-white)] via-40% to-[var(--tomoi-white)] to-70% z-10'></div>
                                    <div className="flex flex-col z-10">
                                        <div className='font-bold text-2xl leading-none'>{lastActivityEntry.title}</div>
                                        <div>{dayjs(lastActivityEntry.dateCreated).format('MMMM DD, YYYY')}</div>
                                    </div>
                                    <div className='flex flex-col gap-1 w-full z-10'>
                                        <div className='text-sm px-4 rounded-xl w-fit'
                                        style={{
                                            'backgroundColor' : (feelingMap[lastActivityEntry.feeling])
                                        }}>{lastActivityEntry.feeling}</div>
                                        <div className='w-full flex items-center justify-between'>
                                            <div className='flex gap-1 items-center'>
                                                {
                                                    lastActivityEntry.tags?.slice(0,3).map((tag, index) => {
                                                        if (tag)
                                                            return <div key={index} className='text-sm px-2 border-1 border-dashed border-[var(--tomoi-gray-d)] bg-[var(--tomoi-gray-l)] w-fit'>{tag}</div>
                                                    })
                                                }
                                                {
                                                    lastActivityEntry.tags?.length > 3 && <div className='text-xs bg-[var(--tomoi-gray-l)] rounded-full px-2 py-1'>+{lastActivityEntry.tags.length - 3}</div>
                                                }
                                            </div>
                                            {
                                                lastActivityEntry.isFavorite ?
                                                <div className='z-100 pointer-events-auto option overflow-visible hover:font-bold flex items-center justify-between overflow-hidden'>
                                                    <StarFill className='favorite size-[1.5em] text-[var(--tomoi-yellow)] border-dashed'></StarFill>
                                                </div> 
                                                :
                                                <div className='z-100 pointer-events-auto option overflow-visible hover:font-bold flex items-center justify-between overflow-hidden'>
                                                    <Star className='favorite size-[1.5em] text-[var(--tomoi-yellow)] border-dashed'></Star>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            }
                            {
                                !lastActivityEntry && !loading &&
                                <div className='relative overflow-hidden bg-[var(--tomoi-white)] p-4 rounded-xl shadow-md/20 hover:shadow-md/40 flex flex-col items-center grow-1 justify-center group'>
                                    <div>No recent activity.</div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className='inset-text-shadow-alt-2 fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Home</div>
            </div>
        </div>
    </>
  )
}

export default Home
