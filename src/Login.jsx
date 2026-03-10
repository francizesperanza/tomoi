import { useState } from 'react'
import { Google } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'

function Login() {

  return (
    <>
      <div className='flex min-h-dvh w-full overflow-y-auto'>
        <div className='min-h-dvh w-[55%] bg-[url(/src/assets/login_splash.svg)] bg-cover bg-center'>
          <div className='italic float-right mt-[5vh] mr-[4vw] text-3xl'>Start rambling now!</div>
        </div>
        <div className='flex flex-col min-h-dvh w-[45%] bg-white items-center justify-center gap-10 overflow-hidden'>
          <div className='flex flex-col items-center mt-[10vh] justify-center'>
            <div className='alt-font text-5xl'>tomoi</div>
            <div className='text-xl'>Welcome back!</div>
          </div>
          <form className='flex flex-col items-center justify-center items-center justify-center w-[50%] gap-5'>
            <div className='flex flex-col items-center justify-center w-full gap-1'>
              <div className='flex font-black w-full'>
                <label className='' htmlFor="username">Username</label>
              </div>
              <input className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="text" id="username" name="username" />
            </div>

            <div className='flex flex-col items-center justify-center w-full gap-1'>
              <div className='flex items-center font-black w-full'>
                <label className='' htmlFor="password">Password</label>
                <a className='ml-auto text-sm font-normal hover:text-[var(--tomoi-yellow)]' href="#">Forgot password?</a>
              </div>
              <input className='w-full rounded-xl bg-[var(--tomoi-gray)] py-2 px-4' type="password" id="password" name="password" />
            </div>

            <div className='flex items-center w-full'>
              <input type='checkbox' className='cursor-pointer w-[1em] h-[1em] shrink-0' id='remember' defaultValue={false} />
              <label className='ml-2' htmlFor="remember">Remember me next time</label>
            </div>

            <div className='flex flex-col items-center justify-center w-full gap-2'>
              <button className='w-full bg-[var(--tomoi-green)] hover:bg-[var(--tomoi-green-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 border-1' type="submit">Login</button>
              <div>- or -</div>
              <button className='flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 border-1' type="button">
                <Google className='' width={20} height={20} />
                Login with Google
              </button>
            </div>
          </form>
          <div className='flex flex-col gap-2 w-[50%] items-center justify-center'>
            <div className='italic'>Don't have an account yet?</div>
            <Link to="/signup" className='w-full'>
              <button className='flex flex-row gap-2 items-center w-full justify-center bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow)] rounded-full py-2 px-4 font-bold shadow-sm/30 border-1' type="button">
                Sign Up
              </button>
            </Link>
          </div>
          <div className='inset-text-shadow text-gray-200 relative mr-auto z-0 leading-none alt-font text-[15rem] mb-[-45px]'>Login</div>
        </div>
      </div>
    </>
  )
}

export default Login
