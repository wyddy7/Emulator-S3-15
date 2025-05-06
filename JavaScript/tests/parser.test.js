/**
 * parser.test.js - Тесты для парсера выражений калькулятора С3-15
 */

// Импорт функций из parser.js
const parser = require('../parser');

// Функция для записи результатов тестов в файл (для совместимости с Python-тестами)
function writeToFile(message) {
    console.log(message);
}

describe('Тесты парсера выражений', () => {
    // Тест 1: Простое выражение
    test('Тест 1: Простое выражение', () => {
        const expression = "3 + 2 - 3";
        const inputVal = parser.parseExpression(expression);
        const realVal = 2;
        
        const result = parser.rez(inputVal);
        console.log('Тест 1 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 2: Возведение в степень
    test('Тест 2: Возведение в степень', () => {
        const base = 7;
        const exponent = 2;
        const expression = `${base} ^ ${exponent}`;
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.pow(base, exponent);
        
        const result = parser.rez(inputVal);
        console.log('Тест 2 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 3: Квадратный корень
    test('Тест 3: Квадратный корень', () => {
        const expression = "sqrt(9)";
        const inputVal = parser.parseExpression(expression);
        const realVal = 3;
        
        const result = parser.rez(inputVal);
        console.log('Тест 3 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 4: Сложение с квадратным корнем
    test('Тест 4: Сложение с квадратным корнем', () => {
        const expression = "3 + sqrt(9)";
        const inputVal = parser.parseExpression(expression);
        const realVal = 6;
        
        const result = parser.rez(inputVal);
        console.log('Тест 4 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 5: Последовательные операции
    test('Тест 5: Последовательные операции', () => {
        const expression = "sqrt(9) + sqrt(9) - 3";
        const inputVal = parser.parseExpression(expression);
        const realVal = 3;
        
        const result = parser.rez(inputVal);
        console.log('Тест 5 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 6: Синус
    test('Тест 6: Синус', () => {
        const expression = "sin(0.5)";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.sin(0.5);
        
        const result = parser.rez(inputVal);
        console.log('Тест 6 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 7: Косинус
    test('Тест 7: Косинус', () => {
        const expression = "cos(0.5)";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.cos(0.5);
        
        const result = parser.rez(inputVal);
        console.log('Тест 7 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 8: Тангенс
    test('Тест 8: Тангенс', () => {
        const expression = "tan(0.5)";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.tan(0.5);
        
        const result = parser.rez(inputVal);
        console.log('Тест 8 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 9: Логарифм по основанию 10
    test('Тест 9: Логарифм по основанию 10', () => {
        const expression = "log10(100)";
        const inputVal = parser.parseExpression(expression);
        const realVal = 2;
        
        const result = parser.rez(inputVal);
        console.log('Тест 9 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 10: Натуральный логарифм
    test('Тест 10: Натуральный логарифм', () => {
        const expression = "log(Math.E)";
        const inputVal = parser.parseExpression(expression);
        const realVal = 1;
        
        const result = parser.rez(inputVal);
        console.log('Тест 10 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 11: Обратное число
    test('Тест 11: Обратное число', () => {
        const expression = "1/4";
        const inputVal = parser.parseExpression(expression);
        const realVal = 0.25;
        
        const result = parser.rez(inputVal);
        console.log('Тест 11 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 12: Корень из суммы квадратов
    test('Тест 12: Корень из суммы квадратов', () => {
        const expression = "sqrt(3^2 + 4^2)";
        const inputVal = parser.parseExpression(expression);
        const realVal = 5;
        
        const result = parser.rez(inputVal);
        console.log('Тест 12 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 13: Сложное выражение со скобками
    test('Тест 13: Сложное выражение со скобками', () => {
        const expression = "4 * (5 / 7) + 29 / (3 * 11)";
        const inputVal = parser.parseExpression(expression);
        const realVal = 4 * (5 / 7) + 29 / (3 * 11);
        
        const result = parser.rez(inputVal);
        console.log('Тест 13 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 14: Константа Pi
    test('Тест 14: Константа Pi', () => {
        const expression = "pi";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.PI;
        
        const result = parser.rez(inputVal);
        console.log('Тест 14 результат:', result);
        
        expect(parser.testVal(result, realVal, 0.01)).toBe(true);
    });
    
    // Тест 15: Экспонента
    test('Тест 15: Экспонента', () => {
        const expression = "e^2";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.exp(2);
        
        const result = parser.rez(inputVal);
        console.log('Тест 15 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 16: Деление на Pi
    test('Тест 16: Деление на Pi', () => {
        const expression = "10/pi";
        const inputVal = parser.parseExpression(expression);
        const realVal = 10 / Math.PI;
        
        const result = parser.rez(inputVal);
        console.log('Тест 16 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 17: Умножение на Pi
    test('Тест 17: Умножение на Pi', () => {
        const expression = "2*pi";
        const inputVal = parser.parseExpression(expression);
        const realVal = 2 * Math.PI;
        
        const result = parser.rez(inputVal);
        console.log('Тест 17 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 18: Pi в степени
    test('Тест 18: Pi в степени', () => {
        const expression = "pi^2";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.PI * Math.PI;
        
        const result = parser.rez(inputVal);
        console.log('Тест 18 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 19: Корень из Pi
    test('Тест 19: Корень из Pi', () => {
        const expression = "sqrt(pi)";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.sqrt(Math.PI);
        
        const result = parser.rez(inputVal);
        console.log('Тест 19 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 20: Сложное выражение с Pi
    test('Тест 20: Сложное выражение с Pi', () => {
        const expression = "2*pi + sqrt(pi) - pi/2";
        const inputVal = parser.parseExpression(expression);
        const realVal = 2 * Math.PI + Math.sqrt(Math.PI) - Math.PI / 2;
        
        const result = parser.rez(inputVal);
        console.log('Тест 20 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 21: Pi в тригонометрических функциях
    test('Тест 21: Pi в тригонометрических функциях', () => {
        const expression = "sin(pi/2)";
        const inputVal = parser.parseExpression(expression);
        const realVal = Math.sin(Math.PI / 2);
        
        const result = parser.rez(inputVal);
        console.log('Тест 21 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 22: Pi в сложных скобках
    test('Тест 22: Pi в сложных скобках', () => {
        const expression = "(pi + 1) * (pi - 1)";
        const inputVal = parser.parseExpression(expression);
        const realVal = (Math.PI + 1) * (Math.PI - 1);
        
        const result = parser.rez(inputVal);
        console.log('Тест 22 результат:', result);
        
        expect(parser.testVal(result, realVal)).toBe(true);
    });
    
    // Тест 23: Некорректная последовательность чисел
    test('Тест 23: Некорректная последовательность чисел', () => {
        const expression = "56/3.14159265353.141593";
        const inputVal = parser.parseExpression(expression);
        
        // Ожидаемый результат: 56 / 3.14159265353 * 0.141593
        const realVal = 56 / 3.14159265353 * 0.141593;
        
        const result = parser.rez(inputVal);
        console.log('Тест 23 результат:', result);
        
        // Проверяем, что результат не NaN
        expect(isNaN(result)).toBe(false);
        
        // Проверяем, что результат близок к ожидаемому
        expect(parser.testVal(result, realVal)).toBe(true);
    });
}); 