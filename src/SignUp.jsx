import { EyeIcon, EyeClosed} from 'lucide-react'
import { useState } from 'react'
import { Google } from 'react-bootstrap-icons'
import { toast} from 'react-hot-toast'
import { Link, useNavigate} from 'react-router-dom'

function SignUp() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [readTC, setReadTC] = useState(false)

    const [usernameAvailable, setUsernameAvailable] = useState(false)
    const [usernameChanged, setUsernameChanged] = useState(false)

    const [emailAvailable, setEmailAvailable] = useState(false)
    const [emailChanged, setEmailChanged] = useState(false)

    const [passwordChanged, setPasswordChanged] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const [confirmPasswordChanged, setConfirmPasswordChanged] = useState(false)

    const navigate = useNavigate();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;

    
    const checkUsernameValidity = (username) => {
        return usernameRegex.test(username);
    }

    const checkEmailValidity = (email) => {
        return emailRegex.test(email);
    }

    const checkPasswordValidity = (password) => {
        return passwordRegex.test(password);
    }

    const isPasswordMatch = () => {
        return password === confirmPassword;
    }

    const usernameValid = checkUsernameValidity(username) && usernameAvailable;
    const emailValid = checkEmailValidity(email) && emailAvailable;
    const passwordValid = checkPasswordValidity(password);
    const confirmPasswordValid = isPasswordMatch();

    const handleSignIn = async (e) => {
        e.preventDefault()

        if (!confirmPasswordValid) {
            toast.error('Passwords do not match!');
            return;
        } else if (!readTC) {
            toast.error('Please read and accept the Terms and Conditions!');
            return;
        } else if (!usernameValid) {
            toast.error('Please enter a valid username!');
            return;
        } else if (!emailValid) {
            toast.error('Please enter a valid email address!');
            return;
        } else if (!passwordValid) {
            toast.error('Please enter a valid password!');
            return;
        } else {
            try {
                const response = await fetch('http://localhost:8080/signup-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success(data.message);
                    navigate('/login');
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

    const checkEmailAvailability = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/check-email?email=${email}`);
            const data = await response.json();
            setEmailAvailable(data.isAvailable);
        } catch (error) {
            console.error('Error checking email availability:', error);
            setEmailAvailable(false);
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

    const generateEmailErrorMessage = () => {
        if (!emailChanged)
            return '';

        if (email.length === 0) {
            return 'This is a required field.';
        } else if (!checkEmailValidity(email)) {
            return 'Please enter a valid email address.';
        } else if (!emailAvailable) {
            return 'Email is already taken.';
        } else {
            return 'Email is available.';
        }
    }

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


    return (
        <>
        <div className='relative flex min-h-dvh w-full overflow-y-auto bg-[var(--tomoi-yellow)] justify-center items-center z-0'>
            <div className='flex flex-col w-[30%] mt-[10vh] mb-[10vh] items-center justify-center bg-white rounded-xl min-h-dvh p-10 gap-2 shadow-md/30 z-10'>
                <div className='alt-font text-5xl'>tomoi</div>
                <div className='text-xl'>Start rambling now!</div>
                <button className='flex flex-row gap-3 mt-[6vh] mb-[2vh] items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 border-1' type="button">
                    <Google className='' width={20} height={20} />
                    Login with Google
                </button>
                <div>- or -</div>
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

                    <div className='flex flex-col items-center justify-center w-full gap-1'>
                        <div className='flex font-black w-full'>
                            <label className='' htmlFor="email">Email</label>
                        </div>
                        <input required className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="email" name="email" onChange={(e) => {
                            setEmailChanged(true);
                            setEmail(e.target.value);
                            checkEmailAvailability(e.target.value);
                        }} />
                        <div className={'text-sm w-full' + (checkEmailValidity(email) && emailAvailable ? ' text-green-500' : ' text-red-500')}>
                            {generateEmailErrorMessage()}
                        </div>
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
                            <button dir='rtl' className='border-dashed border-1 rounded-s-lg flex w-[20%] items-center justify-center cursor-pointer bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow)]' type='button' onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
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
                        <div className={'text-sm w-full' + (isPasswordMatch() ? ' text-green-500' : ' text-red-500')}>
                            {generateConfirmPasswordErrorMessage()}
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

                    <div className='flex flex-col items-center justify-center w-full gap-2'>
                        <button className='w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 border-1' type="submit">Sign Up</button>
                        <div className='mt-5 italic'>Already have an account? </div>
                        <Link to="/login" className='w-full'>
                            <button className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 border-1' type="button">
                                Login
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

export default SignUp
