import { useState } from 'react'
import { X, XSquareFill } from 'react-bootstrap-icons';


function Modal({isOpen, onClose, children}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-99"
            onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg overflow-y-auto max-h-[90vh] pt-15 max-w-[70%] relative z-100"
                 onClick={(e) => e.stopPropagation()}>
                <button
                    className="absolute top-[1.5em] right-[2em] md:right-[3%] text-gray-500 hover:text-gray-700"
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