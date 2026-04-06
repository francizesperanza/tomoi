import {useRef, useState} from 'react'
import Modal from './Modal';

import { useEditor, EditorContent, EditorContext, useEditorState } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import { Placeholder} from '@tiptap/extensions'
import { TextStyleKit, Color } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { useMemo } from 'react'
import './EditorText.css'
import { BlockquoteLeft, CaretUpFill, CodeSlash, Eyedropper, ListOl, ListUl, TypeBold, TypeItalic, TypeStrikethrough, TypeUnderline, } from 'react-bootstrap-icons';
import { Popover } from '@mui/material';


function EntryEditor({isOpen, onClose}) {
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    const [highlightColorPickerAnchor, setHighlightColorPickerAnchor] = useState(null);
    const [lastColor, setLastColor] = useState('var(--tomoi-black)');
    const [lastHighlightColor, setLastHighlightColor] = useState('var(--tomoi-white)');

    const color_popover_open = Boolean(colorPickerAnchor);
    const color_popover_id = color_popover_open ? 'color-popover' : undefined;
    const highlight_color_popover_open = Boolean(highlightColorPickerAnchor);
    const highlight_color_popover_id = highlight_color_popover_open ? 'color-highlight-popover' : undefined;

    const editor = useEditor({
        extensions: [
            StarterKit, 
            TextStyleKit,
            Placeholder.configure({
                placeholder: 'Write something ...',
            })
        ],
        content: '',
        immediatelyRender: false,
        autofocus: true,
        editable: true,
        editorProps: {
            attributes: {
            class: 'focus:outline-none w-full mt-10',
            },
        },
        onCreate({ editor }) {
            editor.chain().setColor('var(--tomoi-black)').run()
        },
    })

    const colorMap = [
        {name: 'Black', color: 'var(--tomoi-black)', highlight: 'var(--tomoi-gray-d)'},
        {name: 'White', color: 'var(--tomoi-white)', highlight: 'var(--tomoi-white)'},
        {name: 'Gray', color: 'var(--tomoi-gray)', highlight: 'var(--tomoi-gray-l)'},
        {name: 'Red', color: 'var(--tomoi-red)', highlight: 'var(--tomoi-red-l)'},
        {name: 'Orange', color: 'var(--tomoi-orange)', highlight: 'var(--tomoi-orange-l)'},
        {name: 'Yellow', color: 'var(--tomoi-yellow)', highlight: 'var(--tomoi-yellow-l)'},
        {name: 'Green', color: 'var(--tomoi-green)', highlight: 'var(--tomoi-green-l)'},
        {name: 'Cyan', color: 'var(--tomoi-cyan)', highlight: 'var(--tomoi-cyan-l)'},
        {name: 'Blue', color: 'var(--tomoi-blue)', highlight: 'var(--tomoi-blue-l)'},
        {name: 'Navy', color: 'var(--tomoi-navy)', highlight: 'var(--tomoi-navy-l)'},
        {name: 'Violet', color: 'var(--tomoi-violet)', highlight: 'var(--tomoi-violet-l)'},
        {name: 'Pink', color: 'var(--tomoi-pink)', highlight: 'var(--tomoi-pink-l)'},
        {name: 'Magenta', color: 'var(--tomoi-magenta)', highlight: 'var(--tomoi-magenta-l)'},
    ]

    const providerValue = useMemo(() => ({ editor }), [editor])

    const editorState = useEditorState({
        editor,
        selector: ctx => {
            if (!ctx.editor) {
                return {
                    color: 'var(--tomoi-black)',
                    isPurple: false,
                    isRed: false,
                    isOrange: false,
                    isYellow: false,
                    isBlue: false,
                    isTeal: false,
                    isGreen: false,
                }
            }

            const color = ctx.editor.getAttributes('textStyle').color || 'var(--tomoi-black)'

            return {
                color,
                isBlack: color === 'var(--tomoi-black)',
                isWhite: color === 'var(--tomoi-white)',
                isGray: color === 'var(--tomoi-gray)',
                isMagenta: color === 'var(--tomoi-magenta)',
                isPink: color === 'var(--tomoi-pink)',
                isNavy: color === 'var(--tomoi-navy)',
                isViolet: color === 'var(--tomoi-violet)',
                isRed: color === 'var(--tomoi-red)',
                isOrange: color === 'var(--tomoi-orange)',
                isYellow: color === 'var(--tomoi-yellow)',
                isBlue: color === 'var(--tomoi-blue)',
                isCyan: color === 'var(--tomoi-cyan)',
                isGreen: color === 'var(--tomoi-green)',
            }
        },
    })

    if (!editor) {
        return null
    }

    const openColorPopover = (e) => {
        setColorPickerAnchor(e.currentTarget);
    }

    const openHighlightColorPopover = (e) => {
        setHighlightColorPickerAnchor(e.currentTarget);
    }
    
    const closeColorPopover = () => {
        setColorPickerAnchor(null);
    }

    const closeHighlightColorPopover = () => {
        setHighlightColorPickerAnchor(null);
    }

    const saveSettings = () => {    
        const numTeams = parseInt(document.querySelector('input[type="number"]').value);
        const leadersEnabled = document.querySelector('input[type="checkbox"]').checked;
        const settings = {
            numTeams: numTeams,
            leadersEnabled: leadersEnabled
        };
        localStorage.setItem('settings', JSON.stringify(settings));
        updateSettings(settings);
        onClose();
    }

    const clickOutside = () => {
        onClose();
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={clickOutside}>
                <div className='min-h-[65vh] flex flex-col gap-2 justify-start items-start'>
                    <textarea contentEditable placeholder='Entry Title' className='resize-none outline-none overflow-hidden p-1 border-b-1 border-[var(--tomoi-gray)] text-5xl flex font-bold w-full field-sizing-content'></textarea>
                    <div className='italic text-[var(--tomoi-gray-d)] flex justify-between w-full'>
                        <div>Last edited April 1, 2026 4:09 PM</div>
                        <div>#1</div>
                    </div>
                    <EditorContext.Provider value={providerValue}>
                        <EditorContent className='prose max-w-none w-full' editor={editor} />
                        <FloatingMenu editor={editor}>
                            <div className="bg-white shadow-sm/40 rounded-lg border-1 border-dashed text-md flex divide-x-1 divide-dashed items-center justify-center h-[1.75em] items-stretch">
                                <button
                                onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)] rounded-l-lg font-bold'}
                                >
                                h1
                                </button>
                                <button
                                onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)] font-semibold'}
                                >
                                h2
                                </button>
                                <button
                                onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                h3
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleBulletList('bulletList', 'listItem').run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <ListUl width={'1.5em'} height={'1.5em'}></ListUl>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleOrderedList('orderedList', 'listItem').run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <ListOl width={'1.5em'} height={'1.5em'}></ListOl>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().setCodeBlock().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <CodeSlash width={'1.2em'} height={'1.2em'}></CodeSlash>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().setBlockquote().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <BlockquoteLeft width={'1.2em'} height={'1.2em'}></BlockquoteLeft>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)] rounded-r-lg text-center'}
                                >
                                ———
                                </button>
                            </div>
                        </FloatingMenu>
                        <BubbleMenu editor={editor}
                        tippyOptions={{
                            hideOnClick: false,
                            duration: 300,
                            interactive: true,
                        }}>
                            <div className="bg-white shadow-sm/40 rounded-lg border-1 border-dashed text-md flex divide-x-1 divide-dashed items-center justify-center h-[1.75em] items-stretch">
                                <button
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)] rounded-l-lg font-bold'}
                                >
                                <TypeBold></TypeBold>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)] font-semibold'}
                                >
                                <TypeItalic></TypeItalic>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <TypeUnderline></TypeUnderline>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <TypeStrikethrough></TypeStrikethrough>
                                </button>

                                <div className='flex divide-x-1 divide-[var(--tomoi-gray-d)] divide-dashed items-stretch'>
                                    <button
                                    onClick={(e) => editor.chain().focus().setColor(lastColor).run()}
                                    className={'px-2 hover:bg-[var(--tomoi-gray-d)] items-stretch flex flex-col justify-center leading-[1em]'}
                                    >
                                    A
                                    <div className='min-h-1 min-w-5' style={{
                                        'backgroundColor' : lastColor,
                                    }}></div>
                                    </button>
                                    <button className='px-1 flex items-center justify-center hover:bg-[var(--tomoi-gray-d)]' onClick={(e) => openColorPopover(e)}>
                                        <CaretUpFill width={'.8em'} height={'.8em'}></CaretUpFill>
                                    </button>
                                </div>

                                <div className='flex divide-x-1 divide-[var(--tomoi-gray-d)] divide-dashed items-stretch'>
                                    <button
                                    onClick={(e) => editor.chain().focus().setBackgroundColor(lastHighlightColor).run()}
                                    className={'px-2 hover:bg-[var(--tomoi-gray-d)] items-stretch flex flex-col justify-center leading-[1em]'}
                                    >
                                        <div className='min-h-1 min-w-5' style={{
                                            'backgroundColor' : lastHighlightColor,
                                        }}>A</div>
                                    </button>
                                    <button className='px-1 flex items-center justify-center hover:bg-[var(--tomoi-gray-d)]' onClick={(e) => openHighlightColorPopover(e)}>
                                        <CaretUpFill width={'.8em'} height={'.8em'}></CaretUpFill>
                                    </button>
                                </div>

                                <button
                                onClick={() => editor.chain().focus().toggleBulletList('bulletList', 'listItem').run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <ListUl width={'1.5em'} height={'1.5em'}></ListUl>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleOrderedList('orderedList', 'listItem').run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <ListOl width={'1.5em'} height={'1.5em'}></ListOl>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <CodeSlash width={'1.2em'} height={'1.2em'}></CodeSlash>
                                </button>
                                <button
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                className={'px-2 hover:bg-[var(--tomoi-gray-d)]'}
                                >
                                <BlockquoteLeft width={'1.2em'} height={'1.2em'}></BlockquoteLeft>
                                </button>
                            </div>
                        </BubbleMenu>
                    </EditorContext.Provider>
                </div>
            </Modal>
            <Popover
                id={color_popover_id}
                open={color_popover_open}
                anchorEl={colorPickerAnchor}
                onClose={closeColorPopover}
                elevation={2}
                disableScrollLock
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
                transformOrigin={{
                vertical: 'bottom',
                horizontal: 'top',
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
                        },
                    },
                }}
            >
                <div className='inline-flex flex-row flex-wrap items-center justify-center px-2 py-1 gap-1'>
                    {colorMap.map(({name, color},index)=> (
                        <button
                            key={`text-color-${name}`}
                            onClick={() => {editor.chain().focus().setColor(color).run(); setLastColor(color); closeColorPopover(); editor.chain().focus().run()} }
                            className={`w-5 h-5 cursor-pointer rounded-sm outline-1 outline-dashed hover:outline-2`}
                            style={{ backgroundColor: color }}
                            data-testid={`set${name}`}
                        >
                        </button>
                    ))}
                </div>
            </Popover>

            <Popover
                id={highlight_color_popover_id}
                open={highlight_color_popover_open}
                anchorEl={highlightColorPickerAnchor}
                onClose={closeHighlightColorPopover}
                elevation={2}
                disableScrollLock
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
                transformOrigin={{
                vertical: 'bottom',
                horizontal: 'top',
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
                        },
                    },
                }}
            >
                <div className='inline-flex flex-row flex-wrap items-center justify-center px-2 py-1 gap-1'>
                    {colorMap.map(({name, highlight},index)=> (
                        <button
                            key={`highlight-color-${name}`}
                            onClick={() => {editor.chain().focus().setBackgroundColor(highlight).run(); setLastHighlightColor(highlight); closeHighlightColorPopover(); editor.chain().focus().run()} }
                            className={`w-5 h-5 cursor-pointer rounded-sm outline-1 outline-dashed hover:outline-2`}
                            style={{ backgroundColor: highlight }}
                            data-testid={`set${name}`}
                        >
                        </button>
                    ))}
                </div>
            </Popover>
        </>
    );
}

export default EntryEditor;