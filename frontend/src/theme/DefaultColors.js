import { createTheme } from "@mui/material/styles";
import typography from "./Typography";
import { shadows } from "./Shadows";

const baselightTheme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: '#6C5CE7',
      light: '#EDEBFF',
      dark: '#5A4BD6',
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
      A100: '#6C5CE7',
      A200: '#8E79FF',
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
      primary: '#1F2937',
      secondary: '#64748B',
    },
    action: {
      disabledBackground: 'rgba(100,116,139,0.12)',
      hoverOpacity: 0.04,
      hover: '#F6F7FB',
    },
    background: {
      default: '#FAFAFD',
      paper: '#FFFFFF',
    },
    divider: '#E3E8EF',
  },
  typography,
  shadows,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(1200px 600px at 100% -10%, rgba(108,92,231,0.08), transparent), radial-gradient(800px 400px at -10% 120%, rgba(0,178,255,0.06), transparent)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid',
          borderColor: '#E3E8EF',
          borderRadius: 16,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 12px 30px rgba(31,41,55,0.08)',
            transform: 'translateY(-2px)'
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
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          paddingInline: 16,
          paddingBlock: 10,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            filter: 'brightness(0.96)'
          },
        },
        outlined: {
          backgroundColor: 'rgba(100,116,139,0.06)',
          '&:hover': {
            backgroundColor: 'rgba(100,116,139,0.12)'
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(108,92,231,0.08)'
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: '#E3E8EF',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: '#E3E8EF',
          borderRadius: 9999,
          backgroundColor: 'rgba(100,116,139,0.06)',
          '&:hover': {
            backgroundColor: 'rgba(100,116,139,0.12)'
          }
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#E3E8EF',
        },
        root: {
          '& .MuiOutlinedInput-input': {
            paddingTop: 12,
            paddingBottom: 12,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6C5CE7',
            borderWidth: 2,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#C7CFDB',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #E3E8EF',
          borderRadius: 16,
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: 'rgba(100,116,139,0.04)'
          },
        },
        columnHeaders: {
          borderBottom: '1px solid #E3E8EF',
        },
        row: {
          borderBottom: '1px solid #E3E8EF',
          '&:hover': {
            backgroundColor: 'rgba(100,116,139,0.08)'
          }
        },
        cell: {
          borderRight: '1px solid #F0F3F8',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          background: 'linear-gradient(90deg, #6C5CE7 0%, #8E79FF 100%)'
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(108,92,231,0.2)'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
          borderRadius: 4,
        }
      }
    }
  }
},
  
);

export { baselightTheme };
