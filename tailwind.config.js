/**
 * @type {import('@types/tailwindcss/tailwind-config.d.ts').TailwindConfig}
 */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#181818',
        'primary-blue': '#00A3FF',
        'primary-light': '#00D1FF',
        'gray-500': '#929292',
      },
    },
  },
  plugins: [],
};
