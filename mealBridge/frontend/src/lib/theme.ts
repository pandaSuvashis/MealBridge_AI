'use client';

const THEME_CHANGE_EVENT = 'mealbridge-theme-change';

export function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function getThemeSnapshot() {
  const savedTheme = window.localStorage.getItem('mealbridge-theme');
  return savedTheme
    ? savedTheme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getServerThemeSnapshot() {
  return false;
}

export function setThemePreference(isDarkMode: boolean) {
  window.localStorage.setItem('mealbridge-theme', isDarkMode ? 'dark' : 'light');
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
