import Roller from './components/Roller';
import Switch, { leftBg, rightBg } from './components/Switch';
import state, { bubbles } from './state';

export default () => (
  <>
    {'Virtual'.split('').map((char, index, { length }) => (
      <Roller
        style="margin: 2px"
        delay={index + 1}
        onAnimationEnd={
          index === length - 1
            ? () => {
                bubbles.active = true;
                if (state.actualDOM) {
                  leftBg.style.cursor = 'pointer';
                  rightBg.style.cursor = 'not-allowed';
                } else {
                  leftBg.style.cursor = 'not-allowed';
                  rightBg.style.cursor = 'pointer';
                }
              }
            : null
        }
      >
        {char}
      </Roller>
    ))}
    <span style="margin-left: 10px">DOM</span>
    <Switch />
    {bubbles}
  </>
);
