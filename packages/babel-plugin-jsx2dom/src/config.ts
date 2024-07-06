export interface Config {
  pureText: boolean;
  whitespace: boolean;
  template:
    | false
    | {
        encode?: boolean;
        comments?: boolean;
      };
}

export default {
  pureText: true,
  whitespace: false,
  template: {
    comments: true,
    encode: true,
  },
};
