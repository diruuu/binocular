import { makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: 13,
    color: theme.palette.text.secondary,
  },
  bigger: {
    fontSize: 14,
  },
}));

interface ITextProps {
  children: any;
  color?: string;
  className?: string;
  bigger?: boolean;
}

function Text({ children, color, className, bigger }: ITextProps) {
  const classes = useStyles();
  return (
    <span
      className={classNames(classes.root, className, {
        [classes.bigger]: bigger,
      })}
      style={color ? { color } : {}}
    >
      {children}
    </span>
  );
}

export default Text;
