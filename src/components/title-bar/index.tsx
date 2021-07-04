import React, { useEffect, useRef, useState } from 'react';
import { remote } from 'electron';
import Electronbar from 'electronbar';
import './styles/electronbar.global.css';
import './styles/custom.global.css';
import classNames from 'classnames';
import useMenu from './hooks/use-menus';
import { useSelector } from '../../hooks';
import { selectVersion } from '../../slices/settings-slice';
import packageJSON from '../../package.json';
import styles from './styles/styles.scss';

function TitleBar() {
  const electronbarMount = useRef() as React.MutableRefObject<HTMLInputElement>;
  const window: Electron.BrowserWindow = remote.getCurrentWindow();
  const menuTemplate = useMenu(window);
  const version = useSelector(selectVersion);
  const [isDrag, setDrag] = useState(false);

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

  useEffect(() => {
    setTimeout(() => {
      setDrag(true);
    }, 3000);
  }, []);

  return (
    <div
      ref={electronbarMount}
      className={classNames(styles.noDrag, {
        [styles.drag]: isDrag,
      })}
    />
  );
}

export default TitleBar;
