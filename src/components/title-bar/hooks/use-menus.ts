import { ipcRenderer } from 'electron';
import { useSnackbar } from 'notistack';
import { useMemo } from 'react';
import { useDispatch } from '../../../hooks';
import { setModalOpen } from '../../../slices/settings-slice';
import lang from '../../../utils/lang';

function useMenu(currentWindow: Electron.BrowserWindow) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const resetIndicators = () => {
    localStorage.removeItem('chart_data');
    ipcRenderer.send('reset_chart');
    enqueueSnackbar(lang('RESET_INDICATOR_SUCCESS'), {
      variant: 'info',
    });

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const resetAll = () => {
    localStorage.clear();
    ipcRenderer.send('reset_chart');
    enqueueSnackbar(lang('RESET_SUCCESS'), {
      variant: 'info',
    });
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const menus = useMemo(() => {
    const menuTemplate = [
      {
        label: 'Edit',
        submenu: [
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            selector: 'selectAll:',
          },
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              currentWindow.webContents.reload();
            },
          },
        ],
      },
      {
        label: 'Settings',
        click: () => {
          dispatch(setModalOpen(true));
        },
      },
      {
        label: 'Documentation',
        click: () => {
          window.open('https://github.com/diruuu/binocular/wiki');
        },
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Report issues',
            click: () => {
              window.open('https://github.com/diruuu/binocular/issues');
            },
          },
          {
            label: 'Reset indicators',
            click: resetIndicators,
          },
          {
            label: 'Reset all',
            click: resetAll,
          },
        ],
      },
      {
        label: 'Contribute',
        click: () => {
          window.open('https://github.com/diruuu/binocular');
        },
      },
      { type: 'separator' },
      {
        label: 'Donate',
        click: () => {
          window.open(
            'https://github.com/diruuu/binocular/wiki/How-to-Donate-to-This-Project'
          );
        },
      },
    ];

    return menuTemplate;
  }, []);

  return menus;
}

export default useMenu;
