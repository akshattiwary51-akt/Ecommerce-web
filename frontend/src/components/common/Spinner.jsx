export function Spinner({ size = 24, center = false }) {
  const el = (
    <div style={{
      width: size, height: size,
      border: `${size > 30 ? 3 : 2.5}px solid #e2e8f0`,
      borderTopColor: '#2563eb',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
  if (center) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>{el}</div>
  )
  return el
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '2rem' }}>
      <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
        ← Prev
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </div>
  )
}
