import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  getStoredUserToken,
  getStoredUserProfile,
  saveUserAuthData,
  clearUserAuthData,
  loginUser,
  registerUser,
  fetchCurrentUser,
  LoginPayload,
  RegisterPayload,
} from "@/services/authApi";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication state on app startup
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = await getStoredUserToken();
        const storedUser = await getStoredUserProfile();

        if (storedToken && storedUser) {
          if (isMounted) {
            setToken(storedToken);
            setUser(storedUser);
          }

          // Verify token validity with /me in background
          try {
            const freshUser = await fetchCurrentUser();
            if (isMounted) {
              setUser(freshUser);
              await saveUserAuthData(storedToken, freshUser);
            }
          } catch {
            // If token has expired or is invalid, clear stale auth data
            if (isMounted) {
              await clearUserAuthData();
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch {
        // Storage access error fallback
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser({ email, password });
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    const data = await registerUser({ name, email, password, phone });
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await clearUserAuthData();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await fetchCurrentUser();
      setUser(freshUser);
      await saveUserAuthData(token, freshUser);
    } catch {
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
