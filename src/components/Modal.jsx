import { useState, useRef } from 'react'
import { X, XSquareFill } from 'react-bootstrap-icons';


function Modal({isOpen, onClose, children}) {
    if (!isOpen) return null;

    const mouseDownRef = useRef(false)

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-99"
            onMouseDown={(e) => {
                mouseDownRef.current = e.target === e.currentTarget;
            }}
            onMouseUp={(e) => {
                if (mouseDownRef.current && e.target === e.currentTarget)
                    onClose();
                mouseDownRef.current = false
            }}>
            <div className="bg-white rounded-xl shadow-lg overflow-y-auto max-h-[90vh] pt-15 max-w-[70%] relative z-100"
                onMouseDown={(e) => {
                    mouseDownRef.current = false;
                }}>
                <button
                    className="absolute top-[1.5em] right-[1.5em] md:right-[1.5em] text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <X width={'1.5em'} height={'1.5em'} className='border-dashed border-2 rounded-sm hover:bg-red-400'></X>
                </button>
                {children}
            </div>
        </div>
    );
}

export default Modal