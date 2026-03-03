module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        blue: 'var(--blue)',
        purple: 'var(--purple)',
        orange: 'var(--orange)',
        text: 'var(--text)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
        border: 'var(--border)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'pulse': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
