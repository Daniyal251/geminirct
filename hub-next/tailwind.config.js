/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        'accent-glow': 'var(--accent-glow)',
        red: 'var(--red)',
        'red-glow': 'var(--red-glow)',
        orange: 'var(--orange)',
        'orange-glow': 'var(--orange-glow)',
        blue: 'var(--blue)',
        'blue-glow': 'var(--blue-glow)',
        purple: 'var(--purple)',
        'purple-glow': 'var(--purple-glow)',
        green: 'var(--green)',
        text: 'var(--text)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
        border: 'var(--border)',
        border2: 'var(--border2)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
      },
      animation: {
        gradient: 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}
