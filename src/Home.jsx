import { useState } from 'react'
import { Google } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { toast} from 'react-hot-toast'
import Navbar from './components/Navbar';
import TomoiCalendar from './components/TomoiCalendar';

function Home() {
  const navigate = useNavigate();

  return (
    <>
        <Navbar></Navbar>
        <div className='flex flex-col min-h-dvh h-screen w-full overflow-y-auto bg-white justify-center items-center'>
            <div className='flex w-full max-w-7xl h-[80%] items-stretch justify-center z-10 gap-4'>
                <div className='flex flex-col bg-[var(--tomoi-gray)] rounded-xl w-[35%] p-3'>
                    <TomoiCalendar></TomoiCalendar>
                </div>
                <div className='grid grid-flow-row grid-cols-2 grid-rows-4 bg-transparent w-[25%] gap-2'>
                    <button className='bg-[var(--tomoi-yellow)] rounded-xl col-span-2 row-span-2'>journal</button>
                    <button className='bg-[var(--tomoi-yellow)] rounded-xl'>habits</button>
                    <button className='bg-[var(--tomoi-yellow)] rounded-xl'>scrapbook</button>
                    <button className='bg-[var(--tomoi-gray)] col-span-2 rounded-xl'>stats</button>
                </div>
                <div className='flex flex-col w-[35%] gap-2'>
                    <div className='bg-[var(--tomoi-gray)] h-[50%] rounded-xl'> featured list </div>
                    <div className='flex flex-col h-[50%]'>
                        <div className='text-3xl font-bold'>Last activity</div>
                        <div className='shadow-sm/30 bg-white rounded-xl h-full gap-2'>ENTRY</div>
                    </div>
                </div>
            </div>
            <div className='inset-text-shadow fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Home</div>
        </div>
    </>
  )
}

export default Home
