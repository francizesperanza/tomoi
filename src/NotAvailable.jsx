import { EmojiFrown } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"

function NotAvailable() {
    const navigate = useNavigate()
  return (
    <>
      <div className='flex flex-col min-h-dvh w-full overflow-y-auto items-center justify-center gap-5'>
        <EmojiFrown width={'8em'} height={'8em'} className="text-[var(--tomoi-gray)]"></EmojiFrown>
        <div className="flex flex-col justify-center items-center">
            <div className="text-6xl">Uh-oh...</div>
            <div>It seems like this page is under construction. Come back later!</div>
        </div>
        <button className='flex flex-row gap-2 items-center w-[20%] justify-center bg-[var(--tomoi-yellow-l)] hover:bg-[var(--tomoi-yellow)] rounded-full py-2 px-4 font-bold shadow-sm/30 border-1 cursor-pointer' type="button"
        onClick={() => navigate(-1)}>
            Go back
        </button>
        <div className='inset-text-shadow fixed left-0 -bottom-12 z-1 leading-none alt-font text-[15rem]'>404</div>
      </div>
    </>
  )
}

export default NotAvailable