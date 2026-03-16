import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#fafafa',
          muted: '#f5f5f5',
          card: '#ffffff',
        },
        border: '#e5e5e5',
        muted: '#737373',
        primary: '#0a0a0a',
      },
    },
  },
  plugins: [],
}
export default config
