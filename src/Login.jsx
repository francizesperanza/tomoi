import { useState } from 'react'
import { Google } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { Popover } from '@mui/material';
import { toast} from 'react-hot-toast'
import { useAuth } from './components/AuthProvider'
import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios'
import AccountLink from './components/AccountLink';
import LoadingComponent from './components/LoadingComponent';

function Login() {
  const navigate = useNavigate();
  const {setUser} = useAuth();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAccLinkOpen, setIsAccLinkOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const googleLogin = useGoogleLogin({
        flow: "auth-code",
        onSuccess: async ({code}) => {
          try {

            toast.success('Google login validated successful!')
            const API_URL = import.meta.env.VITE_API_URL
            const response = await axios.post(`${API_URL}/auth/google`, {
                code
            }, {
                withCredentials: true
            })
            const data = response.data
            const status = response.data.status
            if (status === 'local') {
              return setIsAccLinkOpen(true)
            }

            if (status === 'google') {
              setUser(data.user)
              return navigate('/')
            }

            if (status === 'no-acc') {
              return navigate('/signup/google')
            }

          } catch (err) {

            console.error(err);

            if (err.response) {
                console.error(err.response.status);
                console.error(err.response.data);
            }
          }
            
        },
        onError: () => toast.error('Google login failed'),
  });

  const handleLogin = async (e) => {
      e.preventDefault()

      if (username.length === 0 || password.length === 0) {
          toast.error('Please fill in all fields!');
          return;
      } else {
          try {
            setLoginLoading(true)
              const response = await fetch('http://localhost:8080/login-user', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({ username, password }),
              });
              const data = await response.json();
              if (response.ok) {
                  toast.success(data.message);
                  setErrorMessage('');
                  setUser(data.user);
                  navigate('/home');
              } else {
                  toast.error(data.error);
                  setErrorMessage(data.error);
              }
          } catch (error) {
              alert('Error logging in user');
          } finally {
              setLoginLoading(false)
          }
      }
  }

  const handleGoogleSuccess = (e) => {

  }

  return (
    <>
      <div className='flex min-h-dvh w-full overflow-y-auto'>
        <div className='min-h-dvh w-[55%] bg-[url(/src/assets/login_splash.svg)] bg-cover bg-center'>
          <div className='italic float-right mt-[5vh] mr-[4vw] text-3xl'>Start rambling now!</div>
        </div>
        <div className='flex flex-col min-h-dvh w-[45%] bg-white items-center justify-center gap-10 overflow-hidden outline-dashed outline-4'>
          <div className='flex flex-col items-center mt-[10vh] justify-center'>
            <div className='alt-font text-5xl'>tomoi</div>
            <div className='text-xl'>Welcome back!</div>
          </div>
          <form className='flex flex-col items-center justify-center items-center justify-center w-[50%] gap-5' onSubmit={handleLogin}>
            <div className='flex flex-col items-center justify-center w-full gap-1'>
              <div className='flex font-black w-full'>
                <label className='' htmlFor="username">Username</label>
              </div>
              <input className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="username" name="username" onChange={(e) => {setUsername(e.target.value)}}/>
            </div>

            <div className='flex flex-col items-center justify-center w-full gap-1'>
              <div className='flex items-center font-black w-full'>
                <label className='' htmlFor="password">Password</label>
                <a className='ml-auto text-sm font-normal hover:text-[var(--tomoi-yellow)]' href="/forgot-password">Forgot password?</a>
              </div>
              <input className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="password" id="password" name="password" onChange={(e) => {setPassword(e.target.value)}} />
            </div>

            <div className={'text-md text-center w-full' + ' text-red-500'}>
              {errorMessage}
            </div>

            <div className='flex items-center w-full'>
              <input type='checkbox' className='cursor-pointer w-[1em] h-[1em] shrink-0' id='remember' defaultValue={false} onChange={(e) => {setRememberMe(e.target.checked)}} />
              <label className='ml-2' htmlFor="remember">Remember me next time</label>
            </div>

            <div className='flex flex-col items-center justify-center w-full gap-2'>
              <button className='relative w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="submit"
              style={{"pointerEvents" : loginLoading ? "none" : "auto"}} >
                {
                    loginLoading &&
                    <div className='loading absolute rounded-full inset-0 items-center justify-center flex bg-[var(--tomoi-green-d)] z-100 font-extrabold'>
                        <LoadingComponent/>
                    </div>
                }
                Login
              </button>
              <div>- or -</div>
              <button onClick={googleLogin} className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                <Google className='' width={20} height={20} />
                Login with Google
              </button>
            </div>
          </form>
          <div className='flex flex-col gap-2 w-[50%] items-center justify-center'>
            <div className='italic'>Don't have an account yet?</div>
            <Link to="/signup" className='w-full'>
              <button className='flex flex-row gap-2 items-center w-full justify-center bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                Sign Up
              </button>
            </Link>
          </div>
          <div className='inset-text-shadow text-gray-200 relative mr-auto z-0 leading-none alt-font text-[15rem] mb-[-45px]'>Login</div>
        </div>
      </div>

      <AccountLink isOpen={isAccLinkOpen} onClose={() => setIsAccLinkOpen(false)}></AccountLink>
    </>

  )
}

export default Login
