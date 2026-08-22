export function add(a: number, b: number): number {
    return a + b;
}

export function subtract(a: number, b: number): number {
    return a - b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

export function absolute(a: number): number {
  return Math.abs(a);
}

export function divide(a: number, b: number): number {
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }

    return a / b;
}

export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}
