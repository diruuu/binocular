import React, { useEffect, useRef } from 'react';
import { remote } from 'electron';
import Electronbar from 'electronbar';
import './styles/electronbar.global.css';
import './styles/custom.global.css';
import useMenu from './hooks/use-menus';
import { useSelector } from '../../hooks';
import { selectVersion } from '../../slices/settings-slice';
import packageJSON from '../../package.json';

function TitleBar() {
  const electronbarMount = useRef() as React.MutableRefObject<HTMLInputElement>;
  const window: Electron.BrowserWindow = remote.getCurrentWindow();
  const menuTemplate = useMenu(window);
  const version = useSelector(selectVersion);

  useEffect(() => {
    // eslint-disable-next-line no-new
    new Electronbar({
      electronRemote: remote,
      window,
      menu: remote.Menu.buildFromTemplate(menuTemplate as any),
      mountNode: electronbarMount.current,
      title: `${packageJSON.productName} v.${version}`,
      icon: '../assets/icon.ico',
    });
  }, [menuTemplate, version, window]);

  return <div ref={electronbarMount} />;
}

export default TitleBar;
