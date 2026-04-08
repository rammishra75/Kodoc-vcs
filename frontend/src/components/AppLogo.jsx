function AppLogo() {
  return (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+60px)] z-10">
      <div className="grid grid-cols-2 gap-1.5">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <div className="w-3 h-3 rounded-full bg-gray-800" />
        <div className="w-3 h-3 rounded-full bg-gray-800" />
        <div className="w-3 h-3 rounded-full bg-gray-800" />
      </div>
    </div>
  );
}
export default AppLogo;