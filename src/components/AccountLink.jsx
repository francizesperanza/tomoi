import {useRef, useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import Modal from './Modal';
import { useUploadThing } from '../utils/uploadthing';
import { useAuth } from './AuthProvider'
import { toast} from 'react-hot-toast'
import { Link, useNavigate} from 'react-router-dom'


function AccountLink({isOpen, onClose}) {
    const {user, setUser} = useAuth()
    const navigate = useNavigate();

    const handleLink = async() => {
        try {

            const API_URL = import.meta.env.VITE_API_URL
            const response = await axios.put(`${API_URL}/signup-link`, {
            }, {
                withCredentials: true
            })
            const data = await response.data
            setUser(data.user)
            toast.success(data.message)
            navigate('/')
          } catch (err) {

            console.error(err);
            console.log(err)
            if (err.response) {
                console.error(err.response.status);
                console.error(err.response.data);
            }
          }
    }

    const handleClose = () => {
        onClose()
    }
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className='flex flex-col p-4 items-center w-[40vw]'>
                    <div className='text-center w-[75%]'>There's an existing account under the same Google email. Do you want to link the account?</div>
                    <div className='flex gap-3 w-[75%] mt-10'>
                        <button onClick={handleLink} className='w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed'>Link Account</button>
                        <button onClick={handleClose} className='w-full bg-[var(--tomoi-gray)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed'>No</button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default AccountLink