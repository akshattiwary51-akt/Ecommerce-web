import { FiStar } from 'react-icons/fi'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'

export default function StarRating({ rating = 0, count, size = 14 }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return 'full'
    if (rating >= i + 0.5) return 'half'
    return 'empty'
  })

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {stars.map((type, i) => (
        type === 'full' ? <FaStar key={i} size={size} color="#f59e0b" /> :
        type === 'half' ? <FaStarHalfAlt key={i} size={size} color="#f59e0b" /> :
        <FiStar key={i} size={size} color="#d1d5db" />
      ))}
      {count !== undefined && (
        <span style={{ fontSize: 12, color: '#64748b', marginLeft: 3 }}>({count})</span>
      )}
    </span>
  )
}
