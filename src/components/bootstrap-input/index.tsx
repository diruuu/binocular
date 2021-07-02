import React, { ChangeEventHandler } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FormControl, InputLabel } from '@material-ui/core';
import BootstrapInputBase from './base';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: '100%',
    },
    errorMessage: {
      fontSize: 13,
      marginTop: 5,
      color: theme.palette.primary.main,
    },
    inputForm: {
      fontSize: 16,
    },
  })
);

interface IBootstrapInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: string;
  errorMessage?: string;
  inputRef?: React.Ref<unknown>;
}

function BootstrapInput({
  label,
  placeholder,
  value,
  onChange,
  type,
  errorMessage,
  inputRef,
}: IBootstrapInputProps) {
  const classes = useStyles();
  return (
    <FormControl className={classes.margin}>
      <InputLabel
        shrink
        htmlFor="bootstrap-input"
        className={classes.inputForm}
      >
        {label}
      </InputLabel>
      <BootstrapInputBase
        placeholder={placeholder}
        value={value}
        fullWidth
        onChange={onChange}
        type={type}
        inputRef={inputRef}
      />
      {errorMessage && (
        <div className={classes.errorMessage}>{errorMessage}</div>
      )}
    </FormControl>
  );
}

export default BootstrapInput;
