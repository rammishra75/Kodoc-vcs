import AppLogo from "@/components/AppLogo";
import Navbar from "@/components/Navbar";
import StickyNote from "@/components/StickyNotes";





function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #f0f0f0 0%, #e8e8e8 60%, #d8d8d8 100%)",
        backgroundImage: `radial-gradient(ellipse at 50% 40%, #efefef 0%, #e5e5e5 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #aaa 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <StickyNote />
      <AppLogo />
      <div className="relative z-10 text-center mt-16 md:mt-20">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-tight">
          Think, plan, and track
        </h1>
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-400 leading-tight mt-1">
          all in one place
        </h2>
        <p className="mt-6 text-gray-500 text-base md:text-lg max-w-sm mx-auto">
          Efficiently manage your tasks and boost productivity.
        </p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');
        body { font-family: 'DM Sans', 'Inter', system-ui, sans-serif; }
      `}</style>
      <Navbar />
      <Hero />
    </div>
  );
}
