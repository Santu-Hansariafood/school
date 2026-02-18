"use client"
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, Menu, X, GraduationCap, User } from 'lucide-react'

const Sidebar = ({ menuItems, user, onLogout, sidebarOpen, setSidebarOpen }) => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden">
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-0 h-screen bg-white shadow-xl z-40 transition-all duration-300 transform
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        lg:translate-x-0 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0" />
          {sidebarOpen && <span className="text-xl font-bold text-gray-800">SMS</span>}
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {sidebarOpen && user?.role !== "admin" && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              <button
                onClick={() => router.push(`/${user.role}/profile`)}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.path || (item.exact === false && pathname.startsWith(item.path))
              const cls = `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              return (
                <Link key={idx} href={item.path} className={cls}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </>
  )
}

export default Sidebar
