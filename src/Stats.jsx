import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './components/AuthProvider';
import Navbar from './components/Navbar';
import { Alphabet, CaretDownFill, Clock, EmojiFrown, EmojiFrownFill, EmojiSmile, EmojiSmileFill, Fire, Tag, TagFill } from 'react-bootstrap-icons';
import { Popover } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from "axios";
import dayjs from 'dayjs';
import { useStreaks } from './components/useStreaks'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut } from 'react-chartjs-2';
import { animate, stagger, createScope, set, random, createTimeline} from 'animejs'
import { onScroll } from 'animejs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels,
);

import JournalIcon from './assets/journal_menu_btn.svg?react';

const filterOptionsMap = {
    'all': 'All time',
    'current-year': 'Current year',
    'current-month': 'Current month',
    'best': 'Best records'
}

const feelingInterpretationMap = {
    'Happy' : ['You live your life with a smile on your face!', 'var(--tomoi-yellow-l)', 'var(--tomoi-yellow)'],
    'Sad' : ["You're dealing with a lot right now, but I'm here for you.", 'var(--tomoi-blue-l)', 'var(--tomoi-blue)'],
    'Angry' : ["I'm sure you were upset for the right reasons.", 'var(--tomoi-red-l)', 'var(--tomoi-red)'],
    'Anxious' : ["Shake off the nerves! You're amazing!", 'var(--tomoi-violet-l)', 'var(--tomoi-violet)'],
    'Lovestruck' : ["Someone's in looooooove~", 'var(--tomoi-pink-l)', 'var(--tomoi-pink)'],
    'Peaceful' : ["Maintain that inner peace!", 'var(--tomoi-green-l)', 'var(--tomoi-green)'],
    'Reflective' : ["You must know yourself pretty well.", 'var(--tomoi-cyan-l)', 'var(--tomoi-cyan)'],
    'Neutral' : ["So you just don't feel anything about anything, huh.", 'var(--tomoi-gray-l)', 'var(--tomoi-gray)'],
    'Excited' : ["You are buzzing with joy!", 'var(--tomoi-orange-l)', 'var(--tomoi-orange)'],
}

const feelingMap = {
    'Angry': 'var(--tomoi-red-l)',
    'Excited': 'var(--tomoi-orange-l)',
    'Happy': 'var(--tomoi-yellow-l)',
    'Peaceful': 'var(--tomoi-green-l)',
    'Reflective': 'var(--tomoi-cyan-l)',
    'Sad': 'var(--tomoi-blue-l)',
    'Anxious': 'var(--tomoi-violet-l)',
    'Lovestruck': 'var(--tomoi-pink-l)',
    'Neutral': 'var(--tomoi-gray-l)',
}

const rootStyles = getComputedStyle(document.documentElement);
const angryColor = rootStyles.getPropertyValue('--tomoi-red-l').trim();
const excitedColor = rootStyles.getPropertyValue('--tomoi-orange-l').trim();
const happyColor = rootStyles.getPropertyValue('--tomoi-yellow-l').trim();
const peacefulColor = rootStyles.getPropertyValue('--tomoi-green-l').trim();
const reflectiveColor = rootStyles.getPropertyValue('--tomoi-cyan-l').trim();
const sadColor = rootStyles.getPropertyValue('--tomoi-blue-l').trim();
const anxiousColor = rootStyles.getPropertyValue('--tomoi-violet-l').trim();
const lovestruckColor = rootStyles.getPropertyValue('--tomoi-pink-l').trim();
const neutralColor = rootStyles.getPropertyValue('--tomoi-gray-l').trim();


