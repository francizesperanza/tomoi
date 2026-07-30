import { useEffect, useState } from 'react';
import { useEntry } from './EntryProvider';
import { CaretLeftSquareFill, CaretRightSquareFill, CaretLeftFill, CaretRightFill } from 'react-bootstrap-icons';

function EntryPagination({totalEntries, entriesPerPage}) {

  const [pages, setPages] = useState([]);
  let breakpoint = 10;
  const {currentPage, setCurrentPage, view} = useEntry();
  
  let startPage = currentPage - Math.floor(breakpoint / 2);
  let endPage = currentPage + Math.floor(breakpoint / 2) - 1;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  if (startPage < 1) {
    startPage = 1;
    endPage = breakpoint;
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = totalPages - breakpoint + 1;
    if (startPage < 1) {
        startPage = 1;
    }
  }

  useEffect(() => {
    let newPages = [];
    for (let i = startPage; i <= endPage; i++) {
        newPages.push(i)
    }
    setPages(newPages);
  }, [currentPage, totalEntries])

  useEffect(() => {
    setCurrentPage(1);
  }, [view])

  return (
    <>
        <div className='flex gap-2 justify-center items-center w-full'>
            <button>
                <CaretLeftSquareFill onClick={() => setCurrentPage(1)} className='text-[var(--tomoi-gray-d)] size-[1.2em] cursor-pointer'></CaretLeftSquareFill>
            </button>
            <button>
                <CaretLeftFill onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} className='text-[var(--tomoi-gray-d)] size-[1.2em] cursor-pointer'></CaretLeftFill>
            </button>
            <div className='flex gap-2 justify-center items-center'>
                {
                    pages.map((page, index) => {
                        return (
                            <button key={index} className={'bg-[var(--tomoi-white)] hover:bg-[var(--tomoi-yellow-l)] px-2 rounded-md' + (page === currentPage ? ' bg-[var(--tomoi-yellow-l)] outline-1 outline-dashed' : '')} onClick={() => setCurrentPage(page)}>
                                {page}
                            </button>
                        )
                    })
                }
                {
                    endPage < totalPages &&
                        <span key={totalPages} className='flex gap-2'>
                            ...
                            <button key={totalPages} className='bg-[var(--tomoi-white)] hover:bg-[var(--tomoi-yellow-l)] px-2 rounded-md' onClick={() => setCurrentPage(totalPages)}>
                                {totalPages}
                            </button>
                        </span>
                }
            </div>
            
            <button>
                <CaretRightFill onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} className='text-[var(--tomoi-gray-d)] size-[1.2em] cursor-pointer'></CaretRightFill>
            </button>

            <button>
                <CaretRightSquareFill onClick={() => setCurrentPage(totalPages)} className='text-[var(--tomoi-gray-d)] size-[1.2em] cursor-pointer'></CaretRightSquareFill>
            </button>
        </div>
    </>
  )
}

export default EntryPagination