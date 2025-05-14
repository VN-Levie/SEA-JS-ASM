export function Singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
    let instance: T;
    const newConstructor: any = function(...args: any[]) {
        if (!instance) {
            instance = new constructor(...args) as T;
        }
        return instance;
    }
    newConstructor.prototype = constructor.prototype;
    return newConstructor;
}