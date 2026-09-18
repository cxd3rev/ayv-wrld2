export function Atmosphere({ children }: { children: React.ReactNode }) {
  return (
    <div className="atmosphere noise-overlay relative min-h-screen overflow-x-clip">
      {children}
    </div>
  );
}
