import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export const lightTheme = {
  bg: '#f7f7f4',
  bg2: '#ffffff',
  bg3: '#efefea',
  text: '#121214',
  text2: '#55585f',
  text3: '#8b8f97',
  icon: '#5f6670',
  border: '#e8e8e2',
  tint: '#2563eb',
  card: '#ffffff',
};

export const darkTheme = {
  bg: '#0b0c0f',
  bg2: '#14161b',
  bg3: '#1c1f26',
  text: '#f5f7fb',
  text2: '#a5adba',
  text3: '#7a8392',
  icon: '#a7b0bc',
  border: '#242935',
  tint: '#60a5fa',
  card: '#13151a',
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