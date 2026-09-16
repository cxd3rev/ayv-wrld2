export function Atmosphere({ children }: { children: React.ReactNode }) {
  return (
    <div className="atmosphere relative min-h-screen overflow-hidden">
      <div className="light-drape absolute inset-y-[-20%] left-[-10%] w-[42%] rotate-6" />
      <div className="light-drape absolute inset-y-[-20%] right-[-15%] w-[38%] -rotate-12 opacity-70" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
