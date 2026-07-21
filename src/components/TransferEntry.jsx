import { useState } from 'react'
import { ArrowLeft, CaretLeftFill, CaretRightFill, CaretUpFill, CaretDownFill, Calendar, ArrowLeftRight } from 'react-bootstrap-icons';
import dayjs, {Dayjs} from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";
import TomoiStepper from './TomoiStepper';
import localeData from "dayjs/plugin/localeData";
import Modal from './Modal';
import axios from "axios";
import { useEntry } from './EntryProvider';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
dayjs.extend(localeData);


function TransferEntry({isOpen, onClose, getTransferDate}) {
    const queryClient = useQueryClient();
    const yearSelection = Array.from (
        {length: 31},
        (_, index) => dayjs(Date.now()).year() - index
    )
    const monthSelection = dayjs.months();
    const {entrySet, selectedEntry} = useEntry();
    const [monthStepperValue, setMonthStepperValue] = useState(dayjs(Date.now()).format('MMMM'))
    const [yearStepperValue, setYearStepperValue] = useState(dayjs(Date.now()).year());
    const [dayStepperValue, setDayStepperValue] = useState(dayjs(Date.now()).date());
    const [errorMessage, setErrorMessage] = useState("")
    const daySelection = Array.from (
        {length: dayjs(`${yearStepperValue}-${monthStepperValue}-01`).daysInMonth()},
        (_, index) => index + 1
    )

    const checkTransferDate = async() => {
        const formedDate = dayjs(`${yearStepperValue}-${monthStepperValue}-${dayStepperValue} ${dayjs().format('HH:mm:ss')}`)

        if (formedDate.isAfter(dayjs(new Date()), 'seconds')) {
            setErrorMessage('You can\'t transfer this entry to a future date.')
            return
        }

        if (entrySet.find(entry => dayjs(entry.dateCreated).isSame(formedDate, 'day'))) {
            setErrorMessage('This date already has an entry.')
            return
        }
        setErrorMessage('')
        const dateCreated = dayjs(formedDate).format('YYYY-MM-DD HH:mm:ss')

        try {
            const API_URL = import.meta.env.VITE_API_URL
            const response = await axios.put(`${API_URL}/transfer-entry`, {
                postID: selectedEntry.postID,
                dateCreated: dateCreated
            })

            if (response.status == 200) {
                toast.success(`Entry transfered to ${dateCreated}`)
                queryClient.invalidateQueries({queryKey: ['entries']})
                onClose()
            }
        } catch (err) {
            toast.error(error.response.data.message ?? "Something went wrong.")
        }
    }
    return (
    <>
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col px-8 py-4'>
                <div className='text-center font-bold '>Transfer to which date?</div>
                <div className='grid grid-rows-1 grid-cols-3 min-w-[30vw] px-4 py-6'>
                    <TomoiStepper stepList={monthSelection} onChange={setMonthStepperValue} value={monthStepperValue}></TomoiStepper>
                    <TomoiStepper stepList={daySelection} onChange={setDayStepperValue} value={dayStepperValue}></TomoiStepper>
                    <TomoiStepper stepList={yearSelection} onChange={setYearStepperValue} value={yearStepperValue}></TomoiStepper>
                </div>
                <div className={'text-sm w-full text-center py-2 text-red-500'}>
                    {errorMessage}
                </div>
                <button onClick={() => checkTransferDate()} className='cursor-pointer flex flex-row gap-3 items-center justify-center w-full bg-[var(--tomoi-gray-l)] hover:bg-[var(--tomoi-gray-d)] rounded-full py-2 px-4 font-bold shadow-sm/30 outline-2 outline-dashed' type="button">
                    <ArrowLeftRight></ArrowLeftRight>
                    Transfer Date
                </button>
            </div>
            
        </Modal>
    </>
    ) 
}

export default TransferEntry