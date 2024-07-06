import { escapeHTML } from '..';
import { Text, Comment } from '@actual-dom/shared';

export interface TemplateConfig {
  encode?: boolean;
  comments?: boolean;
}

export default class Static {
  constructor(
    public type: typeof Text | typeof Comment | string = '',
    public props: [string, string][] = [],
    public children: (Static | string)[] = [],
  ) {}
  toString(config: TemplateConfig = { comments: true }) {
    return toString(this, config);
  }
}

const toString = (template: Static, config: TemplateConfig) => {
  let type = '';
  const noTag = [Text, Comment].includes(template.type as symbol);
  return (
    Object.entries(template).reduce(
      (str, [key, value]) =>
        ({
          type: () =>
            str +
            (value === Text
              ? ''
              : value === Comment
              ? `<!${
                  config.comments ? (template.children[0] ? `--${template.children[0]}--` : '') : ''
                }>`
              : `<${(type = value)}`),
          props: () =>
            value.reduce((propsStr: string, [prop, val]: [string, string]) => {
              let attrValue = escapeHTML(val, true);
              (/[\s<>]/.test(attrValue) || !attrValue) && (attrValue = `"${attrValue}"`);
              return (propsStr += ` ${prop}=${config.encode ? attrValue : `"${val}"`}`);
            }, str),
          children: () =>
            str +
            (noTag
              ? template.type === Text
                ? config.encode
                  ? escapeHTML(value)
                  : value
                : ''
              : `>${value.reduce(
                  (childStr: string, tmpl: Static) => childStr + toString(tmpl, config),
                  '',
                )}`),
          encode: () => str,
        })[key as keyof Static](),
      '',
    ) + (noTag ? '' : `</${type}>`)
  );
};
