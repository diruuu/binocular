import { Button } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useDispatch } from '../../hooks';
import lang from '../../utils/lang';
import logger from '../../utils/logger';

function IPCWatcher() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    ipcRenderer.on('update_available', () => {
      logger(lang('UPDATE_AVAILABLE'));

      enqueueSnackbar(lang('UPDATE_AVAILABLE'), {
        variant: 'info',
      });
    });

    ipcRenderer.on('update_downloaded', () => {
      logger(lang('UPDATE_DOWNLOADED'));

      enqueueSnackbar(lang('UPDATE_DOWNLOADED'), {
        variant: 'info',
        action: (
          <Button onClick={() => ipcRenderer.send('restart_app')}>
            Restart
          </Button>
        ),
      });
    });

    ipcRenderer.on('download_progress', (_event, ...args) => {
      logger(args, lang('DOWNLOAD_PROGRESS'));
    });
  }, [dispatch]);

  return <div />;
}

export default IPCWatcher;