function Stats() {
    const { user } = useAuth();
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const tagsContainerRef = useRef(null);
    const statFilter = 'all'
    const navigate = useNavigate();
    
    const openFilterOptions = Boolean(filterAnchorEl);
    const filterPopoverId = openFilterOptions ? 'filter-options-popover' : undefined;
    const { data: streakStats = null } = useStreaks(user.userID, dayjs().format('YYYY-MM-DD'));
    const { data: totalEntries = 0 } = useQuery({
        queryKey:['totalEntries', user.userID],
        queryFn: () => getTotalEntries(user),
        enabled: !!user
    })

    const { data: journalingDuration = 0 } = useQuery({
        queryKey:['journalingDuration', user.userID],
        queryFn: () => getJournalingDuration(user),
        enabled: !!user
    })

    const { data: wordStats = null } = useQuery({
        queryKey:['wordStats', user.userID],
        queryFn: () => getWordStats(user),
        enabled: !!user
    })

    const { data: entryChartData = null } = useQuery({
        queryKey:['entryChartData', user.userID],
        queryFn: () => getEntryChartData(user),
        enabled: !!user
    })

    const { data: feelingChartData = null } = useQuery({
        queryKey:['feelingChartData', user.userID],
        queryFn: () => getFeelingChartData(user),
        enabled: !!user
    })

    const { data: feelingMonthData = null } = useQuery({
        queryKey:['feelingMonthData', user.userID],
        queryFn: () => getFeelingMonthData(user),
        enabled: !!user
    })

    const { data: topTags = null } = useQuery({
        queryKey:['topTags', user.userID],
        queryFn: () => getTopTags(user),
        enabled: !!user
    })

    const mostUsedFeeling = feelingChartData?.reduce((maxEntry, entry) => 
        entry.count > maxEntry.count ? entry : maxEntry
    );

    const happiestMonth = feelingMonthData?.reduce((maxEntry, entry) => {
        const entryPercentage = ((entry.happy_count / (entry.happy_count + entry.sad_count)) * 100).toFixed(2)
        const maxPercentage = ((maxEntry.happy_count / (maxEntry.happy_count + maxEntry.sad_count)) * 100).toFixed(2)
        if (entryPercentage > maxPercentage)
            return entry
        else 
            return maxEntry
    });

    const saddestMonth = feelingMonthData?.reduce((maxEntry, entry) => {
        const entryPercentage = ((entry.sad_count / (entry.happy_count + entry.sad_count)) * 100).toFixed(2)
        const maxPercentage = ((maxEntry.sad_count / (maxEntry.happy_count + maxEntry.sad_count)) * 100).toFixed(2)
        if (entryPercentage > maxPercentage)
            return entry
        else 
            return maxEntry
    });

    const happyMonthPercentage = ((happiestMonth?.happy_count / (happiestMonth?.happy_count + happiestMonth?.sad_count)) * 100).toFixed(2)
    const sadMonthPercentage = ((saddestMonth?.sad_count / (saddestMonth?.happy_count + saddestMonth?.sad_count)) * 100).toFixed(2)

    const entryChartLabels = entryChartData?.map(({month}) => month);
    const feelingChartLabels = Object.keys(feelingMap)
  
    const entryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 12,
                        family: 'Kulim Park'
                    },
                    boxWidth: 15
                }
            },
            tooltip: {
                titleFont: {family: 'Kulim Park'},
                bodyfont: {family: 'Kulim Park'}
            },
            datalabels: {
                display: false
            }
        },
        responsive: true,
        scales: {
            x: {
                ticks:{
                    font: {
                        family: 'Kulim Park',
                        size: 12
                    }
                },
                stacked: true,
                grid: {
                    display: false
                }
            },
            y: {
                ticks:{
                    font: {
                        family: 'Kulim Park',
                        size: 12
                    }
                },
                stacked: true,
                beginAtZero: true
            },
        },
    };

    const feelingChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position:'left',
                align: 'center',
                labels: {
                    font: {
                        size: 12,
                        family: 'Kulim Park'
                    },
                    boxWidth: 15
                }
            },
            tooltip: {
                titleFont: {family: 'Kulim Park'},
                bodyfont: {family: 'Kulim Park'}
            },
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    let percentage = ((value / sum) * 100).toFixed(1) + "%";
                    if ((value / sum) * 100 == 0)
                        return "";
                    return percentage;
                },
                color: '#000000',
                font: {
                    size: 12,
                    family: 'Kulim Park'
                },
            }
        },
        responsive: true,
    };

    const emotionKeys = Object.keys(entryChartData?.[0] || {}).filter(key => key !== 'month');
    
    const colorPalette = [angryColor, excitedColor, happyColor, peacefulColor, reflectiveColor, sadColor, anxiousColor, lovestruckColor, neutralColor];

    const entryChartDataset = emotionKeys.map((emotion, index) => ({
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        data: entryChartData.map(item => item[emotion]),
        backgroundColor: colorPalette[index % colorPalette.length]
    }));

    const feelingCounts = Object.fromEntries(
       ( feelingChartData ?? []).map(row => [row.feeling, row.count])
    );

    const feelingOrdered = Object.keys(feelingMap).map(feeling => ({
        feeling,
        count: feelingCounts[feeling] ?? 0
    }));

    const feelingChartDataset = {
        label: 'Count',
        data: feelingOrdered?.map(item => item['count']) || [],
        backgroundColor: colorPalette
    }

    const entryChartDataFormatted = {
        labels: entryChartLabels,
        datasets: entryChartDataset
    };

    const feelingChartDataFormatted = {
        labels: feelingChartLabels,
        datasets: [feelingChartDataset]
    };

    const averageEntryPerDay = (totalEntries / journalingDuration).toFixed(2)
    const averageWordsPerEntry = Number(wordStats?.avg_words).toFixed(2)

    const getTotalEntries = async (user) => {
        if (!user)
            return [];

        const userID = user.userID

        try {
            const API_URL = import.meta.env.VITE_API_URL
        
            const response = await axios.get(`${API_URL}/get-total-entry-count`, {
                params: {
                    userID
                }
            })
            return response.data;

        } catch (err) {
            console.log(err)
        }

        return []
    }

    const getJournalingDuration = async (user) => {
        if (!user)
            return [];

        const userID = user.userID
        const userDate = dayjs().format('YYYY-MM-DD')

        try {
            const API_URL = import.meta.env.VITE_API_URL
        
            const response = await axios.get(`${API_URL}/get-journaling-duration`, {
                params: {
                    userDate,
                    userID
                }
            })
            console.log(response.data)
            return response.data;

        } catch (err) {
            console.log(err)
        }

        return []
    }

    const getWordStats = async (user) => {
        if (!user)
            return [];

        const userID = user.userID

        try {
            const API_URL = import.meta.env.VITE_API_URL
        
            const response = await axios.get(`${API_URL}/get-word-stats`, {
                params: {
                    userID
                }
            })
            console.log(response.data)
            return {
                total_words: response.data.total_words,
                avg_words: response.data.avg_words,
                longest_entry: response.data.longest_entry,
                longest_post_title: response.data.title,
                longest_post_feeling: response.data.feeling,
                longest_post_date: dayjs(response.data.dateCreated).format('MMMM DD, YYYY')
            };

        } catch (err) {
            console.log(err)
        }

        return []
    }

    const getEntryChartData = async (user) => {
        if (!user)
            return [];

        const userID = user.userID
        const userDate = dayjs().format('YYYY-MM-DD')

        try {
            const API_URL = import.meta.env.VITE_API_URL
        
            const response = await axios.get(`${API_URL}/get-entry-chart-data`, {
                params: {
                    userDate,
                    userID
                }
            })

            return response.data;

        } catch (err) {
            console.log(err)
        }

        return []
    }

    const getFeelingChartData = async (user) => {
        if (!user)
            return [];

        const userID = user.userID
        try {
            const API_URL = import.meta.env.VITE_API_URL
        
            const response = await axios.get(`${API_URL}/get-feeling-chart-data`, {
                params: {
                    userID
                }
            })
            return response.data;

        } catch (err) {
            console.log(err)
        }

        return []
    }

    const getFeelingMonthData = async (user) => {
        if (!user)
            return [];

        const userID = user.userID
        const userDate = dayjs().format('YYYY-MM-DD')

        try {
            const API_URL = import.meta.env.VITE_API_URL
        
            const response = await axios.get(`${API_URL}/get-feeling-month-data`, {
                params: {
                    userDate,
                    userID
                }
            })

            console.log(response.data)
            return response.data;

        } catch (err) {
            console.log(err)
        }

        return []
    }

    const getTopTags = async (user) => {
        if (!user)
            return [];

        const userID = user.userID

        try {
            const API_URL = import.meta.env.VITE_API_URL

            const response = await axios.get(`${API_URL}/get-top-10-tags`, {
                params: {
                    userID
                }
            })

            return response.data;

        } catch (err) {
            console.log(err)
        }

        return []
    }
    
    const openFilterPopover = (e) => {
        setFilterAnchorEl(e.currentTarget);
    }

    const closeFilterPopover = () => {
        setFilterAnchorEl(null);
    }

    useEffect(() => {
        if (!topTags || topTags.length === 0 || !tagsContainerRef.current) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const tags = entry.target.querySelectorAll('.tags');
                    if (tags.length > 0) {
                        animate('.tags', {
                            translateX: [100, 0],
                            opacity: [0, 1],
                            duration: 600,
                            delay: stagger(50),
                            easing: 'easeOutQuad'
                        });
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(tagsContainerRef.current);

        return () => {
            if (tagsContainerRef.current) {
                observer.unobserve(tagsContainerRef.current);
            }
        };
    }, [topTags]);

    return (
    <>
        <div className='bg-[var(--tomoi-yellow-l)]'>
            <Navbar></Navbar>
            <div className='flex flex-col min-h-dvh p-8 w-full overflow-y-auto justify-center items-center'>
                <div className='flex w-full max-w-6xl h-[80%] items-stretch justify-center z-10 gap-4'>
                    <div className='flex flex-col items-stretch bg-[var(--tomoi-yellow)] gap-3 w-full rounded-xl p-5 shadow-md/40'>
                        
                        <div className='flex flex-col bg-[var(--tomoi-white)] outline-2 outline-dashed outline-[var(--tomoi-yellow-d)] w-full rounded-xl p-6 gap-4'>
                            <div className='flex w-full'>
                                <div className='font-bold text-3xl outline-2 outline-dashed w-full bg-[var(--tomoi-yellow-l)] h-fit p-3 rounded-xl'>Entries</div>
                            </div>
                            {   
                                totalEntries > 0 ?
                                <div className='grid grid-cols-2 rows-2 gap-4 w-full'>
                                    <div className='relative bg-[var(--tomoi-white)] outline-2 outline-dashed overflow-hidden rounded-xl p-6 flex gap-3 items-center'>
                                        <div className='flex flex-col leading-none grow'>
                                            <div className='text-3xl font-bold leading-none'>{totalEntries}</div>
                                            <div className='text-lg leading-none'>Total entries</div>
                                        </div>
                                        <div className='flex flex-col leading-none grow z-10'>
                                            <div className='text-3xl font-bold leading-none'>{averageEntryPerDay}</div>
                                            <div className='text-lg leading-none'>Entries per day</div>
                                        </div>
                                        <JournalIcon className="rotate-15 absolute w-[8em] z-1 right-1 mt-20 fill-[var(--tomoi-gray)]" />
                                    </div>
                                    
                                    <div className='row-span-4 bg-[var(--tomoi-white)] outline-2 outline-dashed rounded-xl px-6 flex items-center'>
                                        <div className='w-full h-full px-4 py-8 flex flex-col item-center justify-center'>
                                            <div className='text-3xl text-left font-bold'>Recent entries data</div>
                                            <div className='grow'>
                                                <Bar options={entryChartOptions} data={entryChartDataFormatted}/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='relative row-span-1 bg-[var(--tomoi-white)] outline-2 outline-dashed overflow-hidden rounded-xl p-6 flex gap-3 items-center'>
                                        <div className='flex z-10 flex-col items-end leading-none grow'>
                                            <div className='text-3xl text font-bold leading-none'>{wordStats?.total_words}</div>
                                            <div className='text-lg leading-none'>Total words</div>
                                        </div>
                                        <div className='flex flex-col items-end leading-none grow'>
                                            <div className='text-3xl font-bold leading-none'>{averageWordsPerEntry}</div>
                                            <div className='text-lg leading-none text-right'>Words per entry</div>
                                        </div>
                                        <Alphabet className="z-1 opacity-30 absolute w-[10em] h-[10em] font-bold left-1 leading-none top-0 fill-[var(--tomoi-gray-d)]"/>
                                    </div>

                                    <div className='relative bg-[var(--tomoi-gray)] overflow-hidden outline-2 outline-dashed rounded-xl p-6 flex gap-3 items-center'>
                                        <div className='w-full flex flex-col gap-2'>
                                            <div className='text-lg leading-none text-left ml-1'>Longest entry</div>
                                            <div className='flex flex-col items-center justify-between bg-[var(--tomoi-white)] z-10 w-full gap-1 rounded-xl p-4 leading-none grow-2'>
                                                <div className='flex justify-between w-full'>
                                                    <div className='flex flex-col items-start gap-1'>
                                                        <div className='text-2xl font-bold leading-none'>{wordStats?.longest_post_title}</div>
                                                        <div className='text-md px-4 rounded-xl w-fit'
                                                        style={{
                                                            'backgroundColor' : (feelingMap[wordStats?.longest_post_feeling])
                                                        }}>{wordStats?.longest_post_feeling}</div>
                                                        <div className='text-md leading-none'>{wordStats?.longest_post_date}</div>
                                                    </div>
                                                    <div className='text-3xl flex flex-col leading-none justify-center items-center'>
                                                        {wordStats?.longest_entry}
                                                        <div className='text-lg leading-none'>words</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='relative bg-[var(--tomoi-white)] overflow-hidden outline-2 outline-dashed rounded-xl p-6 flex gap-3 items-center'>
                                        <div className='flex flex-col leading-none grow z-10'>
                                            <div className='text-3xl font-bold leading-none'>{streakStats?.bestStreak} days</div>
                                            <div className='text-lg leading-none'>Best writing streak</div>
                                        </div>
                                        <div className='flex flex-col leading-none grow z-10'>
                                            <div className='text-3xl font-bold leading-none'>{streakStats?.currentStreak} days</div>
                                            <div className='text-lg leading-none'>Current writing streak</div>
                                        </div>
                                        <Fire className="z-1 rotate-15 absolute w-[8em] h-[8em] right-1 top-0 fill-[var(--tomoi-orange-l)]" />
                                        
                                    </div>

                                    <div className='row-span-3 bg-[var(--tomoi-white)] outline-2 outline-dashed rounded-xl px-6 flex items-center'>
                                        <div className='w-full h-full px-4 py-8 flex flex-col'>
                                            <div className='text-3xl font-bold'>Feeling distribution</div>
                                            <div className='grow'>
                                                <Doughnut options={feelingChartOptions} data={feelingChartDataFormatted}/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='relative bg-[var(--tomoi-yellow-l)] outline-2 outline-dashed overflow-hidden rounded-xl p-6 flex gap-3 items-center'
                                        style={{"backgroundColor" : feelingInterpretationMap[mostUsedFeeling?.feeling]?.[1]}}>
                                        <div className='flex z-10 flex-col items-start leading-none grow'>
                                            <div className='text-lg leading-none'>My most used feeling was...</div>
                                            <div className='text-3xl font-bold leading-none'>{mostUsedFeeling?.feeling}</div>
                                        </div>
                                        <div className='flex z-10 flex-col items-end leading-none grow'>
                                            <div className='text-lg bg-[var(--tomoi-white)] leading-none text-center border-2 -rotate-5 border-dashed italic w-[70%]'>{feelingInterpretationMap[mostUsedFeeling?.feeling]?.[0]}</div>
                                        </div>
                                        <EmojiSmile className="z-1 absolute w-[10em] h-[10em] font-bold right-1 leading-none top-0"
                                            style={{"fill" : feelingInterpretationMap[mostUsedFeeling?.feeling]?.[2]}}/>
                                    </div>

                                    <div className='relative bg-[var(--tomoi-yellow)] overflow-hidden outline-2 outline-dashed rounded-xl p-6 flex gap-3 items-center'>
                                        <div className='flex z-10 flex-col items-end leading-none grow'>
                                            <div className='text-3xl text font-bold leading-none'>{happiestMonth?.month}</div>
                                            <div className='text-lg leading-none'>was my happiest month.</div>
                                        </div>
                                        <div className='flex flex-col items-end leading-none grow'>
                                            <div className='text-3xl font-bold leading-none'>{happyMonthPercentage}%</div>
                                            <div className='text-lg leading-none'>positive feelings</div>
                                        </div>
                                        <EmojiSmileFill className="z-1 -rotate-15 absolute w-[8em] h-[8em] font-bold left-1 leading-none top-0 fill-[var(--tomoi-yellow-l)]"/>
                                    </div>

                                    <div className='relative bg-[var(--tomoi-blue)] overflow-hidden outline-2 outline-dashed rounded-xl p-6 flex gap-3 items-center'>
                                        <div className='flex flex-col leading-none grow z-10'>
                                            <div className='text-3xl font-bold leading-none'>{saddestMonth?.month}</div>
                                            <div className='text-lg leading-none'>was my saddest month.</div>
                                        </div>
                                        <div className='flex flex-col leading-none grow z-10'>
                                            <div className='text-3xl font-bold leading-none'>{sadMonthPercentage}%</div>
                                            <div className='text-lg leading-none'>negative feelings</div>
                                        </div>
                                        <EmojiFrownFill className="z-1 rotate-15 absolute w-[8em] h-[8em] right-1 top-0 fill-[var(--tomoi-blue-l)]" />
                                        
                                    </div>

                                    <div className='bg-[var(--tomoi-gray)] col-span-2 rounded-xl p-3 outline-2 outline-dashed'> 
                                        <div className='relative bg-[var(--tomoi-white)] overflow-hidden rounded-xl p-6 flex gap-3 items-center'>
                                            <div className='flex flex-col leading-none grow gap-2 z-10'>
                                                <div className='text-lg leading-none'>My most used tags</div>

                                                {
                                                    topTags?.length > 0 ?
                                                    <div ref={tagsContainerRef} className='flex w-full overflow-hidden gap-2'>
                                                        {topTags?.map((tag, index) => (
                                                            <div key={index} className='tags text-2xl border-1 flex items-stretch justify-center divide-x-1 divide-dashed border-dashed border-[var(--tomoi-gray-d)] bg-[var(--tomoi-gray-l)] w-fit' style={{opacity: 0}}>
                                                                <div className='flex px-2' >{tag.tagName}</div>
                                                                <div className='flex items-center text-sm px-2 bg-[var(--tomoi-white)] text-[var(--tomoi-gray-d)]'>x{tag.use_count}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    :
                                                    <div className='text-xl bg-[var(--tomoi-gray-d)] rounded-xl p-2 w-full text-center leading-none italic font-bold text-[var(--tomoi-white)]'>
                                                        No tags used yet.
                                                    </div>
                                                }
                                                
                                            </div>
                                            <TagFill className="z-1 rotate-65 absolute w-[8em] h-[8em] right-1 top-0 fill-[var(--tomoi-gray-l)]" />
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className='flex flex-col items-center justify-center gap-2 w-full h-screen'>
                                    <EmojiFrown className='text-8xl fill-[var(--tomoi-black)]'></EmojiFrown>
                                    <div className='text-2xl font-bold text-[var(--tomoi-black)]'>Not enough entries!</div>
                                    <div className='text-lg w-[40%] text-center leading-none italic font-bold text-[var(--tomoi-gray-d)]'>
                                        Go to the <span onClick={() => navigate('/journal')} className='cursor-pointer hover:underline text-[var(--tomoi-yellow)]'>Journal</span> page and write some entries to start seeing your stats!
                                    </div>
                                </div>
                            }
                        </div>
                        
                    </div>
                </div>
                <div className='inset-text-shadow-alt-2 fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Stats</div>
            </div>
        </div>

        <Popover
            id={filterPopoverId}
            open={openFilterOptions}
            anchorEl={filterAnchorEl}
            onClose={closeFilterPopover}
            disableScrollLock
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            slotProps={{
                paper: {
                    sx: {
                        width: filterAnchorEl?.offsetWidth,
                        backgroundColor: 'var(--tomoi-white)',
                        border: '1px dashed black',
                        borderRadius: '8px',
                        mt: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)",
                        overflow: "visible"
                    },
                },
            }}
        >
            <div className='flex w-full flex-col divide-y-1 divide-dashed'>
                {
                    Object.entries(filterOptionsMap).map(([key, value], index) => {
                        return (
                            <div key={index} className='relative group overflow-visible'>
                                <div onClick={() => console.log('mike')} className='text-sm option leading-none px-4 py-2 hover:font-bold flex items-center justify-between overflow-visible'>
                                    {value}
                                </div>
                            </div>
                        )
                    })
                }
                
            </div>
        </Popover>
    </>
    )
}

export default Stats