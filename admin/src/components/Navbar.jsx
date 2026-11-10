import React from 'react'
import { FiMenu, FiLogOut } from 'react-icons/fi'
import { assets } from '../assets/assets'

const Navbar = ({ setToken, onMenu }) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} aria-label="Open menu" className="lg:hidden p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100">
          <FiMenu className="w-5 h-5" />
        </button>
        <img className="h-8 w-auto" src={assets.logo} alt="OgeeEra" />
        <span className="hidden sm:inline text-sm font-medium text-slate-500 border-l border-slate-200 pl-3">Admin</span>
      </div>
      <button
        onClick={() => setToken('')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <FiLogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  )
}

export default Navbar
