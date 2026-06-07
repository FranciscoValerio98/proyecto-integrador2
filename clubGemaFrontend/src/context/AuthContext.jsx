import React, { createContext, useContext, useState, useEffect } from 'react';
import { logoutService } from '../services/auth.service';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Inicialización de estado desde Cookies
    const [user, setUser] = useState(() => {
        const savedRole = Cookies.get('user_role');
        const savedName = Cookies.get('user_name');
        const savedLastName = Cookies.get('user_lastname');
        const savedId = Cookies.get('user_id');

        if (savedRole) {
            return {
                rol: savedRole,
                nombres: savedName,
                id: savedId,
                user: { id: savedId, rol: savedRole, nombres: savedName, apellidos: savedLastName }
            };
        }
        return null;
    });

    const [userId, setUserId] = useState(() => Cookies.get('user_id') || null);
    const [loading, setLoading] = useState(true);

    // 2. EFECTO INICIAL (se removió protección multicuentas por localStorage)
    useEffect(() => {
        setLoading(false);
    }, []); // Dependencias vacías

    const login = (userData) => {
        if (!userData) return;
        const normalizedData = userData.user ? userData : { user: userData };
        const finalUser = normalizedData.user || normalizedData;

        setUser(normalizedData);
        setUserId(finalUser.id);
    };

    const updateUserData = (newData) => {
        setUser(prev => {
            if (!prev) return null;
            const updatedUser = {
                ...prev,
                user: { ...(prev.user || prev), ...newData }
            };

            if (newData.nombres) Cookies.set('user_name', newData.nombres, { expires: 1, sameSite: 'strict' });
            if (newData.apellidos) Cookies.set('user_lastname', newData.apellidos, { expires: 1, sameSite: 'strict' });
            if (newData.rol) Cookies.set('user_role', newData.rol, { expires: 1, sameSite: 'strict' });

            return updatedUser;
        });
    };

    const logout = async () => {
        try {
            await logoutService();
        } catch (error) {
            console.error("Error en logout service:", error);
        } finally {
            setUser(null);
            setUserId(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, userId, login, logout, updateUserData, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};