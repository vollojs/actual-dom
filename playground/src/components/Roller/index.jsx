import css from './css.module.scss';

const charArr = 'abcdefghijklmnopqrstuvwxyza'.split('');
const upperCharArr = charArr.map(char => char.toUpperCase());
const getCharArr = value => (value.toUpperCase() === value ? upperCharArr : charArr);

export default ({ delay = 1, style, onAnimationEnd }, [value = 's']) => {
  const ul = (
    <ul className={css.animate + ' ' + css.rollee}>
      {getCharArr(value).map((char, index) => (
        <li style={`--index: ${index}`}>{char}</li>
      ))}
    </ul>
  );

  const setAnimate = value => {
    ul.classList.toggle(css.animate, value);
    roller.classList.toggle(css.stopAnimation, !value);
  };
  const createStyle = (val, delay) =>
    `--index: ${getCharArr(val || value).findIndex(char => char === value)}; --delay: ${delay};`;

  const roller = (
    <div
      className={css.roller}
      style={createStyle(value, delay) + style}
      onAnimationEnd={event => {
        setAnimate(false);
        onAnimationEnd?.(event);
      }}
    >
      {ul}
    </div>
  );
  roller.setState = ({ value: val, delay }) => {
    if (val) {
      const isUpper = val.toUpperCase() === val;
      const isUpperCase = value.toUpperCase() === value;
      isUpper !== isUpperCase &&
        Array.from(ul.children).forEach(li => {
          li.innerText = li.innerText[`to${isUpper ? 'Upper' : 'Lower'}Case`]();
        });
      value = val;
    }
    if (val || delay) {
      setAnimate(true);
      roller.setAttribute('style', createStyle(val || value, delay) + style);
    }
  };
  return roller;
};
