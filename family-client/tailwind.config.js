/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily : {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'],
      },
      colors: {
        'family': {
          // Header scuro grigio-blu
          'header': '#4A5568',          // Header background
          'header-text': '#FFFFFF',     // Testo "WebApp" bianco
          
          // Background
          'background': '#F7FCFF',      // Background grigio chiaro app
          
          // Typography  
          'text-primary': '#2D3748',    // "Benvenuto/a" - testo scuro
          'text-body': '#4A5568',       // Testo descrizione
          'text-muted': '#A0AEC0',      // Placeholder input grigio
          'text-label': '#2D3748',      // "Codice Fiscale" label
          
          // Input
          'input-bg': '#FFFFFF',        // Background input bianco
          'input-border': '#E2E8F0',    // Border input grigio chiaro
          'input-focus': '#426c8f',     // Focus border blu (standard)
          
          // Button
          'button': '#2D3748',          // Button "Avanti" scuro
          'button-hover': '#1A202C',    // Button hover più scuro
          'button-text': '#FFFFFF',     // Testo button bianco
          
          // Language selector
          'select-bg': '#FFFFFF',       // Background selector
          'select-border': '#E2E8F0',   // Border selector
          
          // Stati di errore
          'error': '#E53E3E',           // Rosso per errori
          'error-bg': '#FED7D7',        // Background errore chiaro
        }
      },
      
      // ===== MOBILE-FIRST SPACING =====
      spacing: {
        // Touch targets minimi (44-48px Apple/Google guidelines)
        'touch-sm': '2.75rem',    // 44px - minimo assoluto
        'touch-md': '3rem',       // 48px - raccomandato
        'touch-lg': '3.25rem',    // 52px - comodo
        'touch-xl': '3.5rem',     // 56px - molto comodo
        
        // Spacing mobile-optimized 
        'mobile-xs': '0.75rem',   // 12px - tight spacing
        'mobile-sm': '1rem',      // 16px - standard
        'mobile-md': '1.5rem',    // 24px - comfortable
        'mobile-lg': '2rem',      // 32px - generous
        'mobile-xl': '2.5rem',    // 40px - very generous
        
        // Thumb zone (bottom 75% of screen is comfortable)
        'thumb-zone': '25vh',     // Top 25% harder to reach
      },
      
      // ===== MOBILE-FIRST TYPOGRAPHY =====
      fontSize: {
        // Minimi leggibili su mobile
        'mobile-xs': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - helper text minimo
        'mobile-sm': ['1rem', { lineHeight: '1.5rem' }],       // 16px - body text minimo 
        'mobile-md': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - comfortable body
        'mobile-lg': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - subtitle
        'mobile-xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px - title
        'mobile-2xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - big title
        
        // Button text (sempre leggibile)
        'button-mobile': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }], // 16px medium
      },
      
      // ===== MOBILE BORDER RADIUS =====
      borderRadius: {
        'mobile-sm': '0.5rem',    // 8px - tight
        'mobile-md': '0.75rem',   // 12px - standard
        'mobile-lg': '1rem',      // 16px - comfortable
        'mobile-xl': '1.25rem',   // 20px - very round
      },
      
      // ===== MOBILE SHADOWS =====
      boxShadow: {
        'mobile-sm': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'mobile-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'mobile-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      
      // ===== MOBILE BREAKPOINTS =====
      screens: {
        'xs': '375px',    // iPhone SE, small Android
        'sm': '390px',    // iPhone 12/13/14 standard
        'md': '430px',    // iPhone 14 Pro Max
        'lg': '768px',    // iPad mini portrait
        'xl': '1024px',   // iPad portrait
      }
    },
  },
  plugins: [],
}

// ESEMPIO DI COME CONVERTIRE VALORI FIGMA:
// 
// Figma dice "24px" → Tailwind = 24/16 = 1.5rem → spacing['6'] o custom '1.5rem'
// Figma dice "#3B82F6" → colors.family.primary: '#3B82F6' 
// Figma dice "Font size 18px" → fontSize custom ['1.125rem', {...}]