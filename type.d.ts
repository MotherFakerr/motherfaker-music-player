// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ANY = any;
type KV = { [k: string]: ANY };

type Class = {
    [k: string]: ANY;
    new (...args: ANY): ANY;
};

declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.md';
