import {
  createStyles,
  fade,
  Theme,
  withStyles,
} from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';

const BootstrapInputBase = withStyles((theme: Theme) =>
  createStyles({
    root: {
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      backgroundColor: 'var(--input-bg-color)',
      border: 0,
      width: '100%',
      padding: '9px 12px',
      '&:focus': {
        boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
        borderColor: theme.palette.primary.main,
      },
    },
  })
)(InputBase);

export default BootstrapInputBase;
