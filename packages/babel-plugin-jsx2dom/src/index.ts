import transformJSX from './transformJSX';
import syntaxJSX from '@babel/plugin-syntax-jsx';

export type { Config } from './config';
export default () => ({
  name: 'JSX to DOM',
  inherits: syntaxJSX.default,
  visitor: {
    JSXElement: transformJSX,
    JSXFragment: transformJSX,
  },
});
