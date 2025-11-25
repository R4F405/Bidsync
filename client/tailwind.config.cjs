/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#13C1AC', // Wallapop Teal
                secondary: '#2D3E50', // Dark Blue/Grey
                background: '#F6F7F9', // Light Grey background
            },
        },
    },
    plugins: [],
}
