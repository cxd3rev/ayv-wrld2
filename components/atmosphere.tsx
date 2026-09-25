export function Atmosphere({ children }: { children: React.ReactNode }) {
  return (
    <div className="atmosphere relative min-h-screen overflow-x-clip">
      {children}
    </div>
  );
}
