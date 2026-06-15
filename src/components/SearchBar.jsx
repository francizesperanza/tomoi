import { useEffect, useState } from 'react'
import { Search, X, XSquareFill } from 'react-bootstrap-icons';
import axios from "axios";
import { useAuth } from './AuthProvider';
import { useEntry } from './EntryProvider';
import { LoaderCircle } from 'lucide-react';
import dayjs, {Dayjs} from 'dayjs';
import isLeapYear from "dayjs/plugin/isLeapYear";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";


function SearchBar() {
    const {user} = useAuth();
    const {entrySet, selectedEntry, setSelectedDate, selectedDate} = useEntry()
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [results, setResults] = useState([])
    const [focusSearch, setFocusSearch] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        const delay = setTimeout(()=>{
            setDebouncedQuery(searchQuery)
            setLoading(false)
        }, 400);

        return () => clearTimeout(delay)
    }, [searchQuery])

    const feelingMap = {
        'Happy': 'var(--tomoi-yellow-l)',
        'Sad': 'var(--tomoi-blue-l)',
        'Angry': 'var(--tomoi-red-l)',
        'Excited': 'var(--tomoi-orange-l)',
        'Anxious': 'var(--tomoi-violet-l)',
        'Neutral': 'var(--tomoi-gray-l)',
        'Reflective': 'var(--tomoi-cyan-l)',
        'Peaceful': 'var(--tomoi-green-l)',
        'Lovestruck': 'var(--tomoi-pink-l)',
    }

    useEffect(() => {

        const searchEntry = async() => {
            if (!debouncedQuery){
                setResults([]);
                return
            }
            setLoading(true)
            try {
                const API_URL = import.meta.env.VITE_API_URL
                const response = await axios.get(`${API_URL}/search`, {
                    params: {
                        userID: user.userID,
                        searchQuery: debouncedQuery
                    }
                })
                const data = response.data
                setResults(data)
            } catch (err) {
                console.error('Error searching entry:', err);
            } finally {
                setLoading(false)
            }
            
        }
        
        searchEntry()
        
    }, [debouncedQuery])

    const handleResultClick = (e) => {
        const formattedDate = dayjs(e.currentTarget.getAttribute('post-date'))
        setSelectedDate(formattedDate)
    }

    return (
        <div 
            tabIndex={-1}
            className='w-[25%] relative'
            onFocus={() => setFocusSearch(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget))
                    setFocusSearch(false)
            }}>
            <div className='w-full flex bg-[var(--tomoi-white)] rounded-xl justify-center items-center px-4 py-2 gap-4 focus-visible:outline-2'>
                {   
                    loading ?
                    <LoaderCircle className='animate-spin size-[1em]'></LoaderCircle>
                    :
                    <Search className='size-[1em]'></Search>
                }
                <input 
                    className='w-full focus-visible:outline-0 focus-visible:border-b-2 focus-visible:border-dashed' 
                    placeholder='Search for an entry...'
                    value={searchQuery}
                    onChange={(e) => {setSearchQuery(e.target.value)}}
                    
                ></input>
            </div>
            <div className='absolute overflow-y-auto max-h-[50vh] mt-1 flex flex-col divide-y-2 divide-[var(--tomoi-gray)] divide-dashed z-100 rounded-xl shadow-lg/30 bg-[var(--tomoi-white)] w-full'>
                {
                    focusSearch && (
                        results.length > 0 ?
                            results.map((result, index) => {
                                return  <div tabIndex={0} key={index} post-id={result.postID} post-date={result.dateCreated} onClick={(e)=>{handleResultClick(e)}} className='px-4 py-2 hover:bg-[var(--tomoi-yellow-l)] select-none'>
                                            <div className='font-bold text-md'>{result.title}</div>
                                            <div className='text-[var(--tomoi-gray)]'>{result.contentText.length > 30 ? result.contentText.slice(0,31) + '...' : result.contentText}</div>
                                            <div className='gap-1 flex flex-col mt-1'>
                                                <div className='text-sm px-2 rounded-xl w-fit'
                                                style={{
                                                    'backgroundColor' : (feelingMap[result.feeling])
                                                }}>{result.feeling}</div>
                                                <div className='flex gap-1'>
                                                    {
                                                        result.tags.slice(0,5).map((tag, index) => {
                                                            if (tag)
                                                                return <div key={index} className='text-sm px-2 border-1 border-dashed border-[var(--tomoi-gray-d)] bg-[var(--tomoi-gray-l)] w-fit'>{tag}</div>
                                                        })
                                                    }
                                                    {
                                                        result.tags.length > 3 && <div className='bg-[var(--tomoi-gray-l)] rounded-full px-2 py-1'>+{result.tags.length - 3}</div>
                                                    }
                                                </div>
                                                
                                            </div>
                                        </div>
                            })
                        :
                            (
                                debouncedQuery.length > 0 && !loading && results.length === 0 && 
                                <div className='px-4 py-2 text-center'>No Results.</div>
                            )
                    )
                    
                }
            </div>
        </div>
        
        
    );
}

export default SearchBar