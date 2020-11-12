module.exports = (arr) => {
  const nodes = arr.map((label, id) => ({
    id,
    label,
  }))

  return {
    nodes,
    edges: [],
  }
}
