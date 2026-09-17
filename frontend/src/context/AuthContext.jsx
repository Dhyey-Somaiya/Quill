import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("quill_token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("quill_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        const nextUser = res.data.user;
        setUser(nextUser);
        localStorage.setItem("quill_user", JSON.stringify(nextUser));
      })
      .catch(() => {
        localStorage.removeItem("quill_token");
        localStorage.removeItem("quill_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: nextToken, user: nextUser } = res.data;
    localStorage.setItem("quill_token", nextToken);
    localStorage.setItem("quill_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("quill_token");
    localStorage.removeItem("quill_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
