import { createContext, useContext, useState, useEffect, useOptimistic } from "react";
import dayjs, {Dayjs} from 'dayjs';
import { useAuth } from './AuthProvider'

import isLeapYear from "dayjs/plugin/isLeapYear";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TomoiStepper from './TomoiStepper';
import axios from "axios";


dayjs.extend(isLeapYear);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const EntryContext = createContext();

function EntryProvider ({children}) {
    const {user} = useAuth();
    const [selectedDate, setSelectedDate] = useState(dayjs(Date.now()));
    const [selectedEntry, setSelectedEntry] = useState("");
    const [monthEntries, setMonthEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    // const getSelectedDateEntry2 = async () => {
    //     const startDate = selectedDate.startOf('day').format('YYYY-MM-DD');
    //     const endDate = selectedDate.add(1, 'day').startOf('day').format('YYYY-MM-DD');
    //     const userID = user.userID
        
    //     setLoading(true)

    //     try {
    //         const API_URL = import.meta.env.VITE_API_URL
    //         const response = await axios.get(`${API_URL}/get-selected-date-entry`, {
    //             params: {
    //                 userID,
    //                 startDate,
    //                 endDate
    //             }
    //         })
    //         const data = await response.data;
    //         setSelectedEntry(data)
    //         console.log(data)
    //     } catch (err) {
    //         if (err.response?.status === 401) {
    //             setSelectedEntry(null);
    //         } else {
    //             alert('Error fetching selected date entry');
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    // const getSelectedDateEntry = () => {
    //     const startDate = selectedDate.startOf('day').format('YYYY-MM-DD');
    //     const endDate = selectedDate.add(1, 'day').startOf('day').format('YYYY-MM-DD');
    //     const userID = user.userID
        
    //     const entry = monthEntries.find(entry => entry.dateCreated.split('T')[0] === startDate)

    //     setSelectedEntry(entry ?? null)
    // }

    const getCurrentMonthEntries = async () => {
        if (!user)
            return
        
        setMonthEntries([])
        const startDate = selectedDate.startOf('month').format('YYYY-MM-DD');
        const endDate = selectedDate.add(1, 'month').startOf('month').format('YYYY-MM-DD');
        const userID = user.userID
        
        setLoading(true)
        try {
            const API_URL = import.meta.env.VITE_API_URL
            const response = await axios.get(`${API_URL}/get-current-month-entries`, {
                params: {
                    userID,
                    startDate,
                    endDate
                }
            })
            const data = await response.data;
            setMonthEntries(data)
        } catch (err) {
            if (err.response?.status === 401) {
                setSelectedEntry(null);
            } else {
                alert('Error fetch current month\'s entries');
            }
        } finally {
            setLoading(false);
        }
    }

    const refreshEntries = async () => {
        await Promise.all([
            getCurrentMonthEntries()
        ]);
    }

    const monthKey = selectedDate.format('YYYY-MM')

    useEffect(() => {
        const startDate = selectedDate.startOf('day').format('YYYY-MM-DD');
        
        const entry = monthEntries.find(entry => entry.dateCreated.split('T')[0] === startDate)

        setSelectedEntry(entry ?? null)
    }, [selectedDate, monthEntries])

    useEffect(() => {
        getCurrentMonthEntries();
    }, [monthKey]);

    return (
        <EntryContext.Provider value={{
            selectedDate, 
            setSelectedDate,
            monthEntries,
            setMonthEntries,
            selectedEntry, 
            setSelectedEntry,
            refreshEntries,
            loading,
            setLoading
            }}>
            {children}
        </EntryContext.Provider>
    );
}

export default EntryProvider

export const useEntry = () => useContext(EntryContext)