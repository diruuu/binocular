import React from 'react';
import { SnackbarKey, useSnackbar } from 'notistack';
import { useDispatch, useSelector } from '../../hooks';
import { removeSnackbar, selectSnackbars } from '../../slices/snackbar-slice';

let displayed: SnackbarKey[] = [];

function Snackbar() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const snackbarMessages = useSelector(selectSnackbars);

  const storeDisplayed = (id: SnackbarKey) => {
    displayed = [...displayed, id];
  };

  const removeDisplayed = (id: SnackbarKey) => {
    displayed = [...displayed.filter((key) => id !== key)];
  };

  React.useEffect(() => {
    snackbarMessages.forEach(({ key, message, variant }) => {
      if (displayed.includes(key)) return;
      enqueueSnackbar(message, {
        key,
        variant,
        onExited: (event, myKey) => {
          dispatch(removeSnackbar(myKey));
          removeDisplayed(myKey);
        },
      });

      storeDisplayed(key);
    });
  }, [snackbarMessages, enqueueSnackbar, dispatch]);

  return null;
}

export default Snackbar;
