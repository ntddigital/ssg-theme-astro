/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

export default {
  // safelist: [{ pattern: /./ }],
  content: ['./theme/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './demo/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: { 
			animation: {
			'spin-slow': 'spin 3s linear infinite',
			'spin-medium': 'spin 1.5s linear infinite',
			'spin-fast': 'spin 0.75s linear infinite',
		  },
		  scrollMargin: {
			'50': '50px',
			'100': '100px',
			'150': '150px',
			'200': '200px',
			'250': '250px',
		  },  
		  textShadow: {
			sm: '0 1px 2px var(--tw-shadow-color)',
			middle: '0 2px 4px var(--tw-shadow-color)',
			lg: '0 8px 16px var(--tw-shadow-color)',
			all: '1px 1px 2px var(--tw-shadow-color), -1px -1px 2px var(--tw-shadow-color), 1px -1px 2px var(--tw-shadow-color), -1px 1px 2px var(--tw-shadow-color)',
		  }
		},
  },
  plugins: [
	plugin(function ({ matchUtilities, theme }) {
	  matchUtilities(
		{
		  'text-shadow': (value) => ({
			textShadow: value,
		  }),
		},
		{ values: theme('textShadow') }
	  )
	}),
  ],
}
