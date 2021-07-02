import React from 'react';
import MUISelect from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import BootstrapInputBase from '../bootstrap-input/base';

interface SelectProps {
  onChange?: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
  value: unknown;
  options: { value: unknown; label: string }[];
  className?: string;
  inputClassName?: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
    },
    menuItem: {
      fontSize: 14,
    },
  })
);

function Select({
  onChange,
  value,
  options,
  className,
  inputClassName,
}: SelectProps) {
  const classes = useStyles();
  return (
    <MUISelect
      value={value}
      onChange={onChange}
      input={<BootstrapInputBase />}
      inputProps={{
        className: inputClassName,
      }}
      className={classNames(classes.root, className)}
    >
      {options?.map((option) => (
        <MenuItem
          value={option.value as string}
          key={option.value as string}
          className={classes.menuItem}
        >
          {option.label}
        </MenuItem>
      ))}
    </MUISelect>
  );
}

export default Select;
