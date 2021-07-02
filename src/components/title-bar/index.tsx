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
  const menuTemplate = useMenu();
  const version = useSelector(selectVersion);

  useEffect(() => {
    // eslint-disable-next-line no-new
    new Electronbar({
      electronRemote: remote, // for v1: electron
      window: remote.getCurrentWindow(), // for v1: electron.remote.getCurrentWindow()
      menu: remote.Menu.buildFromTemplate(menuTemplate), // for v1: electron.remote.Menu.buildFromTemplate(menuTemplate)
      mountNode: electronbarMount.current,
      title: `${packageJSON.productName} v.${version}`,
      icon: '../assets/icon.ico',
    });
  }, [menuTemplate, version]);

  return <div ref={electronbarMount} />;
}

export default TitleBar;
