import { createTheme } from '@mui/material';
import '@fontsource/space-mono';

export const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#2196f3', // Blue
      },
      background: {
        default: '#121212', // Near black
        paper: '#1e1e1e',  // Slightly lighter black
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
      }
    },
    typography: {
      fontFamily: '"Space Mono", monospace', // Set Space Mono as the default font
    }
  });
  