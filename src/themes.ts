import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';

const darkTheme: ThemeOptions = {
  palette: {
    type: 'dark',
    primary: {
      main: '#FCD536',
    },
    secondary: {
      main: '#26a69a',
    },
    background: {
      default: '#15161b',
      paper: '#131722',
    },
    divider: '#3e4b5b',
  },
};

const themeCreator = () => {
  return createMuiTheme({
    typography: {
      fontFamily: 'var(--font-family)',
      fontSize: 14,
    },
    palette: darkTheme.palette,
    overrides: {
      MuiButton: {
        root: {
          fontSize: 14,
          lineHeight: 1.3,
          borderRadius: 3,
          textTransform: 'none',
        },
      },
      MuiBackdrop: {
        root: {
          backgroundColor: 'rgb(101 89 89 / 50%)',
        },
      },
    },
  });
};

export default themeCreator;
