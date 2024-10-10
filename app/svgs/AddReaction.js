const AddReaction = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.563rem"
      height="1.563rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="stroke-[#6b7280] dark:stroke-white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="miter"
    >
      <path
        d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,16c-5,0-6-5-6-5H18S17,18,12,18Z"
        fill="#6b7280"
        opacity="0.5"
        strokeWidth="0"
      />
      <circle cx="12" cy="12" r="10" />
      <line
        x1="8"
        y1="9"
        x2="8.01"
        y2="9"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="15.99"
        y1="9"
        x2="16"
        y2="9"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M6,13H18s-1,5-6,5S6,13,6,13Z" />
    </svg>
  );
};

export default AddReaction;
