import { useState } from 'react'
import { Google } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { toast} from 'react-hot-toast'
import { useAuth } from './AuthProvider'

function Navbar() {
  const {user} = useAuth();

  return (
    <>
      <div className='relative w-full overflow-y-auto bg-white justify-center items-center z-10 py-14 px-18'>
        <div className='flex'>
            <div className='alt-font text-4xl rounded-full bg-[var(--tomoi-yellow)] px-8 py-2'>
                <div>tomoi</div>
            </div>
            <div className='flex rounded-full font-bold text-lg items-center justify-center ml-auto border-3 px-4 cursor-pointer hover:bg-[var(--tomoi-gray-d)]'>
                {user?.username ?? "unnamed"}
            </div>
        </div>
      </div>
    </>
  )
}

export default Navbar