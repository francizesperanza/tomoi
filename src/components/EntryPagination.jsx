import { useEffect, useState } from 'react';
import { useEntry } from './EntryProvider';
import { ChevronDoubleLeft, ChevronDoubleRight, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

function EntryPagination({totalEntries, entriesPerPage}) {

  const [pages, setPages] = useState([]);
  let breakpoint = 10;
  const {currentPage, setCurrentPage} = useEntry();
  
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

  return (
    <>
        <div className='flex gap-2 justify-center items-center w-full'>
            <button>
                <ChevronDoubleLeft onClick={() => setCurrentPage(1)} className='size-[1em] cursor-pointer'></ChevronDoubleLeft>
            </button>
            <button>
                <ChevronLeft onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} className='size-[1em] cursor-pointer'></ChevronLeft>
            </button>
            <div className='flex gap-2 justify-center items-center w-[35vw]'>
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
                <ChevronRight onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} className='size-[1em] cursor-pointer'></ChevronRight>
            </button>

            <button>
                <ChevronDoubleRight onClick={() => setCurrentPage(totalPages)} className='size-[1em] cursor-pointer'></ChevronDoubleRight>
            </button>
        </div>
    </>
  )
}

export default EntryPagination