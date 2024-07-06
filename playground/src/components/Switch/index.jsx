import state from '../../state';
import css from './css.module.scss';

const left = <li className={css.active} />;
const right = <li />;

export const leftBg = (
  <li
    onClick={() => {
      if (leftBg.style.cursor === 'pointer' && state.actualDOM) {
        state.actualDOM = false;
        left.className = css.active;
        right.className = '';
      }
    }}
  />
);
export const rightBg = (
  <li
    style="cursor: not-allowed"
    onClick={() => {
      if (rightBg.style.cursor === 'pointer' && !state.actualDOM) {
        state.actualDOM = true;
        left.className = '';
        right.className = css.active;
      }
    }}
  />
);

export default () => (
  <div className={css.container}>
    <ul className={css.bg}>
      {leftBg}
      {rightBg}
    </ul>
    <ul className={css.switch}>
      {left}
      {right}
    </ul>
  </div>
);
