export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

export const truncate = (str, len = 80) =>
  str?.length > len ? str.slice(0, len) + '…' : str

export const getStatusColor = (status) => {
  const map = {
    pending: 'warning', processing: 'info', shipped: 'info',
    delivered: 'success', cancelled: 'danger', returned: 'danger',
  }
  return map[status?.toLowerCase()] || 'info'
}

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
