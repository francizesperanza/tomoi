import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TomoiCalendar from './components/TomoiCalendar';
import { Brush, BrushFill, CheckSquare, EmojiFrown, JournalText, PencilFill, ThreeDotsVertical } from 'react-bootstrap-icons';
import { Popover } from '@mui/material';
import EntryEditor from './components/EntryEditor';
import { useEditor, EditorContent, EditorContext, useEditorState } from '@tiptap/react';
import { TextStyleKit, Color } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder, CharacterCount} from '@tiptap/extensions'
import { get } from 'animejs';


function Journal() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isJEditorOpen, setIsJEditorOpen] = useState(false);
  
    const open = Boolean(anchorEl);
    const id = open ? 'writing-popover' : undefined;

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
        content: '<p>im so lazyyyy</p>',
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
        },
        onUpdate({ editor }) {
            setEditorContent(editor.getJSON());
        }
    })

    return (
        <>
            <Navbar></Navbar>
            <div className='flex flex-col min-h-dvh w-full overflow-y-auto bg-white justify-center items-center'>
                <div className='flex justify-center items-start z-2 w-[90%] gap-4 mt-10 mb-10'>
                    <div className='bg-[var(--tomoi-gray)] p-3 rounded-xl shadow-md/40 w-[35%]'>
                        <TomoiCalendar></TomoiCalendar>
                    </div>
                    <div className='relative bg-[var(--tomoi-white)] p-3 rounded-xl shadow-md/40 flex flex-col w-[65%] items-center justify-center gap-2 hover:shadow-lg/40'>
                        <ThreeDotsVertical width={"1.5em"} height={"1.5em"} className='absolute right-8 top-10 rounded-full z-20 p-1 bg-transparent hover:bg-[var(--tomoi-gray)]'></ThreeDotsVertical>
                        <div className='bg-[var(--tomoi-white)] h-full w-full rounded-xl flex flex-col'>
                            <EditorContent className='prose max-w-none w-full h-[40vh] p-3' editor={editor} />
                            <div className='absolute inset-0 rounded-xl bg-linear-to-b from-transparent to-[var(--tomoi-gray)] z-10'></div>
                            <div className='z-11 flex flex-col w-full bottom-0 p-3 gap-4'>
                                <div>
                                    <div className='flex'>
                                        <div className='text-4xl font-bold w-[70%]'>Title fhsajdfhajd fhjdfh jfhu jn</div>
                                        <div className='text-4xl font-bold w-[30%] text-right'>#1</div>
                                    </div>
                                    <div className='text-xl'>January 01, 2026</div>
                                </div>
                                
                                <div className='text-xl px-4 bg-[var(--tomoi-white)] rounded-xl w-fit shadow-sm/30'>Neutral</div>
                                <div className='w-full flex'>
                                    <div className='text-lg px-2 border-1 border-dashed border-[var(--tomoi-gray-d)] bg-[var(--tomoi-gray-l)] w-fit'>#blessed</div>
                                </div>
                            </div>
                        </div>
                        {   
                            false &&
                            <div className='bg-white rounded-xl h-screen w-full items-center justify-center flex flex-col gap-5 z-100'>
                                <EmojiFrown width={'9em'} height={'9em'} className='text-[var(--tomoi-gray)]'></EmojiFrown>
                                <div className='text-lg text-[var(--tomoi-gray-d)]'>No entry yet.</div>
                                <button className='flex flex-row gap-3 items-center justify-center bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow-d)] rounded-full px-8 py-2 font-bold shadow-sm/30 outline-2 outline-dashed' type="button"
                                onClick={(e) => openPopover(e)}>
                                    <PencilFill width={'1em'} height={'1em'}></PencilFill>
                                    Start writing!
                                </button>
                            </div>
                        }
                    </div>
                </div>
                <div className='inset-text-shadow fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>Journal</div>
            </div>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={closePopover}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
                }}
                transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                        },
                    },
                }}
            >
                <div className='flex-col w-40 alt-font text-xl'>
                    <button type='button' className='flex w-full items-center justify-between gap-2 py-2 px-6 hover:bg-[var(--tomoi-gray-l)] border-b-2 border-dashed cursor-pointer' onClick={() => {setIsJEditorOpen(true); closePopover()}}>
                        <JournalText></JournalText>
                        Entry
                    </button>
                    <button type='button' className='flex w-full items-center justify-between gap-2 py-2 px-6 hover:bg-[var(--tomoi-gray-l)] border-b-2 border-dashed cursor-pointer' onClick={() => {closePopover()}}>
                        <CheckSquare></CheckSquare>
                        List
                    </button>
                    <button type='button' className='flex w-full items-center justify-between gap-2 py-2 px-6 hover:bg-[var(--tomoi-gray-l)] cursor-pointer' onClick={() => {closePopover()}}>
                        <Brush></Brush>
                        Doodle
                    </button>
                </div>
            </Popover>

            <EntryEditor isOpen={isJEditorOpen} onClose={() => setIsJEditorOpen(false)}></EntryEditor>
        </>
    )
}

export default Journal