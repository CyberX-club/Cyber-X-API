import { useState,createContext,useContext, useEffect } from "react";
import {Auth} from "../Endpoints";

const LoadContext = createContext();

export const LoadProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);

    const {token} = Auth();

    useEffect(() => {
        if (token) {
            setLoading(false);
        }
    }, [token]);

    return (
        <LoadContext.Provider value={{
            loading,
            setLoading
        }}>
            {children}
        </LoadContext.Provider>
    );
}

export const useLoad = () => useContext(LoadContext);