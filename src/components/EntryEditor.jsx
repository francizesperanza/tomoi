import {useEffect, useState} from 'react'
import Modal from './Modal';

import { useEditor, EditorContent, EditorContext } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import { Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'
import { useMemo } from 'react'
import './EditorText.css'
import { BlockquoteLeft, CodeSlash, ListOl, ListUl, TypeBold, TypeItalic, TypeStrikethrough, TypeUnderline } from 'react-bootstrap-icons';


function EntryEditor({isOpen, onClose}) {

    const editor = useEditor({
        extensions: [StarterKit,
            Placeholder.configure({
                placeholder: 'Write something ...',
            })
        ],
        content: '<p>Hello World!</p>',
        immediatelyRender: false,
        autofocus: true,
        editable: true,
        editorProps: {
            attributes: {
            class: 'focus:outline-none w-full mt-10',
            },
        },
    })

    const providerValue = useMemo(() => ({ editor }), [editor])

    if (!editor) {
        return null
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
                            <div className="bg-[var(--tomoi-gray-l)] rounded-lg border-1 border-dashed text-md flex divide-x-1 divide-dashed items-center justify-center h-[1.75em] items-stretch">
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
                        <BubbleMenu editor={editor}>
                            <div className="bg-[var(--tomoi-gray-l)] rounded-lg border-1 border-dashed text-md flex divide-x-1 divide-dashed items-center justify-center h-[1.75em] items-stretch">
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
        </>
    );
}

export default EntryEditor;