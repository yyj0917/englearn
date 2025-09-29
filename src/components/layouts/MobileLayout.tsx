export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-area h-screen bg-white">
      {children}
    </div>
  )
}