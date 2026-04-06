import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export const lightTheme = {
  bg: '#ffffff',
  bg2: '#f8f8f8',
  bg3: '#f0f0f0',
  text: '#111111',
  text2: '#555555',
  text3: '#999999',
  icon: '#687076',
  border: '#e5e5e5',
  tint: '#0a7ea4',
  card: '#f4f4f4',
};

export const darkTheme = {
  bg: '#0f0f11',
  bg2: '#1a1a22',
  bg3: '#252530',
  text: '#f0f0f0',
  text2: '#aaaaaa',
  text3: '#666666',
  icon: '#9BA1A6',
  border: '#2a2a35',
  tint: '#38bdf8',
  card: '#1e1e28',
};

const ThemeContext = createContext({
  isDark: false,
  toggleDark: () => {},
  theme: lightTheme,
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleDark = (value) => setIsDark(value);

  useEffect(() => {
    setIsDark(false);

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        setIsDark(false);
        return;
      }

      // Listen to Firestore for dark mode preference
      const ref = doc(db, 'user_profiles', user.uid);
      const unsubscribeDoc = onSnapshot(ref, snap => {
        setIsDark(snap.exists() ? snap.data().darkMode || false : false);
      });
      return unsubscribeDoc;
    });
    return unsubscribeAuth;
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}