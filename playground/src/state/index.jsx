let actualDOM = false;

export const root = document.getElementById('root');

export const bubbles = <fc-bubbles />;

export default {
  get actualDOM() {
    return actualDOM;
  },
  set actualDOM(value) {
    if (value !== actualDOM) {
      bubbles.active = false;
      if ((actualDOM = value)) {
        Array.from(root.children)
          .slice(0, 7)
          .forEach((roller, index) =>
            [
              () => (roller.style.display = 'none'),
              () => roller.setState({ value: 'A', delay: index }),
              () => roller.setState({ value: 'c', delay: index }),
              () => roller.setState({ delay: index }),
              () => roller.setState({ delay: index }),
              () => roller.setState({ delay: index }),
              () => roller.setState({ delay: index }),
            ][index](),
          );
      } else {
        Array.from(root.children)
          .slice(0, 7)
          .forEach((roller, index) =>
            [
              () => {
                roller.setState({ value: 'V', delay: index + 1 });
                roller.style.display = 'block';
              },
              () => roller.setState({ value: 'i', delay: index + 1 }),
              () => roller.setState({ value: 'r', delay: index + 1 }),
              () => roller.setState({ delay: index + 1 }),
              () => roller.setState({ delay: index + 1 }),
              () => roller.setState({ delay: index + 1 }),
              () => roller.setState({ delay: index + 1 }),
            ][index](),
          );
      }
    }
  },
};
