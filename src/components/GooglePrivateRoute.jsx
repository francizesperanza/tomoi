import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { useGoogleAuth } from '../utils/useGoogleAuth.js';

function GooglePrivateRoute({children}) {
    const {pendingUser, loading} = useGoogleAuth();

    if (loading)
        return (
            <>
                <div>Loading...</div>;
            </>
        )

    return pendingUser ? children : <Navigate to="/login" />;
}

export default GooglePrivateRoute
