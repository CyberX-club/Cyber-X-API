// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { defaultInfoDialogProps } from '../Dialog';
import LoginHandler from '../LoginHandler';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [infoDialog, setInfoDialog] = useState(
        {...defaultInfoDialogProps,
            handleClose: () => setInfoDialog({...infoDialog, open: false})
        });

    useEffect(() => {
        LoginHandler.setInfoOrToken(setInfoDialog, setToken);
    });

    return (
        <AuthContext.Provider value={{
            token,
            infoDialog,
            setToken,
            setInfoDialog
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);