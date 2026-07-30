import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

function PrivateRoute({children}) {
    const {user, loading} = useAuth();

    if (loading)
        return (
            <>
                <div>Loading...</div>;
            </>
        )

    return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute
