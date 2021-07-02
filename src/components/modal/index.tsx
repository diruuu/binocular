import React, { useRef, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import { TransitionProps } from '@material-ui/core/transitions';
import { createStyles, IconButton, makeStyles, Slide } from '@material-ui/core';
import CloseButton from '../../svgs/close-button';

interface ModalProps {
  dialogRef: React.MutableRefObject<DialogRef | undefined>;
}

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      boxShadow: 'none',
      backgroundColor: 'var(--sidebar-bg)',
      color: '#858E9D',
      maxHeight: '80%',
    },
    dialogTitle: {
      display: 'flex',
      backgroundColor: 'var(--input-bg-color)',
      color: '#fff',
      padding: '8px 22px',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 15,
      borderBottom: '1px solid #131722',
    },
    dialogTitleButton: {
      color: '#fff',
      padding: 0,
    },
    closeButton: {
      height: 13,
      width: 13,
    },
    paperWidthSm: {
      width: 400,
    },
    dialogContent: {
      padding: '10px 24px',
    },
  })
);

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  // eslint-disable-next-line react/jsx-no-undef
  return <Slide direction="up" ref={ref} {...props} />;
});

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

interface OpenModalOptions {
  onConfirm: (onClose: () => void) => void;
  onCancel?: () => void;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
}

export interface DialogRef {
  openModal: (options: OpenModalOptions) => void;
}

export default function DraggableDialog({ dialogRef }: ModalProps) {
  const [isOpen, setOpen] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [confirmLabel, setConfirmLabel] = useState<string>('');
  const [children, setChildren] = useState<React.ReactNode>(null);
  const onConfirmRef = useRef<(onClose: () => void) => void>();
  const onCancelRef = useRef<() => void>();
  const onCloseRef = useRef<() => void>();
  const classes = useStyles();

  const onClose = () => {
    if (onCloseRef.current) {
      onCloseRef.current();
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!dialogRef) {
      return;
    }
    dialogRef.current = {
      openModal: (options: OpenModalOptions) => {
        setTitle(options.title);
        setConfirmLabel(options.confirmLabel);
        setChildren(options.children);
        setOpen(true);
        onConfirmRef.current = options.onConfirm;
        onCancelRef.current = options.onCancel;
        onCloseRef.current = options.onClose;
      },
    };
  }, [dialogRef]);

  const onConfirm = () => {
    if (onConfirmRef.current) {
      onConfirmRef.current(onClose);
    }
  };

  const onCancel = () => {
    onClose();
    if (onCancelRef.current) {
      onCancelRef.current();
    }
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onClose}
        PaperComponent={PaperComponent}
        disableBackdropClick
        TransitionComponent={Transition}
        scroll="paper"
        classes={{
          paper: classes.paper,
          paperWidthSm: classes.paperWidthSm,
        }}
      >
        <DialogTitle
          disableTypography
          className={classes.dialogTitle}
          style={{ cursor: 'move' }}
          id="draggable-dialog-title"
        >
          <div>{title}</div>
          <IconButton
            aria-label="delete"
            className={classes.dialogTitleButton}
            onClick={onClose}
          >
            <CloseButton className={classes.closeButton} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {children}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={onCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="contained" color="primary">
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
