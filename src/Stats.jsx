import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from './components/AuthProvider';
import Navbar from './components/Navbar';
import { Alphabet, CaretDownFill, EmojiFrownFill, EmojiSmile, EmojiSmileFill, Fire, Tag, TagFill } from 'react-bootstrap-icons';
import { Popover } from '@mui/material';

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
    'Anger' : ["I'm sure you're upset for the right reasons.", 'var(--tomoi-red-l)', 'var(--tomoi-red)'],
    'Anxious' : ["Shake off the nerves! You're amazing!", 'var(--tomoi-violet-l)', 'var(--tomoi-violet)'],
    'Lovestruck' : ["Someone's in looooooove~", 'var(--tomoi-pink-l)', 'var(--tomoi-pink)'],
    'Peaceful' : ["Maintain that inner peace!", 'var(--tomoi-green-l)', 'var(--tomoi-green)'],
    'Reflective' : ["You must know yourself pretty well.", 'var(--tomoi-cyan-l)', 'var(--tomoi-cyan)'],
    'Neutral' : ["So you just don't feel anything about anything, huh.", 'var(--tomoi-gray-l)', 'var(--tomoi-gray)'],
}

function Stats() {
    const { user } = useAuth();
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const statFilter = 'all'
    
    const openFilterOptions = Boolean(filterAnchorEl);
    const filterPopoverId = openFilterOptions ? 'filter-options-popover' : undefined;

    const openFilterPopover = (e) => {
        setFilterAnchorEl(e.currentTarget);
    }

    const closeFilterPopover = () => {
        setFilterAnchorEl(null);
    }

    return (
    <>
        <div className='bg-[var(--tomoi-yellow-l)]'>
            <Navbar></Navbar>
            <div className='flex flex-col min-h-dvh p-8 w-full overflow-y-auto justify-center items-center'>
                <div className='flex w-full max-w-7xl h-[80%] items-stretch justify-center z-10 gap-4'>
                    <div className='flex flex-col items-stretch bg-[var(--tomoi-gray)] gap-3 w-full rounded-xl p-4 shadow-md/40'>
                        <div className='flex justify-between items-center w-full gap-2 text-sm'>
                            <div className='text-3xl font-bold ml-4'>{user.username}'s Stats</div>
                            <div onClick={(e) => openFilterPopover(e)} className='hover:outline-1 outline-dashed outline-0 select-none items-center py-3 h-full flex justify-between bg-[var(--tomoi-white)] w-[10vw] leading-none px-3 rounded-xl text-sm'>{filterOptionsMap[statFilter]}
                                <CaretDownFill className='text-[var(--tomoi-gray-d)]'></CaretDownFill>
                            </div>
                        </div>
                        <div className='flex flex-col bg-[var(--tomoi-white)] outline-2 outline-dashed outline-[var(--tomoi-gray-d)] w-full rounded-xl p-6 gap-4'>
                            <div className='flex w-full'>
                                <div className='font-bold shadow-sm/30 text-4xl w-full bg-[var(--tomoi-yellow-l)] h-fit p-3 rounded-xl'>Entries</div>
                            </div>
                            <div className='grid grid-cols-2 rows-2 gap-2 w-full'>
                                <div className='relative bg-[var(--tomoi-white)] shadow-sm/30 overflow-hidden rounded-xl p-6 flex gap-3 items-center'>
                                    <div className='flex flex-col leading-none grow'>
                                        <div className='text-4xl font-bold leading-none'>600</div>
                                        <div className='text-lg leading-none'>Total entries</div>
                                    </div>
                                    <div className='flex flex-col leading-none grow z-10'>
                                        <div className='text-4xl font-bold leading-none'>0.83</div>
                                        <div className='text-lg leading-none'>Entries per day</div>
                                    </div>
                                    <JournalIcon className="rotate-15 absolute w-[8em] z-1 right-1 mt-20 fill-[var(--tomoi-gray)]" />
                                    
                                </div>
                                
                                <div className='row-span-3 bg-[var(--tomoi-gray)] rounded-xl p-3'>
                                    stacked bar past 6 months
                                </div>

                                <div className='relative bg-[var(--tomoi-gray)] overflow-hidden shadow-sm/30 rounded-xl p-6 flex gap-3 items-center'>
                                    <div className='flex z-10 flex-col items-end leading-none grow'>
                                        <div className='text-4xl text font-bold leading-none'>4,000,000</div>
                                        <div className='text-lg leading-none'>Total words</div>
                                    </div>
                                    <div className='flex flex-col items-end leading-none grow'>
                                        <div className='text-4xl font-bold leading-none'>5,999 words</div>
                                        <div className='text-lg leading-none'>Longest entry</div>
                                    </div>
                                    <Alphabet className="z-1 absolute w-[10em] h-[10em] font-bold left-1 leading-none top-0 fill-[var(--tomoi-gray-d)]"/>
                                </div>

                                <div className='relative bg-[var(--tomoi-white)] overflow-hidden shadow-sm/30 rounded-xl p-6 flex gap-3 items-center'>
                                    <div className='flex flex-col leading-none grow z-10'>
                                        <div className='text-4xl font-bold leading-none'>7 days</div>
                                        <div className='text-lg leading-none'>Current writing streak</div>
                                    </div>
                                    <div className='flex flex-col leading-none grow z-10'>
                                        <div className='text-4xl font-bold leading-none'>3 days</div>
                                        <div className='text-lg leading-none'>Current writing streak</div>
                                    </div>
                                    <Fire className="z-1 rotate-15 absolute w-[8em] h-[8em] right-1 top-0 fill-[var(--tomoi-orange-l)]" />
                                    
                                </div>

                                <div className='row-span-3 bg-[var(--tomoi-gray)] rounded-xl p-3'>
                                    feeling doughnut
                                </div>

                                <div className='relative bg-[var(--tomoi-yellow-l)] shadow-sm/30 overflow-hidden rounded-xl p-6 flex gap-3 items-center'>
                                    <div className='flex z-10 flex-col items-start leading-none grow'>
                                        <div className='text-lg leading-none'>My most used feeling was...</div>
                                        <div className='text-4xl font-bold leading-none'>Happy</div>
                                    </div>
                                    <div className='flex z-10 flex-col items-end leading-none grow'>
                                        <div className='text-lg bg-[var(--tomoi-white)] leading-none text-center border-2 -rotate-5 border-dashed italic w-[70%]'>You live your life with a smile on your face!</div>
                                    </div>
                                    <EmojiSmile className="z-1 absolute w-[10em] h-[10em] font-bold right-1 leading-none top-0 fill-[var(--tomoi-yellow)]"/>
                                </div>

                                <div className='relative bg-[var(--tomoi-yellow)] overflow-hidden shadow-sm/30 rounded-xl p-6 flex gap-3 items-center'>
                                    <div className='flex z-10 flex-col items-end leading-none grow'>
                                        <div className='text-4xl text font-bold leading-none'>June 2026</div>
                                        <div className='text-lg leading-none'>was my happiest month.</div>
                                    </div>
                                    <div className='flex flex-col items-end leading-none grow'>
                                        <div className='text-4xl font-bold leading-none'>67%</div>
                                        <div className='text-lg leading-none'>positive feelings</div>
                                    </div>
                                    <EmojiSmileFill className="z-1 -rotate-15 absolute w-[8em] h-[8em] font-bold left-1 leading-none top-0 fill-[var(--tomoi-yellow-l)]"/>
                                </div>

                                <div className='relative bg-[var(--tomoi-blue)] overflow-hidden shadow-sm/30 rounded-xl p-6 flex gap-3 items-center'>
                                    <div className='flex flex-col leading-none grow z-10'>
                                        <div className='text-4xl font-bold leading-none'>September 2025</div>
                                        <div className='text-lg leading-none'>was my saddest month.</div>
                                    </div>
                                    <div className='flex flex-col leading-none grow z-10'>
                                        <div className='text-4xl font-bold leading-none'>100%</div>
                                        <div className='text-lg leading-none'>negative feelings</div>
                                    </div>
                                    <EmojiFrownFill className="z-1 rotate-15 absolute w-[8em] h-[8em] right-1 top-0 fill-[var(--tomoi-blue-l)]" />
                                    
                                </div>

                                <div className='bg-[var(--tomoi-gray)] col-span-2 rounded-xl p-3 shadow-sm/30'> 
                                    <div className='relative bg-[var(--tomoi-white)] overflow-hidden rounded-xl p-6 flex gap-3 items-center'>
                                        <div className='flex flex-col leading-none grow z-10'>
                                            <div className='text-lg leading-none'>My most used tags</div>
                                            <div className='text-4xl font-bold leading-none'>boompala</div>
                                        </div>
                                        <TagFill className="z-1 rotate-65 absolute w-[8em] h-[8em] right-1 top-0 fill-[var(--tomoi-gray-l)]" />
                                    </div>
                                </div>
                            </div>
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