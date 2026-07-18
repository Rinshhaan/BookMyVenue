import { useState,useEffect } from 'react'
import { Link,useNavigate,useLocation  } from 'react-router-dom'
import { Menu , X , Building2, LogIn , UserPlus , Home, Search, LayoutDashboard } from 'lucide-react'
import { getUser, logout } from '../../utils/auth.js'
import { useAuth } from '../../context/AuthContext.jsx'


function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()  // ← real auth state

    // Close mobile menu whenever page changes
    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    // We'll replace this with real auth later
    // const user = null


    const navLinks = [
        { label: 'Home', to: '/', icon: <Home size={16} /> },
        { label: 'Browse venues', to: '/browse', icon: <Search size={16} /> },
        { label: 'List your venue', to: '/signup?role=owner', icon: <LayoutDashboard size={16} /> },
      ]

    return(
        <>
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 py-4 flex items-center justify-between">

           {/* Logo */}
           <Link to="/" className="flex items-center text-xl font-bold text-teal-700">  
                <Building2 size={22} className="text-teal-700" />
                <span className="text-lg font-bold text-teal-700">BookMyVenue</span> 
           </Link>

           {/* Desktop links */}
            {/*<div className="hidden md:flex items-center gap-8">
               <Link to="/browse" className="text-sm text-gray-600 hover:text-teal-700 transition-colors">
                  Browse venues
               </Link>
               <Link to="/signup?role=owner" className="text-sm text-gray-600 hover:text-teal-700 transition-colors">
                  List your venue
               </Link>
            </div>
            */}

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
                {navLinks.map(link=>(
                    <Link to={link.to} key={link.to} 
                    className={`text-sm transition-colors ${location.pathname === link.to ? 'text-teal-700 font-medium' : 'text-gray-600 hover:text-teal-700' }`}>
                        {link.label}
                    </Link>
                ))}
            </div>
        
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
            {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Hi, {user?.name?.split(' ')[0] || 'there'}
                  </span>
                  {user?.role === 'owner' && (
                    <button
                      onClick={() => navigate('/owner/dashboard')}
                      className="text-sm text-teal-700 hover:underline"
                    >
                      Dashboard
                    </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => navigate('/admin/dashboard')}
                          className="text-sm text-teal-700 hover:underline"
                        >
                          Admin
                        </button>
                      )}
                      <button
                        onClick={logout}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    // existing login/signup buttons
                    <>
                    <Link to='/login' className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors">
                        <LogIn size={18} />
                          Login
                    </Link>
                    <Link to="/signup" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <UserPlus size={16} />
                          Sign up
                    </Link>
                    </>       
                    )}
            </div>
            
            {/* Mobile hamburger */}
            <button className="md:hidden text-gray-600 hover:text-teal-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
               {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
        </div>
      </nav>

        {/* Mobile drawer — outside nav so it overlays everything */}
        <div
            className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${menuOpen ? 'visible' : 'invisible'}`}
        >
        {/* Dark backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${menuOpen ? 'opacity-40' : 'opacity-0'}`}
          onClick={() => setMenuOpen(false)}
        />
        {/* Drawer panel */}
        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out 
            ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-teal-700" />
              <span className="font-bold text-teal-700">BookMyVenue</span>
            </div>
            <button onClick={() => setMenuOpen(false)}>
              <X size={22} className="text-gray-500" />
            </button>
        </div>
        {/* Drawer links */}
        <div className="flex flex-col px-4 py-6 gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors 
                    ${location.pathname === link.to ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
        </div>

        {/* Drawer auth buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
            {user ? (<button onClick={() => navigate('/my-bookings')}
                className="w-full bg-teal-700 text-white text-sm font-medium py-3 rounded-xl">
                    My Bookings
              </button>) : 
              (<div className="flex flex-col gap-3">
                <Link to="/login"
                  className="w-full border border-teal-700 text-teal-700 text-sm font-medium py-3 rounded-xl text-center">
                    Login
                </Link>
                <Link to="/signup"
                  className="w-full bg-teal-700 text-white text-sm font-medium py-3 rounded-xl text-center">
                    Sign up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}



        {/* Mobile menu 
        {menuOpen && (
            <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4 bg-white">
                <Link to="/browse"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-gray-700 hover:text-teal-700">
                        Browse venues
                </Link>
                <Link to="/signup?role=owner"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-gray-700 hover:text-teal-700">
                        List your venue
                </Link>
                <Link to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-gray-700 hover:text-teal-700">
                        Login
                </Link>
                <Link to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg text-center">
                        Sign up
                </Link>
            </div>
            )}
            */}
      
export default Navbar