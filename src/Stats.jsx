import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from './components/AuthProvider';
import Navbar from './components/Navbar';
import { CaretDownFill } from 'react-bootstrap-icons';
import { Popover } from '@mui/material';

const filterOptionsMap = {
    'all': 'All time',
    'current-year': 'Current year',
    'current-month': 'Current month',
    'best': 'Best records'
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
            <div className='flex flex-col min-h-dvh h-screen w-full overflow-y-auto justify-center items-center'>
                <div className='flex w-full max-w-7xl h-[80%] items-stretch justify-center z-10 gap-4'>
                    <div className='flex flex-col items-stretch bg-[var(--tomoi-gray)] gap-3 w-full rounded-xl p-4 shadow-md/40'>
                        <div className='flex justify-between items-center w-full gap-2 text-sm'>
                            <div className='text-3xl font-bold ml-4'>{user.username}'s Stats</div>
                            <div onClick={(e) => openFilterPopover(e)} className='hover:outline-1 outline-dashed outline-0 select-none items-center py-3 h-full flex justify-between bg-[var(--tomoi-white)] w-[10vw] leading-none px-3 rounded-xl text-sm'>{filterOptionsMap[statFilter]}
                                <CaretDownFill className='text-[var(--tomoi-gray-d)]'></CaretDownFill>
                            </div>
                        </div>
                        <div className='flex bg-[var(--tomoi-white)] h-screen w-full rounded-xl p-6'>
                            <div className='font-bold text-2xl w-full bg-[var(--tomoi-yellow-l)] h-fit p-3 rounded-xl'>Entries</div>
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