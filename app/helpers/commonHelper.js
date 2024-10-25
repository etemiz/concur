const getCookieValue = (name) => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
    return match ? match.pop() : '';
  }
};

export { getCookieValue };