import classNames from 'classnames';
import React from 'react';
import styles from './styles.scss';

function LogoSVG({
  animate = true,
  width = 90,
}: {
  animate?: boolean;
  width?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 572.03 448.64"
      width={width}
    >
      <defs>
        <clipPath id="clip-path">
          <path
            className="cls-1"
            fill="none"
            d="M0,448.64,264.57,0l83,49h0l71.25,42h0l83,48.95h0l-48.95,83L418.35,281.5,572,372.13l-.44.74-44.68,75.77H415l25-42.45L369.4,364.52l-49.61,84.12H207.9L369.87,174l-71.24-42L111.88,448.64Z"
          />
        </clipPath>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <path
            className="cls-2"
            fill="#f0b90b"
            d="M0,448.64,264.57,0l83,49h0l71.25,42h0l83,48.95h0l-48.95,83L418.35,281.5,572,372.13l-.44.74-44.68,75.77H415l25-42.45L369.4,364.52l-49.61,84.12H207.9L369.87,174l-71.24-42L111.88,448.64Z"
          />
          <g className="cls-3" clipPath="url(#clip-path)">
            <rect
              width="572.03"
              height="448.64"
              className={classNames(styles.logo, {
                [styles.noAnimation]: !animate,
              })}
              fill="#fff"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

export default LogoSVG;
