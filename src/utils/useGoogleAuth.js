import { useContext } from "react";
import { GoogleAuthContext } from "../components/GoogleAuthProvider";

export function useGoogleAuth() {
    return useContext(GoogleAuthContext);
}