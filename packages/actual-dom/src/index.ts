import { isEvent, getEventName } from '@actual-dom/shared';

export const template = (innerHTML: string) => {
  const template = document.createElement('template');
  template.innerHTML = innerHTML;
  return () => template.content.firstChild!.cloneNode(true);
};

export const createText = (text: string) => document.createTextNode(text);

const ns = 'http://www.w3.org/2000/svg';

export const createElement = (
  type: string,
  props: Record<string, string>,
  children: Element[],
  isSVG?: boolean,
) => {
  const el = isSVG ? document.createElementNS(ns, type) : document.createElement(type);
  isSVG
    ? Object.entries(props).forEach(([key, value]) => setAttr(el, key, value))
    : setProps(el, props);
  el.append(...children);
  return el;
};

export const createComment = (comment = '') => document.createComment(comment);

export const createFragment = (...args: (Element | Element[])[]) =>
  args.reduce((fragment: DocumentFragment, el) => {
    fragment.append(...(Array.isArray(el) ? el : [el]));
    return fragment;
  }, document.createDocumentFragment());

export const on = <T extends Element = Element>(
  el: T,
  event: keyof ElementEventMap,
  listener: (this: Element, e: Event) => any,
) => el.addEventListener(event, listener);

export const off = <T extends Element = Element>(
  el: T,
  event: keyof ElementEventMap,
  listener: (this: Element, e: Event) => any,
) => el.removeEventListener(event, listener);

export const setProp = <T extends Element = Element>(el: T, key: keyof T, value: any) =>
  key in el ? (el[key] = value) : setAttr(el, key as string, value);

export const setProps = <T extends Element = Element>(el: T, props: Record<keyof T, any>) =>
  Object.entries(props).forEach(([key, value]) =>
    isEvent(key)
      ? on(el, getEventName(key) as keyof ElementEventMap, value)
      : setProp(el, key as keyof T, value),
  );

export const setAttr = <T extends Element = Element>(
  el: T,
  propName: string,
  attr: string,
  isSVG?: boolean,
) => (isSVG ? el.setAttributeNS(ns, propName, attr) : el.setAttribute(propName, attr));

export const removeAttr = <T extends Element = Element>(el: T, propName: string) =>
  el.removeAttribute(propName);

export const setStyle = <T extends Element = Element>(el: T, style: string) =>
  setAttr(el, 'style', style);

export const setText = (el: HTMLElement, text: string) => (el.innerText = text);

export const getChild = <T extends Element = Element>(el: T, indexArr: number[]) =>
  indexArr.reduce((el, index) => el.childNodes[index] as T, el);

export const appendChild = <T extends Element = Element>(el: any, target: T) => {
  Array.isArray(el)
    ? el.forEach(item => appendChild(item, target))
    : (el || el === 0) &&
      target.parentNode?.insertBefore(
        el instanceof Element ? el : document.createTextNode(el),
        target,
      );
};

export type Prop = Record<string, any>;
export type FC = <P = Prop, C = Children>(props?: P, children?: C) => Element;
export type Children = (Element | FC)[];
export const createComponent = <P = Prop, C extends Array<Element | FC> = Children>(
  tag: string | FC,
  props = {} as P,
  children = [] as unknown as C,
) =>
  typeof tag === 'function'
    ? tag(props, children)
    : template(
        `<${tag}${
          props
            ? Object.entries(props).reduce((str, [key, value]) => str + ` ${key}="${value}"`, '')
            : ''
        }>${children?.reduce((str, child) => str + child, '') || ''}`,
      )();
