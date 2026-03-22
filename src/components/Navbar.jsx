import { useEffect, useState } from 'react'
import { CaretLeftFill, Google, List, PersonCircle } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { toast} from 'react-hot-toast'
import { useAuth } from './AuthProvider'

function Navbar() {
  const {user} = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const menuButtons = [
    {name: "Journal", path: "/home"},
    {name: "Habits", path: "/home"},
    {name: "Scrapbook", path: "/home"},
    {name: "Stats", path: "/home"},
  ]

  const collapseNav = () => {
    setIsNavOpen(!isNavOpen)
    localStorage.setItem('navPref', JSON.stringify(!isNavOpen))
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
      <div className='sticky top-0 w-full overflow-visible bg-transparent justify-center items-center z-20 pt-14 px-18'>
        <div className='flex'>
          <div className='flex'>
            <div className='alt-font text-4xl rounded-full z-12 bg-[var(--tomoi-yellow)] px-8 py-2 stroked hover:bg-[var(--tomoi-yellow-d)] shadow-sm/30'>tomoi</div>
            {!isNavOpen ? 
            <div className='bg-white -ml-18 flex items-center border-3 border-[var(--tomoi-gray-d)] rounded-full px-5 hover:border-black group shadow-sm/30' onClick={() => {collapseNav()}}>
              <List className='stroke-[var(--tomoi-gray-d)] ml-15 group-hover:stroke-black' width={30} height={30}></List>
            </div> :
            <div className='bg-white -ml-18 gap-10 flex items-center border-3 border-black rounded-full px-5 pl-30 hover:border-black group shadow-sm/30'>
              {menuButtons.map(({name, path},index) => (
                  <Link to={path} key={index} className='alt-font text-xl hover:text-[var(--tomoi-yellow)]'>{name}</Link>
              ))}
              <CaretLeftFill className='fill-black hover:fill-[var(--tomoi-yellow)] ' width={30} height={30} onClick={() => {collapseNav()}}></CaretLeftFill>
            </div>}
          </div>
            
          <div className='bg-white gap-2 flex rounded-full font-bold text-lg items-center justify-center ml-auto border-3 px-4 cursor-pointer hover:bg-[var(--tomoi-gray-d)] shadow-sm/30'>
            {user?.username ?? "unnamed"}
            <PersonCircle width={30} height={30}></PersonCircle>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar