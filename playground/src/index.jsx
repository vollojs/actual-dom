import App from './App';
import { FcBubbles } from 'fancy-components';
import { root } from './state';
import './index.scss';

new FcBubbles();

root.append(
  <App />,
  <svg width="0" height="0">
    <filter id="blur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0 6" />
    </filter>
    <filter id="gooey">
      <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="5" />
      <feColorMatrix
        in="blur"
        mode="matrix"
        values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"
        result="gooey"
      />
    </filter>
  </svg>,
);
