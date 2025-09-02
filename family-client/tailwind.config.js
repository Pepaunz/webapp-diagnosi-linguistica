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
  plugins: [
    // Plugin personalizzato per utilità di accessibilità
    function({ addUtilities, addComponents, theme }) {
      // Utilità per screen reader
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: 'inherit',
          margin: 'inherit',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
      });

      // Componenti per accessibilità
      addComponents({
        '.skip-link': {
          position: 'absolute',
          top: '-40px',
          left: '6px',
          backgroundColor: theme('colors.family.text-primary'),
          color: 'white',
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          textDecoration: 'none',
          borderRadius: theme('borderRadius.mobile-sm'),
          fontSize: theme('fontSize.mobile-sm[0]'),
          fontWeight: '500',
          transition: 'top 0.2s ease',
          zIndex: theme('zIndex.skip-link'),
          boxShadow: theme('boxShadow.mobile-md'),
          
          '&:focus': {
            top: '6px',
          }
        },
        
        '.focus-ring': {
          '&:focus-visible': {
            outline: `3px solid ${theme('colors.family.input-focus')}`,
            outlineOffset: '2px',
            borderRadius: theme('borderRadius.DEFAULT'),
          }
        },
        
        '.focus-ring-error': {
          '&:focus-visible': {
            outline: `3px solid ${theme('colors.family.error')}`,
            outlineOffset: '2px',
            boxShadow: theme('boxShadow.focus-error'),
          }
        },

        '.touch-target': {
          minHeight: theme('spacing.touch-sm'),
          minWidth: theme('spacing.touch-sm'),
          
          '@media (max-width: 768px)': {
            minHeight: theme('spacing.touch-md'),
            minWidth: theme('spacing.touch-md'),
          }
        },

        '.error-input': {
          borderColor: `${theme('colors.family.error')} !important`,
          borderWidth: '2px !important',
          backgroundColor: `${theme('colors.family.error-bg')} !important`,
          boxShadow: `0 0 0 3px rgba(229, 62, 62, 0.1) !important`,
          
          '&:focus': {
            outline: `3px solid ${theme('colors.family.error')} !important`,
            outlineOffset: '2px',
            boxShadow: '0 0 0 6px rgba(229, 62, 62, 0.15) !important',
          }
        },

        '.announcement-banner': {
          position: 'fixed',
          bottom: theme('spacing.4'),
          left: theme('spacing.4'),
          right: theme('spacing.4'),
          backgroundColor: theme('colors.family.text-primary'),
          color: 'white',
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.mobile-md'),
          boxShadow: theme('boxShadow.mobile-lg'),
          transform: 'translateY(100%)',
          transition: 'transform 0.3s ease',
          zIndex: theme('zIndex.announcement'),
          
          '&.show': {
            transform: 'translateY(0)',
          },
          
          '&.error': {
            backgroundColor: theme('colors.family.error'),
          },
          
          '&.success': {
            backgroundColor: '#38A169',
          }
        }
      });

      // Utilità responsive per accessibilità
      addUtilities({
        '@media (prefers-contrast: high)': {
          '.text-family-text-body': {
            color: '#1A202C !important',
          },
          '.text-family-text-muted': {
            color: '#2D3748 !important',
          },
          '.border-family-input-border': {
            borderColor: '#2D3748 !important',
            borderWidth: '2px !important',
          },
        },
        
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
          'html': {
            scrollBehavior: 'auto !important',
          },
        },

        // Utilità per zoom e ridimensionamento
        '@media (max-width: 768px)': {
          '.max-w-sm': {
            maxWidth: 'min(24rem, 90vw)',
          },
          '.touch-spacing > * + *': {
            marginTop: theme('spacing.2'),
          }
        }
      });
    }
  ],
}

// ESEMPIO DI COME CONVERTIRE VALORI FIGMA:
// 
// Figma dice "24px" → Tailwind = 24/16 = 1.5rem → spacing['6'] o custom '1.5rem'
// Figma dice "#3B82F6" → colors.family.primary: '#3B82F6' 
// Figma dice "Font size 18px" → fontSize custom ['1.125rem', {...}]