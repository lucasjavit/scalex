/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          copilot: {
            bg: {
              primary: '#1e1e1e',     // Copilot primary background
              secondary: '#2d2d30',   // Secondary background
              tertiary: '#3e3e42',    // Tertiary background
              hover: '#2a2d2e',       // Hover state
              surface: '#252526',     // Surfaces
              input: '#3c3c3c',       // Input fields
            },
            text: {
              primary: '#cccccc',     // Primary text
              secondary: '#9d9d9d',   // Secondary text
              tertiary: '#6e6e6e',    // Tertiary text
              inverse: '#1e1e1e',     // Inverse text
              link: '#569cd6',        // Links
            },
            border: {
              default: '#3e3e42',     // Default border
              subtle: '#2d2d30',      // Subtle border
              focus: '#007acc',       // Focus border
              input: '#3c3c3c',       // Input border
            },
            accent: {
              primary: '#007acc',     // Copilot primary blue
              purple: '#c586c0',      // Copilot purple
              blue: '#4fc3f7',        // Light blue
              success: '#4ec9b0',     // Success green
              warning: '#ce9178',     // Warning orange
              error: '#f48771',       // Error red
              highlight: '#264f78',   // Highlight
            }
          }
        },
        borderRadius: {
          'copilot': '8px',
          'copilot-lg': '12px',
          'copilot-xl': '16px',
        },
        boxShadow: {
          'copilot': '0 2px 8px rgba(0, 0, 0, 0.15)',
          'copilot-lg': '0 4px 16px rgba(0, 0, 0, 0.25)',
          'copilot-xl': '0 8px 32px rgba(0, 0, 0, 0.35)',
        },
        backgroundImage: {
          'copilot-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'copilot-gradient-alt': 'linear-gradient(135deg, #0078d4 0%, #0ea5e9 100%)',
        }
      },
    },
    plugins: [],
  }