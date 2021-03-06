module.exports = {
  purge: {
    preserveHtmlElements: false,
    content: [
    './public/**/*.html',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      textColor: ['visited'],
    },
  },
  plugins: [],
}
