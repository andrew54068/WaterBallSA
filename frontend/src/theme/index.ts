import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Dark theme colors matching existing design
        dark: {
          900: { value: '#0A0E1A' },  // Darkest background
          800: { value: '#111827' },  // Card background
          700: { value: '#1F2937' },  // Elevated surface
          600: { value: '#374151' },  // Border color
          500: { value: '#4B5563' },  // Disabled state
        },
        accent: {
          yellow: { value: '#F7B32B' },      // Primary yellow
          'yellow-dark': { value: '#D4A024' }, // Darker yellow for hover
        },
      },
      fonts: {
        body: { value: 'system-ui, -apple-system, sans-serif' },
        heading: { value: 'system-ui, -apple-system, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        // Semantic color mappings
        'bg.canvas': { value: '{colors.dark.900}' },
        'bg.surface': { value: '{colors.dark.800}' },
        'bg.elevated': { value: '{colors.dark.700}' },
        'border.default': { value: '{colors.dark.600}' },
        'accent.primary': { value: '{colors.accent.yellow}' },
        'accent.primary.hover': { value: '{colors.accent.yellow-dark}' },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'bg.canvas',
      color: 'white',
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
export default system
