/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import installExtension, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import electronLocalshortcut from 'electron-localshortcut';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import logger from './utils/logger';

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.disableHardwareAcceleration();

if (process.platform === 'win32') {
  app.setAppUserModelId(process.execPath);
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
    if (
      process.env.RELEASE_TAG_NAME &&
      process.env.RELEASE_TAG_NAME !== '' &&
      process.env.RELEASE_TAG_NAME !== 'latest'
    ) {
      autoUpdater.channel = process.env.RELEASE_TAG_NAME;
    }
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')({
    showDevTools: false,
  });
}

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtension(REDUX_DEVTOOLS, {
      loadExtensionOptions: { allowFileAccess: true },
      forceDownload: false,
    });
    await installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: { allowFileAccess: true },
      forceDownload: false,
    });
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 700,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#131722',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    hasShadow: false,
    darkTheme: true,
    frame: false,
  });

  if (process.platform === 'darwin') {
    electronLocalshortcut.register(mainWindow, 'Command+Q', () => {
      app.quit();
    });
  }

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  ipcMain.handle('app-version', () => {
    return { version: app.getVersion() };
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      // if (process.platform !== 'darwin') {
      //   mainWindow.maximize();
      // }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(logger);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update_available');
});

autoUpdater.on(
  'update-downloaded',
  (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    mainWindow?.webContents.send(
      'update_downloaded',
      event,
      releaseNotes,
      releaseName,
      releaseDate,
      updateURL
    );
  }
);

autoUpdater.on('download-progress', (...args) => {
  mainWindow?.webContents.send('download_progress', ...args);
});
