/**
 * calculator.test.js - Тесты для математических функций калькулятора С3-15
 */

// Импорт функций из calculator.js
const calculator = require('../calculator');

// Тесты для базовых арифметических операций
describe('Базовые арифметические операции', () => {
    test('Сложение двух положительных чисел', () => {
        expect(calculator.add(2, 3)).toBe(5);
    });

    test('Сложение положительного и отрицательного числа', () => {
        expect(calculator.add(5, -3)).toBe(2);
    });

    test('Вычитание двух положительных чисел', () => {
        expect(calculator.subtract(5, 3)).toBe(2);
    });

    test('Вычитание, дающее отрицательный результат', () => {
        expect(calculator.subtract(3, 5)).toBe(-2);
    });

    test('Умножение двух положительных чисел', () => {
        expect(calculator.multiply(2, 3)).toBe(6);
    });

    test('Умножение на ноль', () => {
        expect(calculator.multiply(5, 0)).toBe(0);
    });

    test('Деление двух положительных чисел', () => {
        expect(calculator.divide(6, 3)).toBe(2);
    });

    test('Деление на ноль должно выбрасывать ошибку', () => {
        expect(() => calculator.divide(5, 0)).toThrow('Деление на ноль');
    });
});

// Тесты для тригонометрических функций
describe('Тригонометрические функции', () => {
    test('Синус 0', () => {
        expect(calculator.sin(0)).toBeCloseTo(0);
    });

    test('Синус π/2', () => {
        expect(calculator.sin(Math.PI / 2)).toBeCloseTo(1);
    });

    test('Косинус 0', () => {
        expect(calculator.cos(0)).toBeCloseTo(1);
    });

    test('Косинус π', () => {
        expect(calculator.cos(Math.PI)).toBeCloseTo(-1);
    });

    test('Тангенс 0', () => {
        expect(calculator.tg(0)).toBeCloseTo(0);
    });

    test('Тангенс π/4', () => {
        expect(calculator.tg(Math.PI / 4)).toBeCloseTo(1);
    });

    test('Арктангенс 0', () => {
        expect(calculator.arctg(0)).toBeCloseTo(0);
    });

    test('Арктангенс 1', () => {
        expect(calculator.arctg(1)).toBeCloseTo(Math.PI / 4);
    });
});

// Тесты для логарифмических функций
describe('Логарифмические функции', () => {
    test('Натуральный логарифм e', () => {
        expect(calculator.ln(Math.E)).toBeCloseTo(1);
    });

    test('Натуральный логарифм 1', () => {
        expect(calculator.ln(1)).toBeCloseTo(0);
    });

    test('Десятичный логарифм 10', () => {
        expect(calculator.lg(10)).toBeCloseTo(1);
    });

    test('Десятичный логарифм 100', () => {
        expect(calculator.lg(100)).toBeCloseTo(2);
    });

    test('Логарифм отрицательного числа должен выбрасывать ошибку', () => {
        expect(() => calculator.ln(-1)).toThrow('Логарифм не определен');
    });

    test('Логарифм нуля должен выбрасывать ошибку', () => {
        expect(() => calculator.lg(0)).toThrow('Логарифм не определен');
    });
});

// Тесты для степенных функций
describe('Степенные функции', () => {
    test('2 в степени 3', () => {
        expect(calculator.power(2, 3)).toBe(8);
    });

    test('10 в степени -1', () => {
        expect(calculator.power(10, -1)).toBeCloseTo(0.1);
    });

    test('e в степени 1', () => {
        expect(calculator.exp(1)).toBeCloseTo(Math.E);
    });

    test('e в степени 0', () => {
        expect(calculator.exp(0)).toBeCloseTo(1);
    });
});

// Тесты для корней
describe('Корни', () => {
    test('Квадратный корень из 4', () => {
        expect(calculator.sqrt(4)).toBe(2);
    });

    test('Квадратный корень из 2', () => {
        expect(calculator.sqrt(2)).toBeCloseTo(1.4142, 4);
    });

    test('Квадратный корень из отрицательного числа должен выбрасывать ошибку', () => {
        expect(() => calculator.sqrt(-1)).toThrow('Квадратный корень из отрицательного числа');
    });

    test('Корень из суммы квадратов 3 и 4', () => {
        expect(calculator.sqrtSum(3, 4)).toBe(5);
    });
});

// Тесты для других функций
describe('Другие функции', () => {
    test('Обратное число для 2', () => {
        expect(calculator.inverse(2)).toBe(0.5);
    });

    test('Обратное число для 0 должно выбрасывать ошибку', () => {
        expect(() => calculator.inverse(0)).toThrow('Деление на ноль');
    });

    test('Смена знака положительного числа', () => {
        expect(calculator.negate(5)).toBe(-5);
    });

    test('Смена знака отрицательного числа', () => {
        expect(calculator.negate(-3)).toBe(3);
    });
});

// Тесты для форматирования чисел
describe('Форматирование чисел', () => {
    test('Форматирование обычного числа', () => {
        expect(calculator.formatNumber(123.456, 3)).toBe('123.456');
    });

    test('Форматирование числа с обрезкой нулей', () => {
        expect(calculator.formatNumber(123.4500, 4)).toBe('123.45');
    });

    test('Форматирование очень маленького числа', () => {
        expect(calculator.formatNumber(1.23e-10, 3)).toMatch(/1.23 -10/);
    });

    test('Форматирование очень большого числа', () => {
        expect(calculator.formatNumber(1.23e10, 3)).toMatch(/1.23 \+10/);
    });

    test('Форматирование NaN', () => {
        expect(calculator.formatNumber(NaN)).toBe('Error');
    });
}); 