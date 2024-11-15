import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MyRoutes from './MyRoutes'; // Your routing component
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import { darkTheme } from './theme'; // Import the dark theme
import { CssBaseline } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}> {/* Wrap your routes or app with ThemeProvider */}
      <CssBaseline />
      <MyRoutes /> 
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
