import { useState } from 'react'

const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', price: 89.99, rating: 4.5, reviews: 120, tag: 'Best Seller' },
  { id: 2, name: 'Mechanical Keyboard', price: 129.99, rating: 4.8, reviews: 85, tag: 'New' },
  { id: 3, name: 'USB-C Hub', price: 45.00, rating: 4.2, reviews: 200, tag: 'Sale' },
]

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ opacity: star <= Math.round(rating) ? 1 : 0.3 }}>★</span>
      ))}
      <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '4px' }}>({rating})</span>
    </div>
  )
}

function ProductCard({ product }) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      width: '240px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      position: 'relative',
    }}>
      <span style={{
        position: 'absolute', top: '12px', right: '12px',
        backgroundColor: '#4f46e5', color: '#fff',
        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px',
      }}>
        {product.tag}
      </span>

      <div style={{
        height: '120px', backgroundColor: '#f3f4f6',
        borderRadius: '8px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem',
      }}>
        🛍️
      </div>

      <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>{product.name}</h3>
      <StarRating rating={product.rating} />
      <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 12px' }}>{product.reviews} reviews</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111' }}>${product.price}</span>
        <button
          onClick={handleAdd}
          style={{
            backgroundColor: added ? '#10b981' : '#4f46e5',
            color: '#fff', border: 'none',
            padding: '6px 14px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '0.85rem',
            transition: 'background 0.3s',
          }}
        >
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default function ProductGrid() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '24px' }}>Featured Products</h2>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}