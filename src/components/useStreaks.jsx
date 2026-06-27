import { useQuery } from '@tanstack/react-query';
import axios from 'axios'

export function useStreaks(userID, userCurrentDate) {
  return useQuery({

    queryKey: ['streakStats', userID], 
    
    queryFn: async () => {
        const API_URL = import.meta.env.VITE_API_URL
        
        const response = await axios.get(`${API_URL}/get-streak-stats`, {
            params: {
                userDate: userCurrentDate,
                userID
            }
        })
        return response.data;
    },
    staleTime: 1000 * 60 * 5, 
    enabled: !!userID
  });
}

export default useStreaks;