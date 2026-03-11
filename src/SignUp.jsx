import { useState } from 'react'
import { Check, Google, Search } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'

function SignUp() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [readTC, setReadTC] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isPasswordMatch()) {
            alert('Passwords do not match!');
            return;
        } else if (!readTC) {
            alert('Please read and accept the Terms and Conditions!');
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
                console.log(data);
            } catch (error) {
                console.error('Error signing up user:', error);
                alert('Error signing up user');
            }
        }
    }

    const isPasswordMatch = () => {
        return password === confirmPassword;
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
                <form className='flex flex-col items-center justify-center items-center justify-center w-full gap-5' onSubmit={handleSubmit}>
                    <div className='flex flex-col items-center justify-center w-full gap-1'>
                        <div className='flex font-black w-full items-center justify-center'>
                            <label className='' htmlFor="username">Username</label>
                            <button className='size-[1.2em] flex items-center justify-center ml-auto bg-[var(--tomoi-yellow-l)] rounded-full hover:bg-[var(--tomoi-yellow)] border-1' type="button">
                                <Check className='' width={15} height={15} />
                            </button>
                        </div>
                        <input className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="username" name="username" onChange={(e) => setUsername(e.target.value)}/>
                    </div>

                    <div className='flex flex-col items-center justify-center w-full gap-1'>
                        <div className='flex font-black w-full'>
                            <label className='' htmlFor="email">Email</label>
                        </div>
                        <input className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="email" name="email" onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className='flex flex-col items-center justify-center w-full gap-1'>
                        <div className='flex items-center font-black w-full'>
                            <label className='' htmlFor="password">Password</label>
                            <button className='size-[1.2em] flex items-center justify-center ml-auto bg-[var(--tomoi-yellow-l)] rounded-full hover:bg-[var(--tomoi-yellow)] border-1' type="button">
                                <Check className='' width={15} height={15} />
                            </button>
                        </div>
                        <input className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div className='flex flex-col items-center justify-center w-full gap-1'>
                        <div className='flex items-center font-black w-full'>
                            <label className='' htmlFor="confirmPassword">Confirm Password</label>
                        </div>
                        <input className='w-full rounded-xl bg-[var(--tomoi-gray)] border-black py-2 px-4' type="password" id="confirmPassword" name="confirmPassword" onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>

                    <div className='flex items-center w-full'>
                        <input type='checkbox' className='cursor-pointer shrink-0 w-[1em] h-[1em]' id='readTC' defaultValue={false} onChange={(e) => setReadTC(e.target.checked)}/>
                        <label className='ml-3 text-wrap leading-tight' htmlFor="readTC">I have read the &nbsp;
                            <span className='cursor-pointer font-bold underline'>Privacy Policy</span>
                            &nbsp; and agree to the &nbsp;
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
