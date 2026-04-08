function StickyNote() {
  return (
    <div className="absolute top-16 left-6 md:left-12 lg:left-20 w-44 md:w-52 rotate-[-2deg] z-10 select-none">
      <div className="bg-[#f9e84d] rounded-md shadow-xl p-4 relative">
        {/* Pin */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 shadow-md" />
        <p className="font-['Caveat',cursive] text-[15px] leading-snug text-gray-800">
          Take notes to keep track of crucial details, and accomplish more tasks
          with ease.
        </p>
      </div>
      {/* Checkbox icon */}
      <div className="absolute -bottom-6 -left-4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
export default StickyNote;