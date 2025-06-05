import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import { Provider } from 'react-redux'; 
import { BrowserRouter } from 'react-router-dom'; 
import { ThemeProvider, createTheme } from '@mui/material/styles'; 
import { CssBaseline } from '@mui/material'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; 
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 
import { arSA } from 'date-fns/locale'; 
 
import App from './App'; 
import { store } from './store/store'; 
import './index.css'; 
 
const theme = createTheme({ 
  direction: 'rtl', 
  typography: { fontFamily: 'Cairo, sans-serif' }, 
  palette: { 
    primary: { main: '#1976d2' }, 
    secondary: { main: '#dc004e' }, 
    background: { default: '#f5f5f5', paper: '#ffffff' } 
  }, 
  components: { 
    MuiCssBaseline: { 
      styleOverrides: { 
        body: { direction: 'rtl', fontFamily: 'Cairo, sans-serif' } 
      } 
    }, 
    MuiButton: { 
      styleOverrides: { 
        root: { fontFamily: 'Cairo, sans-serif', fontWeight: 500 } 
      } 
    }, 
    MuiTextField: { 
      defaultProps: { variant: 'outlined', size: 'small' } 
    } 
  } 
}); 
 
const root = ReactDOM.createRoot(document.getElementById('root')); 
