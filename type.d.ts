// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ANY = any;
type KV = { [k: string]: ANY };

type Class = {
    [k: string]: ANY;
    new (...args: ANY): ANY;
};
