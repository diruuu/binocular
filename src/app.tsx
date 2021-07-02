import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { persistor, store } from './store';
import Home from './pages/home';
import themeCreator from './themes';
import UserAccountManager from './components/user-account-manager';
import UserStreamManager from './components/user-stream-manager';
import WebsocketManager from './components/websocket-manager';
import ConnectingState from './components/websocket-manager/connecting-state';
import IPCWatcher from './components/ipc-watcher';
import InitialSetup from './hoc/initial-setup';
import DialogContext from './contexts/dialog-context';
import TitleBar from './components/title-bar';
import DraggableDialog from './components/modal';
import styles from './app.scss';
import './app.global.css';
import Snackbar from './components/snackbar';

export default function App() {
  const dialogRef = useRef();
  return (
    <Provider store={store}>
      <ThemeProvider theme={themeCreator()}>
        <SnackbarProvider
          classes={{
            root: styles.snackbar,
            variantSuccess: styles.snackbarSuccess,
            variantError: styles.snackbarError,
            variantWarning: styles.snackbarWarning,
          }}
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Snackbar />
          <DialogContext.Provider value={dialogRef}>
            <div className={styles.root}>
              <TitleBar />
              <div className={styles.mainContent}>
                <PersistGate
                  persistor={persistor}
                  loading={<ConnectingState />}
                >
                  <IPCWatcher />
                  <InitialSetup>
                    <WebsocketManager>
                      <Router>
                        <Switch>
                          <Route path="/" component={Home} exact />
                          <Route path="/chart/:symbol" component={Home} />
                        </Switch>
                      </Router>
                      <UserAccountManager />
                      <UserStreamManager />
                    </WebsocketManager>
                  </InitialSetup>
                </PersistGate>
              </div>
              <DraggableDialog dialogRef={dialogRef} />
            </div>
          </DialogContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}
