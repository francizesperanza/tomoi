import { useEffect, useState, useRef} from 'react'
import { CaretLeftFill, GearFill, Google, List, PersonCircle } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { Popover } from '@mui/material';
import { toast} from 'react-hot-toast'
import { useAuth } from './AuthProvider'
import { animate, stagger, createScope, createTimer, set, random, createTimeline} from 'animejs'
import { LogOutIcon } from 'lucide-react';
import AccountSettings from './AccountSettings';
import axios from 'axios'

function Navbar() {
  const {user, setUser} = useAuth();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [accSettingsAnchorEl, setAccSettingsAnchorEl] = useState(null);
  const [isAccSettingsOpen, setIsAccSettingsOpen] = useState(false);
  
  const accSettingsOpen = Boolean(accSettingsAnchorEl);
  const accSettingsOpenId = open ? 'acc-settings-popover' : undefined;

  const root = useRef(null);

  const menuButtons = [
    {name: "Journal", path: "/journal"},
    {name: "Habits", path: "/habits"},
    {name: "Slambook", path: "/slambook"},
    {name: "Stats", path: "/stats"},
  ]

  const openAccSettingsPopover = (e) => {
    setAccSettingsAnchorEl(e.currentTarget);
  }

  const closeAccSettingsPopover = () => {
    setAccSettingsAnchorEl(null);
  }

  const collapseNav = () => {
    setIsNavOpen(!isNavOpen)
    localStorage.setItem('navPref', JSON.stringify(!isNavOpen))
  }

  const onNavOpen = () => {
      animate('.nav-bar', {
          translateX:[
              {from: -300, duration: 200, ease:'outQuad'}
          ],
          opacity: [
              {to: 1, duration: 800, ease:'outElastic'}
          ]
      });
  }

  const onNavClose = () => {
      animate('.nav-bar', {
          translateX:[
              {to: -300, duration: 200},
              {to: 1, duration: 200}
          ],
          opacity: [
              {to: 0, duration: 200}
          ]
      });

      animate('.nav-bar-btn', {
          translateX:[
              {from: 300, duration: 200}
          ],
          opacity: [
              {to: 1, duration: 200}
          ]
      });
  }

  const onButtonHover = (e) => {
      animate(e.currentTarget.querySelector('.icon'),{
          scale: [
              { to: 3, duration: 50},
          ],
          rotate: [
              {to: 10, duration: 50}
          ],
          translateX:[
              {to: -2, duration: 100}
          ]
      });

  }

  const onButtonLeave = (e) => {
      animate(e.currentTarget.querySelector('.icon'),{
          scale: [
              { to: 1, duration: 0},
          ],
          rotate: [
              {to: 0, duration: 0}
          ],
          translateX:[
              {to: 0, duration: 100}
          ]
      });

  }

  const logout = async() => {
    if (!user)
        return

    try {
        const userID = user.userID

        const API_URL = import.meta.env.VITE_API_URL
        const response = await axios.get(`${API_URL}/logout-user`)
    } catch (err) {
        console.error('Error logging out:', err);
    } finally {
        setUser(null)
        navigate('/login')
    }
  }

  useEffect (() => {
    const navPref = localStorage.getItem('navPref');
    if (navPref){
      const navOpen = JSON.parse(navPref);
      setIsNavOpen(navOpen);
    } else {
      localStorage.setItem('navPref', JSON.stringify(false))
    }

  })

  return (
    <>
      <div ref={root} className='pointer-events-none sticky top-0 w-full overflow-visible bg-transparent justify-center items-center z-20 pt-14 px-18'>
        <div className='flex'>
          <div className='flex pointer-events-auto'>
            <div data-text="tomoi" className='alt-font text-4xl rounded-full z-12 bg-[var(--tomoi-yellow)] px-8 py-2 stroked hover:bg-[var(--tomoi-yellow-d)] shadow-sm/30'
              style={{"--inside-color": 'black'}}
              onClick={() => navigate('/home')}
              >tomoi
            </div>
            <div className='z-10 bg-white nav-bar-btn -ml-18 flex items-center border-dashed border-2 border-[var(--tomoi-gray-d)] rounded-full px-5 hover:border-black group shadow-sm/30' onClick={() => {collapseNav(); onNavOpen();}}
            style={{"display": isNavOpen ? "none" : "flex"}}>
              <List className='stroke-[var(--tomoi-gray-d)] ml-15 group-hover:stroke-black' width={30} height={30}></List>
            </div>
            <div className='overflow-hidden -ml-8 rounded-full px-5 flex items-stretch group'>
              <div className='nav-bar bg-white -ml-18 gap-10 flex items-center border-dashed border-2 border-black rounded-full px-5 pl-30 hover:border-black group shadow-sm/30'
              style={{"display": isNavOpen ? "flex" : "none"}}>
                {menuButtons.map(({name, path},index) => (
                    <Link to={path} key={index} className='alt-font text-xl hover:text-[var(--tomoi-yellow)]'>{name}</Link>
                ))}
                <CaretLeftFill className='fill-black hover:fill-[var(--tomoi-yellow)] ' width={30} height={30} onClick={() => {collapseNav(); onNavClose()}}></CaretLeftFill>
              </div>
            </div>
            
          </div>
            
          <div onClick={(e) => openAccSettingsPopover(e)} className='group pointer-events-auto bg-white gap-2 flex rounded-full font-bold text-lg items-center justify-center ml-auto border-dashed border-2 px-4 cursor-pointer hover:bg-[var(--tomoi-gray-d)] shadow-sm/30'>
            {user?.username ?? "unnamed"}
            {
                user?.profilePic ?
                <img className='w-10 h-10 group-hover:brightness-75 object-cover rounded-full' src={user.profilePic} alt='Profile'></img>
                :
                <PersonCircle width={30} height={30}></PersonCircle>
            }
            
          </div>
        </div>
      </div>

      <AccountSettings isOpen={isAccSettingsOpen} onClose={() => setIsAccSettingsOpen(false)}></AccountSettings>

      <Popover
        id={accSettingsOpenId}
        open={accSettingsOpen}
        anchorEl={accSettingsAnchorEl}
        onClose={closeAccSettingsPopover}
        disableScrollLock
        anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
        }}
        transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
        }}
        slotProps={{
            paper: {
                sx: {
                    width: '13%',
                    backgroundColor: 'var(--tomoi-white)',
                    border: '2px dashed black',
                    borderRadius: '8px',
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)",
                    overflow: "hidden"
                },
            },
        }}
    >
        <div className='flex w-full flex-col divide-y-2 divide-dashed select-none cursor-pointer'>
            <div onMouseEnter={onButtonHover} onMouseLeave={onButtonLeave} onClick={() => {setIsAccSettingsOpen(true); closeAccSettingsPopover()}} className='option px-4 py-2 hover:font-bold flex items-center justify-between overflow-hidden'>
                <div className='z-10'>Account Settings</div>
                <GearFill className='icon z-1 fill-[var(--tomoi-gray-d)] w-[1em]'></GearFill>
            </div>
            <div onMouseEnter={onButtonHover} onMouseLeave={onButtonLeave} onClick={() => {logout()}} className='option px-4 py-2 text-[var(--tomoi-red)] hover:font-bold flex items-center justify-between overflow-hidden'>
                <div className='z-10'>Logout</div>
                <LogOutIcon className='icon w-[1em]'></LogOutIcon>
            </div>
        </div>
    </Popover>
    </>
  )
}

export default Navbar