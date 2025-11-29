import { createTheme } from "@mui/material/styles";
import typography from "./Typography";
import { shadows } from "./Shadows";

const baselightTheme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: '#5D87FF',
      light: '#ECF2FF',
      dark: '#4570EA',
    },
    secondary: {
      main: '#49BEFF',
      light: '#E8F7FF',
      dark: '#23afdb',
    },
    success: {
      main: '#13DEB9',
      light: '#E6FFFA',
      dark: '#02b3a9',
      contrastText: '#ffffff',
    },
    info: {
      main: '#539BFF',
      light: '#EBF3FE',
      dark: '#1682d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FA896B',
      light: '#FDEDE8',
      dark: '#f3704d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAE1F',
      light: '#FEF5E5',
      dark: '#ae8e59',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#EBF3FE',
      A100: '#6610f2',
      A200: '#557fb9',
    },
    grey: {
      100: '#F2F6FA',
      200: '#EAEFF4',
      300: '#DFE5EF',
      400: '#7C8FAC',
      500: '#5A6A85',
      600: '#2A3547',

    },
    text: {
      primary: '#2A3547',
      secondary: '#5A6A85',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: '#f6f9fc',
    },
    divider: '#5A6A85',
  },
  typography,
  shadows,
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid',
          borderColor: '#5A6A85',
          borderRadius: 10,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
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
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            filter: 'brightness(0.95)'
          },
        },
        outlined: {
          backgroundColor: 'rgba(90,106,133,0.04)',
          '&:hover': {
            backgroundColor: 'rgba(90,106,133,0.08)'
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: '#5A6A85',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: '#5A6A85',
          borderRadius: 9999,
          backgroundColor: 'rgba(90,106,133,0.04)',
          '&:hover': {
            backgroundColor: 'rgba(90,106,133,0.08)'
          }
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#5A6A85',
        },
        root: {
          '& .MuiOutlinedInput-input': {
            paddingTop: 12,
            paddingBottom: 12,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5D87FF',
            borderWidth: 2,
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #5A6A85',
          borderRadius: 10,
          // zebra striping
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: 'rgba(90,106,133,0.03)'
          },
        },
        columnHeaders: {
          borderBottom: '1px solid #5A6A85',
        },
        row: {
          borderBottom: '1px solid #5A6A85',
          '&:hover': {
            backgroundColor: 'rgba(90,106,133,0.06)'
          }
        },
        cell: {
          borderRight: '1px solid #5A6A85',
        },
      },
    },
  }
},
  
);

export { baselightTheme };
