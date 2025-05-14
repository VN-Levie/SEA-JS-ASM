export function LogClassCreation<T extends { new(...args: any[]): {} }>(originalConstructor: T) {
    return class extends originalConstructor {
        constructor(...args: any[]) {
            console.log(`[LogClassCreation] Creating instance of ${originalConstructor.name} with arguments:`, args);
            super(...args);
        }
    };
}


export function LogExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        console.log(`[LogExecution] Calling ${propertyKey} with arguments:`, args);
        const result = await originalMethod.apply(this, args);
        console.log(`[LogExecution] ${propertyKey} returned:`, result);
        return result;
    };
    return descriptor;
}

export function LogMethodIO(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        console.log(`[LogMethodIO] Method ${propertyKey} input:`, args);
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
            console.log(`[LogMethodIO] Method ${propertyKey} is async. Output will be logged when promise resolves.`);
            return result.then(resolvedResult => {
                console.log(`[LogMethodIO] Method ${propertyKey} async output:`, resolvedResult);
                return resolvedResult; // Trả về kết quả đã resolve
            }).catch(error => {
                console.error(`[LogMethodIO] Method ${propertyKey} async error:`, error);
                throw error; // Ném lại lỗi để không nuốt lỗi
            });
        } else {
            console.log(`[LogMethodIO] Method ${propertyKey} sync output:`, result);
            return result;
        }
    };
    return descriptor;
}