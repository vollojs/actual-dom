export * from './constants';

export const isEvent = (prop: string) => /^on[A-Z]/.test(prop);

export const getEventName = (prop: string) => prop.slice(2).toLowerCase();
