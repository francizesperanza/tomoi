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
    const [confirmationCode, setConfirmationCode] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [currUserEmail, setCurrUserEmail] = useState('')
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    const [emailSentCount, setEmailSetCount] = useState(0)
    const [resendTimer, setResendTimer] = useState(0)

    const [passwordChanged, setPasswordChanged] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const [confirmPasswordChanged, setConfirmPasswordChanged] = useState(false)

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const checkPasswordValidity = (password) => {
        return passwordRegex.test(password);
    }

    const isPasswordMatch = () => {
        return password === confirmPassword;
    }

    const passwordValid = checkPasswordValidity(password);
    const confirmPasswordValid = isPasswordMatch();

    const generatePasswordErrorMessage = () => {
        if (!passwordChanged)
            return '';

        if (password.length === 0) {
            return 'This is a required field.';
        } else if (!checkPasswordValidity(password)) {
            return 'Password must be 8-100 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).';
        } else {
            return 'Password is valid.';
        }
    }

    const generateConfirmPasswordErrorMessage = () => {
        if (!confirmPasswordChanged)
            return '';

        if (confirmPassword.length === 0) {
            return 'This is a required field.';
        } else if (isPasswordMatch()) {
            return 'Passwords match.';
        } else {
            return 'Passwords do not match.';
        }
    }

    const removeStoredData = () => {
        localStorage.removeItem('user-email')
        localStorage.removeItem('curr-user-email')
        localStorage.removeItem('resend-timer')
        localStorage.removeItem('reset-step')
        localStorage.removeItem('emails-sent')
    }

    const handleSubmitNewPassword = async (e) => {
        e.preventDefault()

        if (!confirmPasswordValid) {
            toast.error('Passwords do not match!');
            return;
        } else if (!passwordValid) {
            toast.error('Please enter a valid password!');
            return;
        } else {
            try {

                const API_URL = import.meta.env.VITE_API_URL
                const response = await axios.put(`${API_URL}/change-password`, {
                    password,
                    userEmail
                })

                if (response.status == 200) {
                    toast.success('Password changed!')
                    removeStoredData()
                    navigate('/login')
                }

            } catch (error) {
                toast.error(error.response.data.message ?? "Something went wrong.")
            }
        }
    }

    const handleSubmitConfirmationCode = async (e) => {
        e.preventDefault()

        if (confirmationCode.length == 0) {
            toast.error('Please enter a code!');
            return;
        } else {
            try {

                const API_URL = import.meta.env.VITE_API_URL
                const response = await axios.post(`${API_URL}/verify-confirmation-code`, {
                    confirmationCode,
                    userEmail
                })

                if (response.status == 200) {
                    toast.success('Confirmation code verified!')
                    setStep(prev => prev + 1)
                }

            } catch (error) {
                toast.error(error.response.data.message ?? "Something went wrong.")
            }
        }
    }

    const handleSubmitUserEmail = async (e) => {
        e.preventDefault()

        if (userEmail.length == 0) {
            toast.error('Please enter a username or email!');
            return;
        } else {
            try {
                if (resendTimer != 0) {
                    toast.error('Please wait for the timeout before sending another request.')
                } else {
                    toast.success('Email sent!')
                    const API_URL = import.meta.env.VITE_API_URL
                    const response = await axios.post(`${API_URL}/forgot-password`, {
                        userEmail
                    })

                    setCurrUserEmail(userEmail)
                    localStorage.setItem('curr-user-email', userEmail)
                    localStorage.setItem('user-email', userEmail)
                    setResendTimer(60)
                }
                setStep(prev => prev + 1)
                setEmailSetCount(prev => {
                    localStorage.setItem('emails-sent', prev + 1)
                    return prev + 1
                })

            } catch (error) {
                console.error('Error checking user:', error);
                console.error(error.response.status);
                console.error(error.response.data);
            }
        }
    }

    const handleResendUserEmail = async (e) => {
        e.preventDefault()

        if (userEmail.length == 0) {
            toast.error('Please enter a username or email!');
            return;
        } else {
            try {
                if (resendTimer != 0) {
                    toast.error('Please wait for the timeout before sending another request.')
                } else {
                    toast.success('Email sent!')
                    const API_URL = import.meta.env.VITE_API_URL
                    const response = await axios.post(`${API_URL}/forgot-password`, {
                        userEmail
                    })

                    setCurrUserEmail(userEmail)
                    localStorage.setItem('curr-user-email', userEmail)
                    localStorage.setItem('user-email', userEmail)
                    setResendTimer(60)
                }
                setEmailSetCount(prev => {
                    localStorage.setItem('emails-sent', prev + 1)
                    return prev + 1
                })

            } catch (error) {
                console.error('Error checking user:', error);
                console.error(error.response.status);
                console.error(error.response.data);
            }
        }
    }

    useEffect(() => {
        const ue = localStorage.getItem('user-email')
        const cue = localStorage.getItem('curr-user-email')
        const rt = +localStorage.getItem('resend-timer')
        const rs = +localStorage.getItem('reset-step')
        const es = +localStorage.getItem('emails-sent')

        if (ue)
            setUserEmail(ue)

        if (cue)
            setCurrUserEmail(cue)
        
        if (rt)
            setResendTimer(rt)

        if (rs)
            setStep(rs)

        if (es)
            setEmailSetCount(es)
    },[])

    useEffect(() => {
        if (step)
            localStorage.setItem('reset-step', step)
    }, [step])

    useEffect(() => {
        if (emailSentCount === 0) return
        const timer = setInterval (() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0;
                }
                localStorage.setItem('resend-timer', prev-1);
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
                            <Link to="/login" onClick={removeStoredData} className='w-full'>
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
                    <form className='flex flex-col items-center justify-center items-center justify-center w-full gap-5' onSubmit={handleSubmitConfirmationCode}>
                        <div className='flex flex-col gap-3 w-full'>
                            <div className='text-lg text-justify leading-none mt-10 w-full font-bold'>We have sent you the confirmation code!</div>
                            <div className='italic text-[var(--tomoi-gray-d)] leading-none w-full font-bold'>Please check the inbox connected to {currUserEmail} and input the confirmation code.</div>
                        </div>
                        
                        <div className='flex flex-col items-center justify-center w-full gap-1'>
                            <div className='flex font-black w-full items-center'>
                                <label className='' htmlFor="username">Confirmation Code</label>
                            </div>
                            <input required className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="username" name="username" onChange={(e) => {  
                                setConfirmationCode(e.target.value);
                            }} />
                            {
                                resendTimer != 0 ?
                                <div>You can resend the code after {resendTimer}s</div>
                                :
                                <div onClick={handleResendUserEmail} className='cursor-pointer underline font-bold'>Resend code</div>
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

                {
                    step == 3 &&
                    <form className='flex flex-col items-center justify-center items-center justify-center w-full gap-5' onSubmit={handleSubmitNewPassword}>
                        <div className='flex flex-col gap-3 w-full'>
                            <div className='text-lg text-justify leading-none mt-10 w-full font-bold'>Confirmation code validated!</div>
                            <div className='italic text-[var(--tomoi-gray-d)] leading-none w-full font-bold'>Please enter a new password.</div>
                        </div>
                        
                        <div className='flex flex-col items-center justify-center w-full gap-1'>
                            <div className='flex items-center font-black w-full'>
                                <label className='' htmlFor="password">Password</label>
                            </div>
                            <div className='flex items-stretch w-full'>
                                <input required className='w-full rounded-s-lg bg-[var(--tomoi-gray)] py-2 px-4' type={isPasswordVisible ? "text" : "password"} id="password" name="password" onChange={(e) => {
                                    setPasswordChanged(true);
                                    setPassword(e.target.value);
                                    checkPasswordValidity(e.target.value);
                                }} />
                                <button dir='rtl' className='border-dashed border-2 rounded-s-lg flex w-[20%] items-center justify-center cursor-pointer bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow)]' type='button' onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                                    {isPasswordVisible ? <EyeIcon className='' width={20} height={20} /> : <EyeClosed className='' width={20} height={20} />}
                                </button>
                            </div>
                            <div className={'text-sm w-full' + (checkPasswordValidity(password) ? ' text-green-500' : ' text-red-500')}>
                                {generatePasswordErrorMessage()}
                            </div>
                        </div>

                        <div className='flex flex-col items-center justify-center w-full gap-1'>
                            <div className='flex items-center font-black w-full'>
                                <label className='' htmlFor="confirmPassword">Confirm Password</label>
                            </div>
                            <input required className='w-full rounded-xl bg-[var(--tomoi-gray)] border-black py-2 px-4' type="password" id="confirmPassword" name="confirmPassword" onChange={(e) => {
                                setConfirmPasswordChanged(true);
                                setConfirmPassword(e.target.value);
                            }}/>
                            <div className={'text-sm w-full' + (isPasswordMatch() && password.length != 0 ? ' text-green-500' : ' text-red-500')}>
                                {generateConfirmPasswordErrorMessage()}
                            </div>
                        </div>
                        
                        <div className='flex flex-col items-center justify-center grow w-full gap-2'>
                            <button className='w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="submit">Change Password</button>
                            <Link to="/login" onClick={removeStoredData} className='w-full'>
                                <button className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                                    <ArrowLeft></ArrowLeft>
                                    Back
                                </button>
                            </Link>
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