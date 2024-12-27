const PlusSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="stroke-[#6b7280] dark:stroke-white"
      style={{
        marginTop: "0px",
      }}
    >
      <path
        opacity="0.1"
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        fill="#323232"
      />
      <path
        d="M9 12H15"
        // stroke="#323232"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 9L12 15"
        //stroke="#323232"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        //stroke="#323232"
        stroke-width="2"
      />
    </svg>
  );
};

export default PlusSvg;
