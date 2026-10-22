const buildPaginationQuery = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1)
  const limit = Math.min(50, parseInt(query.limit) || 12)
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

module.exports = buildPaginationQuery
