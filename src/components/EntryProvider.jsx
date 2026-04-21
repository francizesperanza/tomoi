import { createContext, useContext, useState, useEffect } from "react";
import dayjs, {Dayjs} from 'dayjs';
import { useAuth } from './AuthProvider'

import isLeapYear from "dayjs/plugin/isLeapYear";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TomoiStepper from './TomoiStepper';


dayjs.extend(isLeapYear);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const EntryContext = createContext();

function EntryProvider ({children}) {
    const {user} = useAuth();
    const [selectedDate, setSelectedDate] = useState(dayjs(Date.now()));
    const [selectedEntry, setSelectedEntry] = useState({});
    const [monthEntries, setMonthEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    const getSelectedDateEntry = async () => {
        const startDate = selectedDate.startOf('day').format('YYYY-MM-DD');
        const endDate = selectedDate.add(1, 'day').startOf('day').format('YYYY-MM-DD');
        try {
            console.log(user.userID)
            const response = await fetch(`http://localhost:8080/get-selected-date-entry?userID=${user.userID}&startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            const data = await response.json();
            if (response.status == 401) {
                setLoading(false);
                return data;
            } else {
                setSelectedEntry(data)
                setLoading(false);
            }
        } catch {
            alert('Error fetch selected date\'s entry');
            setLoading(false);
        }
    }

    const getCurrentMonthEntries = async () => {
        setMonthEntries([])
        const startDate = selectedDate.startOf('month').format('YYYY-MM-DD');
        const endDate = selectedDate.add(1, 'month').startOf('month').format('YYYY-MM-DD');
        try {
            console.log(user.userID)
            const response = await fetch(`http://localhost:8080/get-current-month-entries?userID=${user.userID}&startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            const data = await response.json();
            if (response.status == 401) {
                setLoading(false);
                return data;
            } else {
                setMonthEntries(data)
                setLoading(false);
            }
        } catch {
            alert('Error fetch current month\'s entries');
            setLoading(false);
        }
    }

    const monthKey = selectedDate.format('YYYY-MM')
    const dayKey = selectedDate.format('YYYY-MM-DD')

    useEffect(() => {
        console.log('reloading selected entry')
        getSelectedDateEntry();
    }, [dayKey])

    useEffect(() => {
        console.log('reloading monthly entries')
        getCurrentMonthEntries();
    }, [monthKey]);

    return (
        <EntryContext.Provider value={{selectedDate, setSelectedDate, monthEntries, setMonthEntries, loading}}>
            {!loading && children}
        </EntryContext.Provider>
    );
}

export default EntryProvider

export const useEntry = () => useContext(EntryContext)