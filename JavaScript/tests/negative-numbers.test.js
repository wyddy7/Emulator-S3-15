/**
 * Тесты для проверки работы с отрицательными числами
 */

// Импортируем парсер
const parser = require('../parser');

describe('Тесты обработки отрицательных чисел', () => {
    test('Тест 1: Отрицательное число в скобках', () => {
        const expression = "(-1)-896523*3";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 1 результат: ${result}`);
        expect(result).toBe(-2689570);
    });
    
    test('Тест 2: Отрицательное число без скобок', () => {
        const expression = "-1-896523*3";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 2 результат: ${result}`);
        expect(result).toBe(-2689570);
    });
    
    test('Тест 3: Отрицательное число в скобках и выражение в скобках', () => {
        const expression = "(-1)-(896523*3)";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 3 результат: ${result}`);
        expect(result).toBe(-2689570);
    });
    
    test('Тест 4: Отрицательное число без скобок и выражение в скобках', () => {
        const expression = "-1-(896523*3)";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 4 результат: ${result}`);
        expect(result).toBe(-2689570);
    });
    
    test('Тест 5: Сложение отрицательных чисел', () => {
        const expression = "-5+(-3)";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 5 результат: ${result}`);
        expect(result).toBe(-8);
    });
    
    test('Тест 6: Вычитание отрицательного числа', () => {
        const expression = "5-(-3)";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 6 результат: ${result}`);
        expect(result).toBe(8);
    });
    
    test('Тест 7: Умножение на отрицательное число', () => {
        const expression = "5*(-3)";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 7 результат: ${result}`);
        expect(result).toBe(-15);
    });
    
    test('Тест 8: Деление на отрицательное число', () => {
        const expression = "15/(-3)";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 8 результат: ${result}`);
        expect(result).toBe(-5);
    });
    
    test('Тест 9: Возведение отрицательного числа в степень', () => {
        const expression = "(-2)^2";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 9 результат: ${result}`);
        expect(result).toBe(-4);
    });
    
    test('Тест 10: Корень из отрицательного числа', () => {
        const expression = "sqrt(-4)";
        const tokens = parser.parseExpression(expression);
        const result = parser.rez(tokens);
        
        console.log(`Тест 10 результат: ${result}`);
        // Ожидаем NaN, так как корень из отрицательного числа не определен в вещественных числах
        expect(isNaN(result)).toBe(true);
    });
}); 