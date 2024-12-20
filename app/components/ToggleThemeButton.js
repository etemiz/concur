import React from "react";
import SunIcon from "../svgs/SunIcon";
import MoonIcon from "../svgs/MoonIcon";
import { ThemeContext } from "../contexts/themeContext";
import { useContext } from "react";
const ToggleThemeButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div onClick={toggleTheme}>
      {theme == "dark" ? <SunIcon /> : <MoonIcon />}
    </div>
  );
};

export default ToggleThemeButton;
