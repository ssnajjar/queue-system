import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'Portfolio', href: '#' },
  { label: 'Contact', href: '#' },
]

function NavLink({ label, href, active, onClick }) {
  return (
    <a
      href={href}
      onClick={() => onClick(label)}
      style={{
        padding: '8px 16px',
        textDecoration: 'none',
        color: active ? '#fff' : '#ccc',
        backgroundColor: active ? '#4f46e5' : 'transparent',
        borderRadius: '6px',
        fontWeight: active ? '600' : '400',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </a>
  )
}

export default function Navbar() {
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      backgroundColor: '#1e1e2e',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    }}>
      <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>
        🚀 MyApp
      </div>

      {/* desktop links */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.label}
            label={link.label}
            href={link.href}
            active={active === link.label}
            onClick={setActive}
          />
        ))}
      </div>

      {/* cta button */}
      <button style={{
        backgroundColor: '#4f46e5',
        color: '#fff',
        border: 'none',
        padding: '8px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
      }}>
        Get Started
      </button>
    </nav>
  )
}