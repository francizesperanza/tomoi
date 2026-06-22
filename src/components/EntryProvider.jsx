import { createContext, useContext, useState, useEffect, useOptimistic } from "react";
import dayjs, {Dayjs} from 'dayjs';
import { useAuth } from './AuthProvider'
import { useQuery } from '@tanstack/react-query';

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
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('calendar');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [filterOption, setFilterOption] = useState('none')
    const [sortOption, setSortOption] = useState('newest')
    const entriesPerPage = 12;

    const { data: entrySet = [], isLoading, error } = useQuery ({
        queryKey: ["entries", user?.userID, view, currentPage, entriesPerPage, sortOption, filterOption, selectedDate?.format("YYYY-MM")],
        queryFn: () => getEntrySet( user, view, selectedDate, currentPage, entriesPerPage, sortOption, filterOption),
        enabled: !!user
    })

    const getEntrySet = async (user, view, selectedDate, currentPage, entriesPerPage, sortOption, filterOption) => {
        if (!user)
            return [];

        const userID = user.userID
        try {
            const API_URL = import.meta.env.VITE_API_URL
            
            let response
            if (view === 'calendar'){
            const startDate = selectedDate.startOf('month').format('YYYY-MM-DD');
            const endDate = selectedDate.add(1, 'month').startOf('month').format('YYYY-MM-DD');
        
                response = await axios.get(`${API_URL}/get-current-month-entries`, {
                    params: {
                        userID,
                        startDate,
                        endDate
                    }
                })
            } else if (view === 'all'){
                response = await axios.get(`${API_URL}/get-all-entries`, {
                    params: {
                        userID,
                        currentPage,
                        entriesPerPage,
                        sortOption,
                        filterOption
                    }
                })
            } else if (view === 'favorites') {
                response = await axios.get(`${API_URL}/get-favorite-entries`, {
                    params: {
                        userID,
                        currentPage,
                        entriesPerPage,
                        sortOption,
                        filterOption
                    }
                })
            }
            
            return response.data;
        } catch (err) {
            if (err.response?.status === 401) {
                setSelectedEntry(null);
            } else {
                console.log(err)
            }
        } finally {
            setLoading(false);
        }

        return []
    }

    const refreshEntries = async () => {
        await Promise.all([
            getEntrySet()
        ]);
    }

    const monthKey = selectedDate.format('YYYY-MM')

    useEffect(() => {
        const startDate = selectedDate.startOf('day').format('YYYY-MM-DD');
        
        const entry = entrySet.find(entry => entry.dateCreated.split('T')[0] === startDate)

        setSelectedEntry(entry ?? null)
    }, [selectedDate, entrySet])

    useEffect(() => {
        getEntrySet();
    }, [view, currentPage, sortOption, filterOption]);

    useEffect(() => {
        if (view === 'calendar')
            getEntrySet();
    }, [monthKey]);

    return (
        <EntryContext.Provider value={{
            selectedDate, 
            setSelectedDate,
            entrySet,
            selectedEntry, 
            setSelectedEntry,
            refreshEntries,
            loading,
            setLoading,
            view,
            setView,
            currentPage,
            setCurrentPage,
            setTotalEntries,
            totalEntries,
            entriesPerPage,
            filterOption,
            setFilterOption,
            sortOption,
            setSortOption
            }}>
            {children}
        </EntryContext.Provider>
    );
}

export default EntryProvider

export const useEntry = () => useContext(EntryContext)