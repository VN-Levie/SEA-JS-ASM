export function ValidateInput(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
        return originalMethod.apply(this, args);
    };
    return descriptor;
}

export function ValidateProperty(target: any, propertyKey: string) {
}