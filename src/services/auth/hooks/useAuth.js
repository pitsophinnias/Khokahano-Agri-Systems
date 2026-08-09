// ---------------------------------------------------------------------------
// useAuth.js — authentication state for the entire app
// ---------------------------------------------------------------------------
import { useState, useCallback } from "react";
import {
  login as apiLogin,
  registerBuyer as apiRegisterBuyer,
  registerFarmer as apiRegisterFarmer,
  logout as apiLogout,
  getUser,
  getToken,
} from "../../marketplace/api/marketplace.api.js";

export function useAuth() {
  const [user,    setUser]    = useState(() => getUser());
  const [token,   setToken]   = useState(() => getToken());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const isLoggedIn = !!token && !!user;
  const isFarmer   = user?.role === "FARMER";
  const isBuyer    = user?.role === "BUYER";
  const isAdmin    = user?.role === "ADMIN";

  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiLogin(identifier, password);
      setUser(result.user);
      setToken(result.token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerBuyer = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRegisterBuyer(data);
      setUser(result.user);
      setToken(result.token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerFarmer = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRegisterFarmer(data);
      setUser(result.user);
      setToken(result.token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setToken(null);
  }, []);

  return {
    user, token, isLoggedIn, isFarmer, isBuyer, isAdmin,
    loading, error,
    login, logout, registerBuyer, registerFarmer,
  };
}