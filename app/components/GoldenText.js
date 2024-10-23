import React from "react";

const GoldenText = ({ children }) => {
  return <p class="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">{children}</p>;
};

export default GoldenText;
