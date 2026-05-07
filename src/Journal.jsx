import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TomoiCalendar from './components/TomoiCalendar';
import { EmojiFrown, JournalText, PencilFill, ThreeDotsVertical } from 'react-bootstrap-icons';
import { Popover } from '@mui/material';
import EntryEditor from './components/EntryEditor';
import { useEditor, EditorContent, EditorContext, useEditorState } from '@tiptap/react';
import { TextStyleKit, Color } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder, CharacterCount} from '@tiptap/extensions'
import { get } from 'animejs';
import { useEntry } from './components/EntryProvider';
import LoadingComponent from './components/LoadingComponent';
import dayjs, {Dayjs} from 'dayjs';

import isLeapYear from "dayjs/plugin/isLeapYear";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";


dayjs.extend(isLeapYear);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);


function Journal() {
    const {selectedEntry, loading} = useEntry();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isJEditorOpen, setIsJEditorOpen] = useState(false);
    const [hasEntry, setHasEntry] = useState(false);
    const [mode, setMode] = useState("new");
  
    const open = Boolean(anchorEl);
    const id = open ? 'writing-popover' : undefined;

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
    }
    
    const closePopover = () => {
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
        if (selectedEntry){
            try {
                editor.commands.setContent(JSON.parse(selectedEntry.content))
                setHasEntry(true)
            } catch (err) {
                editor.commands.setContent("empty")
                setHasEntry(false)
            }
        }
    }, [selectedEntry])

    return (
        <>
            <Navbar></Navbar>
            <div className='flex flex-col min-h-dvh w-full overflow-y-auto bg-white justify-center items-center'>
                <div className='flex justify-center items-start z-2 w-[90%] gap-4 mt-10 mb-10'>
                    <div className='bg-[var(--tomoi-gray)] p-3 rounded-xl shadow-md/40 w-[35%]'>
                        <TomoiCalendar></TomoiCalendar>
                    </div>
                    <div className='relative bg-[var(--tomoi-white)] p-3 rounded-xl shadow-md/40 flex flex-col w-[65%] h-[70vh] items-center justify-center gap-2 hover:shadow-lg/40'>
                        <ThreeDotsVertical width={"1.5em"} height={"1.5em"} className='absolute right-8 top-10 rounded-full z-20 p-1 bg-transparent hover:bg-[var(--tomoi-gray)]'></ThreeDotsVertical>
                        {loading && 
                        <div className='loading absolute rounded-xl inset-0 items-center justify-center flex bg-[var(--tomoi-yellow-l)]/50 z-100 text-2xl font-extrabold'>
                            <LoadingComponent/>
                        </div>}
                        { hasEntry ?
                            <div className='bg-[var(--tomoi-white)] h-full w-full rounded-xl flex flex-col overflow-hidden' onClick={() => {setIsJEditorOpen(true); setMode("edit")}}>
                                <EditorContent className='prose max-w-none w-full h-[40vh] p-3' editor={editor} />
                                <div className='absolute inset-0 rounded-xl h-full bg-linear-to-b from-10% from-transparent via-[var(--tomoi-white)] via-60% to-[var(--tomoi-white)] to-50% z-10' onClick={(e) => openPopover(e)}></div>
                                <div className='z-11 flex flex-col w-full bottom-0 p-3 gap-4'>
                                    <div>
                                        <div className='flex'>
                                            <div className='text-4xl font-bold w-[70%]'>{selectedEntry?.title}</div>
                                            <div className='text-4xl font-bold w-[30%] text-right'>#{selectedEntry?.postNumber}</div>
                                        </div>
                                        <div className='text-xl'>{dayjs(selectedEntry?.dateCreated).format('MMMM DD, YYYY')}</div>
                                    </div>
                                    
                                    <div className='text-xl px-4 rounded-xl w-fit shadow-sm/30'
                                    style={{
                                        'backgroundColor' : (feelingMap[selectedEntry?.feeling])
                                    }}>{selectedEntry?.feeling}</div>
                                    <div className='w-full flex gap-2 items-center'>
                                        {
                                            selectedEntry?.tags?.slice(0,5).map((tag, index) => (
                                                <div key={index} className='text-lg px-2 border-1 border-dashed border-[var(--tomoi-gray-d)] bg-[var(--tomoi-gray-l)] w-fit'>{tag}</div>
                                            ))
                                        }
                                        {
                                            selectedEntry?.tags?.length > 5 && <div className='bg-[var(--tomoi-gray-l)] rounded-full px-2 py-1'>+{selectedEntry.tags.length - 5}</div>
                                        }
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
                <div className='inset-text-shadow fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Journal</div>
            </div>

            <EntryEditor isOpen={isJEditorOpen} onClose={() => setIsJEditorOpen(false)} mode={mode}></EntryEditor>
        </>
    )
}

export default Journal