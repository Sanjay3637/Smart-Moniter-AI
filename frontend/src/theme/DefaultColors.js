import { createTheme } from "@mui/material/styles";
import typography from "./Typography";
import { shadows } from "./Shadows";

const baselightTheme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: '#1A237E',
      light: '#E8EAF6',
      dark: '#0D47A1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF7675',
      light: '#FFECEC',
      dark: '#E15B5A',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00D09C',
      light: '#E6FFF7',
      dark: '#00A37A',
      contrastText: '#ffffff',
    },
    info: {
      main: '#00B2FF',
      light: '#E6F7FF',
      dark: '#0A84C1',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FF6B6B',
      light: '#FFECEC',
      dark: '#E35252',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F4C430',
      light: '#FFF6DB',
      dark: '#C79F18',
      contrastText: '#2A3547',
    },
    purple: {
      A50: '#F4F1FF',
      A100: '#1A237E',
      A200: '#303F9F',
    },
    grey: {
      100: '#F6F7FB',
      200: '#EEF1F6',
      300: '#E3E8EF',
      400: '#8A94A6',
      500: '#64748B',
      600: '#1F2937',
    },
    text: {
      primary: '#1A237E',
      secondary: '#64748B',
    },
    action: {
      disabledBackground: 'rgba(100,116,139,0.12)',
      hoverOpacity: 0.04,
      hover: '#F6F7FB',
    },
    background: {
      default: '#F8F9FE',
      paper: '#FFFFFF',
    },
    divider: '#E3E8EF',
  },
  typography,
  shadows,
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(1200px 600px at 100% -10%, rgba(26,35,126,0.05), transparent), radial-gradient(800px 400px at -10% 120%, rgba(0,178,255,0.04), transparent)',
          backgroundColor: '#F8F9FE'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid',
          borderColor: 'rgba(26,35,126,0.12)',
          borderRadius: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(26,35,126,0.08)',
            transform: 'translateY(-4px)',
            borderColor: 'rgba(26,35,126,0.25)',
          }
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          fontWeight: 700,
          paddingInline: 20,
          paddingBlock: 12,
          letterSpacing: '0.02em',
        },
        contained: {
          boxShadow: 'none',
          background: 'linear-gradient(45deg, #1A237E 30%, #283593 90%)',
          color: 'white',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26,35,126,0.3)',
            filter: 'brightness(1.1)'
          },
        },
        outlined: {
          borderColor: 'rgba(26,35,126,0.5)',
          '&:hover': {
            backgroundColor: 'rgba(26,35,126,0.04)',
            borderColor: '#1A237E'
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(26,35,126,0.06)'
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(26,35,126,0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(26,35,126,0.2)',
          borderRadius: 0,
          fontWeight: 600,
          backgroundColor: 'rgba(26,35,126,0.03)',
          '&:hover': {
            backgroundColor: 'rgba(26,35,126,0.08)'
          }
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: 'rgba(26,35,126,0.2)',
        },
        root: {
          '& .MuiOutlinedInput-input': {
            paddingTop: 14,
            paddingBottom: 14,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1A237E',
            borderWidth: 2,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(26,35,126,0.4)',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(26,35,126,0.1)',
          borderRadius: 0,
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: 'rgba(26,35,126,0.02)'
          },
        },
        columnHeaders: {
          borderBottom: '2px solid rgba(26,35,126,0.1)',
          backgroundColor: 'rgba(26,35,126,0.03)',
        },
        row: {
          borderBottom: '1px solid rgba(26,35,126,0.05)',
          '&:hover': {
            backgroundColor: 'rgba(26,35,126,0.06)'
          }
        },
        cell: {
          borderRight: '1px solid rgba(26,35,126,0.03)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(26,35,126,0.08)',
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 100%) !important'
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(26,35,126,0.2)',
          border: '2px solid rgba(255,255,255,0.8)'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
          borderRadius: 0,
          backgroundColor: '#1A237E'
        }
      }
    }
  }
},

);

export { baselightTheme };
