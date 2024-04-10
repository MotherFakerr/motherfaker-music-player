export const store = {} as KV;

export function initStore(): void {}

export function registerStore(name: string) {
    return (Clazz: Class): void => (store[name] = new Clazz());
}
