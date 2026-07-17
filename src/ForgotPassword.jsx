import { EyeIcon, EyeClosed} from 'lucide-react'
import { useEffect, useState } from 'react'
import { ArrowLeft, Google } from 'react-bootstrap-icons'
import { toast} from 'react-hot-toast'
import { Link, useNavigate} from 'react-router-dom'
import { useGoogleAuth } from './utils/useGoogleAuth'
import { useAuth } from './components/AuthProvider'
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import axios from 'axios'
import { set } from 'animejs'
dayjs.extend(duration);

function ForgotPassword() {
    const {setUser} = useAuth()
    const [userEmail, setUserEmail] = useState('')
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    const [emailSentCount, setEmailSetCount] = useState(0)
    const [confirmationTimer, setConfirmationTimer] = useState(0)
    const [currUserEmail, setCurrUserEmail] = useState(0)

    const handleSubmitUserEmail = async (e) => {
        e.preventDefault()

        if (userEmail.length == 0) {
            toast.error('Please enter a username or email!');
            return;
        } else {
            try {
                if (confirmationTimer != 0) {
                    toast.error('Please wait for the timeout before sending another request.')
                } else {
                    toast.success('Email sent!')
                    setCurrUserEmail(userEmail)
                    const API_URL = import.meta.env.VITE_API_URL
                    const response = await axios.post(`${API_URL}/forgot-password`, {
                        userEmail
                    })
                    
                    setConfirmationTimer(180)
                }
                setStep(prev => prev + 1)
                setEmailSetCount(prev => prev + 1)

            } catch (error) {
                console.error('Error checking user:', error);
                console.error(error.response.status);
                console.error(error.response.data);
            }
        }
    }

    useEffect(() => {
        if (emailSentCount === 0) return
        const timer = setInterval (() => {
            setConfirmationTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [emailSentCount])

    return (
        <>
        <div className='relative flex min-h-dvh w-full overflow-y-auto bg-[var(--tomoi-yellow)] justify-center items-center z-0'>
            <div className='flex flex-col w-[30%] mt-[10vh] mb-[10vh] items-center justify-center bg-white rounded-xl p-10 gap-2 shadow-md/30 z-10'>
                <div className='alt-font text-5xl leading-none'>tomoi</div>
                <div className='text-xl leading-none'>Start rambling now!</div>
                
                {
                    step == 1 &&
                    <form className='flex flex-col items-center justify-center items-center justify-center w-full gap-5' onSubmit={handleSubmitUserEmail}>
                        <div className='text-xl mt-10 mb-5 text-center w-full font-bold underline'>Find your account</div>
                        <div className='flex flex-col items-center justify-center w-full gap-1'>
                            <div className='flex font-black w-full items-center'>
                                <label className='' htmlFor="username">Username or Email</label>
                            </div>
                            <input required className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="userEmail" name="userEmail" onChange={(e) => {  
                                setUserEmail(e.target.value);
                            }} />
                        </div>

                        <div className='flex flex-col items-center justify-center grow w-full gap-2'>
                            <button className='w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="submit">Submit</button>
                            <Link to="/login" className='w-full'>
                                <button className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                                    <ArrowLeft></ArrowLeft>
                                    Back
                                </button>
                            </Link>
                        </div>
                    </form>
                }

                {
                    step == 2 &&
                    <form className='flex flex-col items-center justify-center items-center justify-center w-full gap-5' onSubmit={handleSubmitUserEmail}>
                        <div className='flex flex-col gap-3'>
                            <div className='text-lg text-justify leading-none mt-10 w-full font-bold'>We have sent you the confirmation code!</div>
                            <div className='italic text-[var(--tomoi-gray-d)] leading-none w-full font-bold'>Please check the inbox connected to {currUserEmail} and input the confirmation code.</div>
                        </div>
                        
                        <div className='flex flex-col items-center justify-center w-full gap-1'>
                            <div className='flex font-black w-full items-center'>
                                <label className='' htmlFor="username">Confirmation Code</label>
                            </div>
                            <input required className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="username" name="username" onChange={(e) => {  
                                setUserEmail(e.target.value);
                            }} />
                            {
                                confirmationTimer != 0 ?
                                <div>You can resend the code after {confirmationTimer}s</div>
                                :
                                <div className='cursor-pointer underline font-bold'>Resend code</div>
                            }
                        </div>
                        
                        <div className='flex flex-col items-center justify-center grow w-full gap-2'>
                            <button className='w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="submit">Submit</button>
                            <button onClick={() => setStep(prev => prev-1)} className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                                <ArrowLeft></ArrowLeft>
                                Change Username/Email
                            </button>
                        </div>
                    </form>
                }

            </div>
            <div className='inset-text-shadow-alt fixed left-0 -bottom-12 z-1 leading-none alt-font text-nowrap text-[13rem]'>Forgot Password</div>
        </div>
        </>
    )
}

export default ForgotPassword