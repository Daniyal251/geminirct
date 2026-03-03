import { Sidebar } from '@/components/layout/Sidebar'
import { AIChat } from '@/components/layout/AIChat'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <main className="ml-64 transition-all duration-300">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
      <AIChat />
    </div>
  )
}
