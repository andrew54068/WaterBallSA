import '@testing-library/jest-dom'

// Polyfill for structuredClone (required by Chakra UI v3)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => {
    if (val === undefined) return undefined
    if (val === null) return null
    return JSON.parse(JSON.stringify(val))
  }
}
