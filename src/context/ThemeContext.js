import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export const lightTheme = {
  bg: '#f6f6f3',
  bg2: '#fbfbf8',
  bg3: '#efefe9',
  text: '#17181b',
  text2: '#5f636c',
  text3: '#8e939c',
  icon: '#676d78',
  border: '#e6e6df',
  tint: '#2563eb',
  card: '#f9f9f6',
};

export const darkTheme = {
  bg: '#0b0c0f',
  bg2: '#13161c',
  bg3: '#1a1e27',
  text: '#e9edf5',
  text2: '#a1a9b6',
  text3: '#778091',
  icon: '#9fa8b8',
  border: '#232937',
  tint: '#60a5fa',
  card: '#12151c',
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

    let unsubscribeDoc = null;

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (!user) {
        setIsDark(false);
        return;
      }

      // Listen to Firestore for dark mode preference
      const ref = doc(db, 'user_profiles', user.uid);
      unsubscribeDoc = onSnapshot(ref, snap => {
        setIsDark(snap.exists() ? snap.data().darkMode || false : false);
      });
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