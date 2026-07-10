import {useRef, useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import Modal from './Modal';
import { useAuth } from './AuthProvider'
import { EyeIcon, EyeClosed} from 'lucide-react'
import { toast} from 'react-hot-toast'
import { Link, useNavigate} from 'react-router-dom'
import { Person } from 'react-bootstrap-icons';

function AccountSettings({isOpen, onClose}) {
    const {user} = useAuth()
    const [username, setUsername] = useState(user.username)
    const [password, setPassword] = useState(user.password)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [profilePic, setProfilePic] = useState("")

    const [usernameAvailable, setUsernameAvailable] = useState(false)
    const [usernameChanged, setUsernameChanged] = useState(false)

    const [passwordChanged, setPasswordChanged] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const [confirmPasswordChanged, setConfirmPasswordChanged] = useState(false)

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;

    const checkUsernameValidity = (username) => {
        return usernameRegex.test(username);
    }

    const checkPasswordValidity = (password) => {
        return passwordRegex.test(password);
    }

    const isPasswordMatch = () => {
        return password === confirmPassword;
    }

    const usernameValid = checkUsernameValidity(username) && usernameAvailable;
    const passwordValid = checkPasswordValidity(password);
    const confirmPasswordValid = isPasswordMatch();

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

        if (username.length === 0)
            return '';

        if (username === user.username) {
            return 'This is your current username.';
        } else if (!checkUsernameValidity(username)) {
            return 'Username must be 5-20 characters long and can only contain letters, numbers, and underscores.';
        } else if (!usernameAvailable) {
            return 'Username is already taken.';
        } else {
            return 'Username is available.';
        }
    }

    const generatePasswordErrorMessage = () => {
        if (!passwordChanged)
            return '';

        if (username.length === 0)
            return ''

        if (!checkPasswordValidity(password)) {
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

    const handleChangeSettings = async (e) => {
        e.preventDefault()

        if (!confirmPasswordValid) {
            toast.error('Passwords do not match!');
            return;
        } else if (!usernameValid) {
            toast.error('Please enter a valid username!');
            return;
        } else if (!passwordValid) {
            toast.error('Please enter a valid password!');
            return;
        } else {
            toast.success('You can change!')
        }
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className='relative flex border-t-2 border-dashed border-[var(--tomoi-gray-d)] max-h-[70vh] overflow-hidden'>
                    <div className='sticky top-0 flex w-[30%] flex-col bg-[var(--tomoi-gray)]  rounded-lt-xl py-4 pl-4 min-h-[70vh]'>
                        <div className='flex p-4 bg-[var(--tomoi-white)] gap-3 items-center font-bold rounded-l-xl shadow-sm/30'>
                            <Person></Person>
                            Account details
                        </div>
                    </div>
                    <div className='bg-[var(--tomoi-white)] overflow-y-auto border-l-2 border-dashed border-[var(--tomoi-gray-d)] gap-2 flex flex-col px-10 py-10 rounded-rt-xl w-[70%]'>
                        <div className='text-3xl font-bold'>Change account details</div>
                        <div className='border-t-2 border-dashed'/>
                        <form className='flex flex-col items-center justify-center items-center justify-center w-full gap-5 pt-5' onSubmit={handleChangeSettings}>
                            <div className='flex flex-col items-center justify-center w-full gap-1'>
                                <div className='flex font-black w-full items-center'>
                                    <label className='' htmlFor="username">Username</label>
                                </div>
                                <input autoComplete="off" placeholder={user.username} className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="username" name="username" onChange={(e) => {
                                    setUsernameChanged(true);
                                    setUsername(e.target.value);
                                    checkUsernameAvailability(e.target.value);
                                }} />
                                <div className={'text-sm w-full' + (checkUsernameValidity(username) && usernameAvailable ? ' text-green-500' : ' text-red-500')}>
                                    {generateUsernameErrorMessage()}
                                </div>
                            </div>

                            <div className='flex flex-col items-center justify-center w-full gap-1'>
                                <div className='flex items-center font-black w-full'>
                                    <label className='' htmlFor="password">Password</label>
                                </div>
                                <div className='flex items-stretch w-full'>
                                    <input autoComplete="new-password" className='w-full rounded-s-lg bg-[var(--tomoi-gray)] py-2 px-4' type={isPasswordVisible ? "text" : "password"} id="password" name="password" onChange={(e) => {
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
                                <input required autoComplete="new-password" className='w-full rounded-xl bg-[var(--tomoi-gray)] border-black py-2 px-4' type="password" id="confirmPassword" name="confirmPassword" onChange={(e) => {
                                    setConfirmPasswordChanged(true);
                                    setConfirmPassword(e.target.value);
                                }}/>
                                <div className={'text-sm w-full' + (isPasswordMatch() && password.length != 0 ? ' text-green-500' : ' text-red-500')}>
                                    {generateConfirmPasswordErrorMessage()}
                                </div>
                            </div>
                            <div className='flex flex-col items-center justify-center w-full gap-2 mt-20'>
                                <Link to="/login" className='w-full'>
                                    <button className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                                        Save Settings
                                    </button>
                                </Link>
                            </div>
                        </form>
                    </div>
                    
                </div>
                
            </Modal>
        </>
    )
}

export default AccountSettings