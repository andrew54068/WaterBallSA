import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
        404
      </h1>
      <h2 style={{ fontSize: '2rem', color: 'white', margin: 0 }}>
        Page Not Found
      </h2>
      <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: '28rem', margin: 0 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#f59e0b',
        color: '#1a1a1a',
        textDecoration: 'none',
        borderRadius: '0.5rem',
        fontWeight: 'bold',
        fontSize: '1.125rem'
      }}>
        Return Home
      </Link>
    </div>
  )
}
