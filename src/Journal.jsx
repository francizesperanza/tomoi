import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TomoiCalendar from './components/TomoiCalendar';
import { EmojiFrown, JournalText, PencilFill, ThreeDotsVertical, Star, ArrowLeftRight, Trash, StarFill, CalendarWeekFill, GridFill } from 'react-bootstrap-icons';
import { duration, Popover } from '@mui/material';
import EntryEditor from './components/EntryEditor';
import { useEditor, EditorContent, EditorContext, useEditorState } from '@tiptap/react';
import { generateHTML } from '@tiptap/core'
import { TextStyleKit, Color } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder, CharacterCount} from '@tiptap/extensions'
import { animate, stagger, createScope, createTimer, set, random, createTimeline} from 'animejs'
import { useEntry } from './components/EntryProvider';
import LoadingComponent from './components/LoadingComponent';
import axios from "axios";
import dayjs, {Dayjs} from 'dayjs';
import { toast} from 'react-hot-toast'


import isLeapYear from "dayjs/plugin/isLeapYear";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import SearchBar from './components/SearchBar';


dayjs.extend(isLeapYear);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);


function Journal() {
    const {setSelectedEntry, setEntrySet, setSelectedDate, selectedEntry, loading, setLoading, refreshEntries, entrySet, view, setView} = useEntry();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isJEditorOpen, setIsJEditorOpen] = useState(false);
    const [hasEntry, setHasEntry] = useState(false);
    const [mode, setMode] = useState("new");

    const root = useRef(null);
    const scope = useRef(null);
  
    const open = Boolean(anchorEl);
    const id = open ? 'entry-options-popover' : undefined;

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

    const openPopover = (e) => {
        setAnchorEl(e.currentTarget);
        if (view !== 'calendar') {
            setSelectedDate(dayjs(e.currentTarget.getAttribute('post-date')))
        }
    }
    
    const closePopover = () => {
        document.activeElement?.blur()
        setAnchorEl(null);
    }

    const getTeaser = (editor, limit = 5) => {
        const text = editor.getText();
        return text.length > limit ? text.substring(0, limit) + '...' : text;
    }

    const editor = useEditor({
        extensions: [
            StarterKit, 
            TextStyleKit,
            Placeholder.configure({
                placeholder: 'Loading content',
            })
        ],
        content: '<p>empty</p>',
        immediatelyRender: true,
        autofocus: true,
        editable: false,
        editorProps: {
            attributes: {
            class: 'focus:outline-none w-full mt-5 min-h-[55vh] mb-5',
            },
        },
        onCreate({ editor }) {
            editor.chain().setColor('var(--tomoi-black)').run()
        }
    })

    useEffect(() => {
        if (selectedEntry != undefined){
            try {
                editor.commands.setContent(JSON.parse(selectedEntry.content))
                setHasEntry(true)
            } catch (err) {
                editor.commands.setContent("empty")
                setHasEntry(false)
            }
        } else {
            editor.commands.setContent("empty")
            setHasEntry(false)
        }
    }, [selectedEntry])

    useEffect(() => {
        scope.current = createScope({ root }).add( self => {
        });
        return () => scope.current.revert()
    })

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

    const onFavoriteHover = (e) => {
        animate(e.currentTarget.querySelector('.favorite'),{
            border: [
                {to: 2, duration: 100}
            ],
            borderColor: [
                {to: 'var(--tomoi-yellow)'}
            ]
        });

    }

    const onFavoriteLeave = (e) => {
        animate(e.currentTarget.querySelector('.favorite'),{
            border: [
                {to: 0, duration: 100}
            ],
            borderColor: [
                {to: 'var(--tomoi-yellow)'}
            ]
        });

    }

    const onHandleFavorite = async(e, id) => {
        try {
            var favoritedEntry = entrySet.find(entry => entry.postID === id)
            const resFavorite = !favoritedEntry.isFavorite
            animate(e.currentTarget.querySelector('.favorite'),{
                scale: [
                    { to: 0.7, duration: 200, delay: 0},
                ],
                rotate: [
                    { to: 180, duration: 200}
                ]
            });

            createTimer({
                duration: 200
            });

            const API_URL = import.meta.env.VITE_API_URL
            const response = await axios.put(`${API_URL}/update-favorite`, {
                postID: favoritedEntry.postID,
                favorite: resFavorite
            })

            entrySet.find(entry => entry.postID === id).isFavorite = resFavorite
            setSelectedDate(dayjs(favoritedEntry.dateCreated))

        } catch (err) {
            console.error('Error updating favorite:', err);
        }
    }

    const onHandleDelete = async() => {
        try {
            setLoading(true)
            
            const API_URL = import.meta.env.VITE_API_URL
            const response = await axios.delete(`${API_URL}/delete-entry`, {
                data: {
                    postID: selectedEntry.postID,
                    contentID: selectedEntry.contentID,
                    tags: selectedEntry.tags
                }
            })
            const data = await response.data;
            toast.success(data.message);
            await refreshEntries();
        } catch (err) {
            console.error('Error deleting entry:', err);
        } finally {
            setLoading(false)
        }
    }

    const openSelectedEntry = (date) => {
        const entry = entrySet.find(entry => dayjs(entry.dateCreated).isSame(date, 'day'))
        if (entry){
            setSelectedEntry(entry)
            setIsJEditorOpen(true)
            setMode("edit")
        } else {
            setSelectedEntry(null)
            setIsJEditorOpen(true)
            setMode("new")
        }
    }

    return (
        <>
            <div className = 'bg-[var(--tomoi-yellow-l)]'>
                <Navbar></Navbar>
                <div ref={root} className='flex flex-col min-h-dvh w-full overflow-y-auto justify-start items-center'>
                    <div className='w-[90%] bg-[var(--tomoi-gray)] rounded-xl px-6 py-3 shadow-md/20 flex justify-between mt-3'>
                        <div className='flex divide-x-2 divide-dashed divide-[var(--tomoi-gray)] select-none'>
                            <div onClick={() => setView('calendar')} className={'gap-2 rounded-l-xl px-[0.7em] py-[0.4em] flex justify-center items-center group ' + (view === 'calendar' ? 'bg-[var(--tomoi-yellow)]' : 'bg-[var(--tomoi-white)]')}>
                                <CalendarWeekFill className={'size-[1.4em] text-[var(--tomoi-gray)] ' + (view === 'calendar' ? 'text-[var(--tomoi-white)]' : 'text-[var(--tomoi-gray)] group-hover:text-[var(--tomoi-yellow)]')}></CalendarWeekFill>
                            </div>
                            <div onClick={() => setView('all')} className={'gap-2 bg-[var(--tomoi-white)] px-[0.7em] py-[0.4em] flex justify-center items-center group ' + (view === 'all' ? 'bg-[var(--tomoi-yellow)]' : 'bg-[var(--tomoi-white)]')}>
                                <GridFill className={'size-[1.4em] text-[var(--tomoi-gray)] ' + (view === 'all' ? 'text-[var(--tomoi-white)]' : 'text-[var(--tomoi-gray)] group-hover:text-[var(--tomoi-yellow)]') }></GridFill>
                            </div>
                            <div onClick={() => setView('favorites')} className={'gap-2 bg-[var(--tomoi-white)] rounded-r-xl px-[0.7em] py-[0.4em] flex justify-center items-center group ' + (view === 'favorites' ? 'bg-[var(--tomoi-yellow)]' : 'bg-[var(--tomoi-white)]')}>
                                <StarFill className={'size-[1.4em] text-[var(--tomoi-gray)] ' + (view === 'favorites' ? 'text-[var(--tomoi-white)]' : 'text-[var(--tomoi-gray)] group-hover:text-[var(--tomoi-yellow)]')} ></StarFill>
                            </div>
                        </div>
                        <SearchBar></SearchBar>
                    </div>
                    <div className='w-full flex justify-center items-start z-2 mt-3 mb-10'>
                        {
                            (view === 'all' || view === 'favorites') &&
                            <div className='shadow-md/20 flex rounded-xl justify-center w-[90%] min-h-screen bg-[var(--tomoi-gray)]'>
                                <div className='grid grid-cols-4 h-fit gap-4 p-4 w-full items-contain auto-cols-[minmax(0,3fr)]'>
                                    {
                                        entrySet.map((entry, index) => {
                                            return  <div key={index} onClick={() => {openSelectedEntry(entry.dateCreated)}} className='relative overflow-hidden bg-[var(--tomoi-white)] h-[30vh] p-4 rounded-xl shadow-md/20 hover:shadow-md/40 flex flex-col items-start justify-end'>
                                                        <ThreeDotsVertical width={"1.5em"} height={"1.5em"} post-date={entry.dateCreated} className='absolute right-3 top-3 rounded-full z-100 p-1 bg-transparent hover:bg-[var(--tomoi-gray)] pointer-events-auto' onClick={(e) => {e.stopPropagation(); openPopover(e)}}></ThreeDotsVertical>
                                                        <div className='absolute text-md font-bold z-50 select-none pointer-events-none right-2'>#{entry.postNumber}</div>
                                                        <div className='absolute top-3'
                                                            dangerouslySetInnerHTML={{
                                                                __html: generateHTML(JSON.parse(entry.content), [StarterKit, TextStyleKit])
                                                            }}>
                                                        </div>
                                                        <div className='absolute inset-0 rounded-xl bg-linear-to-b from-1% from-transparent via-[var(--tomoi-white)] via-40% to-[var(--tomoi-white)] to-70% z-10'></div>
                                                        <div className="flex flex-col z-10">
                                                            <div className='font-bold text-2xl leading-none'>{entry.title}</div>
                                                            <div>{dayjs(entry.dateCreated).format('MMMM DD, YYYY')}</div>
                                                        </div>
                                                        <div className='flex flex-col gap-1 w-full z-10'>
                                                            <div className='text-sm px-4 rounded-xl w-fit'
                                                            style={{
                                                                'backgroundColor' : (feelingMap[entry.feeling])
                                                            }}>{entry.feeling}</div>
                                                            <div className='w-full flex items-center justify-between'>
                                                                <div className='flex gap-1 items-center'>
                                                                    {
                                                                        entry.tags?.slice(0,3).map((tag, index) => {
                                                                            if (tag)
                                                                                return <div key={index} className='text-sm px-2 border-1 border-dashed border-[var(--tomoi-gray-d)] bg-[var(--tomoi-gray-l)] w-fit'>{tag}</div>
                                                                        })
                                                                    }
                                                                    {
                                                                        entry.tags?.length > 3 && <div className='text-xs bg-[var(--tomoi-gray-l)] rounded-full px-2 py-1'>+{entry.tags.length - 3}</div>
                                                                    }
                                                                </div>
                                                                {
                                                                    entry.isFavorite ?
                                                                    <div post-date={entry.dateCreated} onMouseEnter={onFavoriteHover} onMouseLeave={onFavoriteLeave} onClick={(e) => {e.stopPropagation(); onHandleFavorite(e, entry.postID)}} className='z-100 pointer-events-auto option overflow-visible hover:font-bold flex items-center justify-between overflow-hidden'>
                                                                        <StarFill className='favorite size-[1.5em] text-[var(--tomoi-yellow)] border-dashed'></StarFill>
                                                                    </div> 
                                                                    :
                                                                    <div post-date={entry.dateCreated} onMouseEnter={onFavoriteHover} onMouseLeave={onFavoriteLeave} onClick={(e) => {e.stopPropagation(); onHandleFavorite(e, entry.postID)}} className='z-100 pointer-events-auto option overflow-visible hover:font-bold flex items-center justify-between overflow-hidden'>
                                                                        <Star className='favorite size-[1.5em] text-[var(--tomoi-yellow)] border-dashed'></Star>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                        })
                                    }
                                </div>
                            </div>
                        }
                        {
                            view === 'calendar' &&
                            <div className='flex justify-center items-start z-2 w-[90%] gap-4'>
                                <div className='bg-[var(--tomoi-gray)] p-3 rounded-xl shadow-md/20 w-[35%]'>
                                    <TomoiCalendar></TomoiCalendar>
                                </div>
                                <div className='relative bg-[var(--tomoi-white)] p-3 rounded-xl shadow-md/20 flex flex-col w-[65%] h-[70vh] items-center justify-center gap-2 hover:shadow-md/40'>
                                    {loading && 
                                    <div className='loading absolute rounded-xl inset-0 items-center justify-center flex bg-[var(--tomoi-yellow-l)]/50 z-100 text-2xl font-extrabold'>
                                        <LoadingComponent/>
                                    </div>}
                                    { hasEntry ?
                                        <div className='w-full h-full rounded-xl'>
                                            <ThreeDotsVertical width={"1.5em"} height={"1.5em"} className='absolute right-8 top-10 rounded-full z-100 p-1 bg-transparent hover:bg-[var(--tomoi-gray)] pointer-events-auto' onClick={(e) => openPopover(e)}></ThreeDotsVertical>
                                            <div className='bg-[var(--tomoi-white)] h-full w-full rounded-xl flex flex-col overflow-hidden' onClick={() => {setIsJEditorOpen(true); setMode("edit")}}>
                                                
                                                <EditorContent className='prose max-w-none w-full h-[40vh] p-3' editor={editor} />
                                                <div className='absolute inset-0 rounded-xl h-full bg-linear-to-b from-10% from-transparent via-[var(--tomoi-white)] via-60% to-[var(--tomoi-white)] to-50% z-10'></div>
                                                <div className='z-11 flex flex-col w-full bottom-0 p-3 gap-4'>
                                                    <div>
                                                        <div className='flex'>
                                                            <div className='text-4xl font-bold w-[70%]'>{selectedEntry?.title}</div>
                                                        </div>
                                                        <div className='text-xl'>{dayjs(selectedEntry?.dateCreated).format('MMMM DD, YYYY')}</div>
                                                    </div>
                                                    
                                                    <div className='text-xl px-4 rounded-xl w-fit shadow-sm/30'
                                                    style={{
                                                        'backgroundColor' : (feelingMap[selectedEntry?.feeling])
                                                    }}>{selectedEntry?.feeling}</div>
                                                    <div className='w-full flex items-center justify-between'>
                                                        <div className='flex gap-2 items-center'>
                                                            {
                                                                selectedEntry?.tags?.slice(0,5).map((tag, index) => {
                                                                    if (tag)
                                                                        return <div key={index} className='text-lg px-2 border-1 border-dashed border-[var(--tomoi-gray-d)] bg-[var(--tomoi-gray-l)] w-fit'>{tag}</div>
                                                                })
                                                            }
                                                            {
                                                                selectedEntry?.tags?.length > 5 && <div className='bg-[var(--tomoi-gray-l)] rounded-full px-2 py-1'>+{selectedEntry.tags.length - 5}</div>
                                                            }
                                                        </div>
                                                        
                                                        <div className='absolute text-2xl font-bold right-3 z-101 select-none pointer-events-none'>#{selectedEntry?.postNumber}</div>
                                                        {
                                                            selectedEntry?.isFavorite ?
                                                            <div onMouseEnter={onFavoriteHover} onMouseLeave={onFavoriteLeave} onClick={(e) => {e.stopPropagation(); onHandleFavorite(e, selectedEntry.postID)}} className='z-100 pointer-events-auto option overflow-visible hover:font-bold flex items-center justify-between overflow-hidden'>
                                                                <StarFill className='favorite size-[2em] text-[var(--tomoi-yellow)] border-dashed'></StarFill>
                                                            </div> 
                                                            :
                                                            <div onMouseEnter={onFavoriteHover} onMouseLeave={onFavoriteLeave} onClick={(e) => {e.stopPropagation(); onHandleFavorite(e, selectedEntry.postID)}} className='z-100 pointer-events-auto option overflow-visible hover:font-bold flex items-center justify-between overflow-hidden'>
                                                                <Star className='favorite size-[2em] text-[var(--tomoi-yellow)] border-dashed'></Star>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>  
                                        :
                                        <div className='bg-white rounded-xl h-screen w-full items-center justify-center flex flex-col gap-5 z-10'>
                                            <EmojiFrown width={'9em'} height={'9em'} className='text-[var(--tomoi-gray)]'></EmojiFrown>
                                            <div className='text-lg text-[var(--tomoi-gray-d)]'>No entry yet.</div>
                                            <button className='flex flex-row gap-3 items-center justify-center bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow-d)] rounded-full px-8 py-2 font-bold shadow-sm/30 outline-2 outline-dashed' type="button"
                                            onClick={() => {setIsJEditorOpen(true); setMode("new"); closePopover()}}>
                                                <PencilFill width={'1em'} height={'1em'}></PencilFill>
                                                Start writing!
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                    <div className='inset-text-shadow-alt-2 fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem] select-none'>Journal</div>
                </div>
            </div>
            

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={closePopover}
                disableScrollLock
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                transformOrigin={{
                vertical: 'center',
                horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: 'var(--tomoi-white)',
                            border: '1px dashed black',
                            borderRadius: '8px',
                            mt: -1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)"
                        },
                    },
                }}
            >
                <div className='flex w-[12vw] flex-col divide-y-1 divide-dashed'>
                    <div onMouseEnter={onButtonHover} onMouseLeave={onButtonLeave} className='option px-4 py-2 hover:font-bold flex items-center justify-between overflow-hidden'>
                        Transfer Entry
                        <ArrowLeftRight className='icon'></ArrowLeftRight>
                    </div>
                    <div onMouseEnter={onButtonHover} onMouseLeave={onButtonLeave} onClick={() => {onHandleDelete(); closePopover()}} className='option px-4 py-2 text-[var(--tomoi-red)] hover:font-bold flex items-center justify-between overflow-hidden'>
                        Delete
                        <Trash className='icon'></Trash>
                    </div>
                </div>
            </Popover>

            <EntryEditor isOpen={isJEditorOpen} onClose={() => {setIsJEditorOpen(false)}} mode={mode}></EntryEditor>
        </>
    )
}

export default Journal