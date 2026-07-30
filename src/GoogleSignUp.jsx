import { EyeIcon, EyeClosed} from 'lucide-react'
import { useState } from 'react'
import { ArrowLeft, Google } from 'react-bootstrap-icons'
import { toast} from 'react-hot-toast'
import { Link, useNavigate} from 'react-router-dom'
import { useGoogleAuth } from './utils/useGoogleAuth'
import { useAuth } from './components/AuthProvider'

import axios from 'axios'

function GoogleSignUp() {
    const {setUser} = useAuth()
    const {pendingUser} = useGoogleAuth()
    const [username, setUsername] = useState('')
    const [usernameAvailable, setUsernameAvailable] = useState(false)
    const [usernameChanged, setUsernameChanged] = useState(false)
    const [readTC, setReadTC] = useState(false)
    const navigate = useNavigate()

    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;

    const checkUsernameValidity = (username) => {
        return usernameRegex.test(username);
    }

    const usernameValid = checkUsernameValidity(username) && usernameAvailable;

    const handleSignIn = async (e) => {
        e.preventDefault()

        if (!usernameValid) {
            toast.error('Please enter a valid username!');
            return;
        } else if (!readTC) {
            toast.error('Please read and accept the Terms and Conditions!');
            return;
        } else {
            try {
                const API_URL = import.meta.env.VITE_API_URL
                const response = await axios.post(`${API_URL}/google-signup-user`, {
                    username
                }, {
                    withCredentials: true
                })

                const data = await response.data;
                if (response.status === 201) {
                    toast.success(data.message);
                    setUser(data.user)
                    navigate('/home');
                } else {
                    toast.error(data.error);
                }
            } catch (error) {
                console.error('Error signing up user:', error);
                alert('Error signing up user');
            }
        }
    }

    const checkUsernameAvailability = async (username) => {
        try {
            const response = await fetch(`http://localhost:8080/check-username?username=${username}`);
            const data = await response.json();
            setUsernameAvailable(data.isAvailable);
        } catch (error) {
            console.error('Error checking username availability:', error);
            setUsernameAvailable(false);
        }
    }

    const generateUsernameErrorMessage = () => {
        if (!usernameChanged)
            return '';

        if (username.length === 0) {
            return 'This is a required field.';
        } else if (!checkUsernameValidity(username)) {
            return 'Username must be 5-20 characters long and can only contain letters, numbers, and underscores.';
        } else if (!usernameAvailable) {
            return 'Username is already taken.';
        } else {
            return 'Username is available.';
        }
    }


    return (
        <>
        <div className='relative flex min-h-dvh w-full overflow-y-auto bg-[var(--tomoi-yellow)] justify-center items-center z-0'>
            <div className='flex flex-col w-[30%] mt-[10vh] mb-[10vh] items-center justify-center bg-white rounded-xl p-10 gap-2 shadow-md/30 z-10'>
                <div className='alt-font text-5xl leading-none'>tomoi</div>
                <div className='text-xl leading-none'>Start rambling now!</div>
                <img className='mt-5 w-20 h-20 aspect-square border-2 border-dashed object-cover rounded-full' src={pendingUser.picture}/>
                <div className='text-center'>Welcome, {pendingUser.name}!</div>
                <div className='mt-10 text-center'>Please input a new username.</div>
                <form className='flex flex-col items-center justify-center items-center justify-center w-full gap-5' onSubmit={handleSignIn}>
                    <div className='flex flex-col items-center justify-center w-full gap-1'>
                        <div className='flex font-black w-full items-center'>
                            <label className='' htmlFor="username">Username</label>
                        </div>
                        <input required className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="username" name="username" onChange={(e) => {  
                            setUsernameChanged(true);  
                            setUsername(e.target.value);
                            checkUsernameAvailability(e.target.value);
                        }} />
                        <div className={'text-sm w-full' + (checkUsernameValidity(username) && usernameAvailable ? ' text-green-500' : ' text-red-500')}>
                            {generateUsernameErrorMessage()}
                        </div>
                    </div>

                    <div className='flex items-center w-full'>
                        <input required type='checkbox' className='cursor-pointer shrink-0 w-[1em] h-[1em]' id='readTC' defaultValue={false} onChange={(e) => setReadTC(e.target.checked)}/>
                        <label className='ml-3 text-wrap leading-tight' htmlFor="readTC">I have read the &thinsp;
                            <span className='cursor-pointer font-bold underline'>Privacy Policy</span>
                            &thinsp; and agree to the &thinsp;
                            <span className='cursor-pointer font-bold underline'>Terms and Conditions</span>.
                        </label>
                    </div>

                    <div className='flex flex-col items-center justify-center grow w-full gap-2'>
                        <button className='w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="submit">Sign Up</button>
                        <Link to="/login" className='w-full'>
                            <button className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                                <ArrowLeft></ArrowLeft>
                                Back
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
            <div className='inset-text-shadow-alt fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Sign Up</div>
        </div>
        </>
    )
}

export default GoogleSignUp
