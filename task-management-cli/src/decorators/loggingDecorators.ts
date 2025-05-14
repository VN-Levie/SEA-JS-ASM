export function LogClassCreation<T extends { new (...args: any[]): {} }>(originalConstructor: T) {
    return class extends originalConstructor {
        constructor(...args: any[]) {
            super(...args);
        }
    };
}

export function LogExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args: any[]) {
        const result = await originalMethod.apply(this, args);
        return result;
    };
    return descriptor;
}

export function LogMethodIO(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args: any[]) {
        const result = await originalMethod.apply(this, args);
        return result;
    };
    return descriptor;
}