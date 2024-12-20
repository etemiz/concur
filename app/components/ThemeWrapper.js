"use client";
import { ThemeContextProvider } from "../contexts/themeContext";
const ThemeWrapper = ({ children }) => {
  return <ThemeContextProvider>{children}</ThemeContextProvider>;
};

export default ThemeWrapper;
