import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TomoiCalendar from './components/TomoiCalendar';
import { Brush, BrushFill, CheckSquare, EmojiFrown, JournalText, PencilFill } from 'react-bootstrap-icons';
import { Popover } from '@mui/material';
import EntryEditor from './components/EntryEditor';

function Journal() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isJEditorOpen, setIsJEditorOpen] = useState(false);
  
    const open = Boolean(anchorEl);
    const id = open ? 'writing-popover' : undefined;

    const openPopover = (e) => {
        setAnchorEl(e.currentTarget);
    }
    
    const closePopover = () => {
        setAnchorEl(null);
    }

    return (
        <>
            <Navbar></Navbar>
            <div className='flex flex-col min-h-dvh w-full overflow-y-auto bg-white justify-center items-center'>
                <div className='flex justify-center items-start z-2 w-[90%] gap-4 mt-10 mb-10'>
                    <div className='bg-[var(--tomoi-gray)] p-3 rounded-xl shadow-md/40 w-[35%]'>
                        <TomoiCalendar></TomoiCalendar>
                    </div>
                    <div className='bg-[var(--tomoi-gray)] p-3 rounded-xl h-screen shadow-md/40 flex flex-col w-[65%] items-center justify-center gap-2'>
                        <div className='bg-white rounded-xl h-screen w-full items-center justify-center flex flex-col gap-5'>
                            <EmojiFrown width={'9em'} height={'9em'} className='text-[var(--tomoi-gray)]'></EmojiFrown>
                            <div className='text-lg text-[var(--tomoi-gray-d)]'>No entry yet.</div>
                            <button className='flex flex-row gap-3 items-center justify-center bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow-d)] rounded-full px-8 py-2 font-bold shadow-sm/30 outline-2 outline-dashed' type="button"
                            onClick={(e) => openPopover(e)}>
                                <PencilFill width={'1em'} height={'1em'}></PencilFill>
                                Start writing!
                            </button>
                        </div>
                    </div>
                </div>
                <div className='inset-text-shadow fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Journal</div>
            </div>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={closePopover}
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
                            mt: 1,
                        },
                    },
                }}
            >
                <div className='flex-col w-40 alt-font text-xl'>
                    <button type='button' className='flex w-full items-center justify-between gap-2 py-2 px-6 hover:bg-[var(--tomoi-gray-l)] border-b-2 border-dashed cursor-pointer' onClick={() => {setIsJEditorOpen(true); closePopover()}}>
                        <JournalText></JournalText>
                        Entry
                    </button>
                    <button type='button' className='flex w-full items-center justify-between gap-2 py-2 px-6 hover:bg-[var(--tomoi-gray-l)] border-b-2 border-dashed cursor-pointer' onClick={() => {closePopover()}}>
                        <CheckSquare></CheckSquare>
                        List
                    </button>
                    <button type='button' className='flex w-full items-center justify-between gap-2 py-2 px-6 hover:bg-[var(--tomoi-gray-l)] cursor-pointer' onClick={() => {closePopover()}}>
                        <Brush></Brush>
                        Doodle
                    </button>
                </div>
            </Popover>

            <EntryEditor isOpen={isJEditorOpen} onClose={() => setIsJEditorOpen(false)}></EntryEditor>
        </>
    )
}

export default Journal