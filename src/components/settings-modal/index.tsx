import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from '../../hooks';
import { selectModalOpen, setModalOpen } from '../../slices/settings-slice';
import DialogForm, { DialogFormRef } from './dialog-form';
import logger from '../../utils/logger';
import DraggableDialog, { DialogRef } from '../modal';

export default function SettingsModal() {
  const dispatch = useDispatch();
  const ref = useRef<DialogRef>();
  const dialogFormRef = useRef<DialogFormRef>();
  const handleClose = () => {
    dispatch(setModalOpen(false));
  };
  const open = useSelector(selectModalOpen);

  useEffect(() => {
    if (open) {
      ref.current?.openModal({
        title: 'Settings',
        onConfirm: async (onClose) => {
          try {
            if (dialogFormRef.current) {
              await dialogFormRef.current.onSubmit();
              onClose();
            }
          } catch (error) {
            logger(error);
          }
        },
        onClose: handleClose,
        confirmLabel: 'Save Settings',
        children: <DialogForm dialogFormRef={dialogFormRef} />,
      });
    }
  }, [open]);

  return <DraggableDialog dialogRef={ref} />;
}
