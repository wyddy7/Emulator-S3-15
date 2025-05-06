/**
 * calculator.js - Основные вычислительные функции для калькулятора С3-15
 * Содержит математические операции, соответствующие оригинальному калькулятору
 */

// Константы
const PI = 3.1415926535;
const E = 2.718281828459;

/**
 * Базовые арифметические операции
 */
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error("Деление на ноль");
    }
    return a / b;
}

/**
 * Тригонометрические функции
 */
function sin(x) {
    return Math.sin(x);
}

function cos(x) {
    return Math.cos(x);
}

function tg(x) {
    if (Math.cos(x) === 0) {
        throw new Error("Тангенс не определен");
    }
    return Math.tan(x);
}

function arctg(x) {
    return Math.atan(x);
}

/**
 * Логарифмические функции
 */
function ln(x) {
    if (x <= 0) {
        throw new Error("Логарифм не определен для отрицательных чисел и нуля");
    }
    return Math.log(x);
}

function lg(x) {
    if (x <= 0) {
        throw new Error("Логарифм не определен для отрицательных чисел и нуля");
    }
    return Math.log10(x);
}

/**
 * Степенные функции
 */
function power(x, y) {
    return Math.pow(x, y);
}

function exp(x) {
    return Math.pow(E, x);
}

/**
 * Корни
 */
function sqrt(x) {
    if (x < 0) {
        throw new Error("Квадратный корень из отрицательного числа");
    }
    return Math.sqrt(x);
}

function sqrtSum(x, y) {
    return Math.sqrt(x*x + y*y);
}

/**
 * Другие функции
 */
function inverse(x) {
    if (x === 0) {
        throw new Error("Деление на ноль");
    }
    return 1 / x;
}

function negate(x) {
    return -x;
}

/**
 * Форматирование чисел
 */
function formatNumber(number, precision = 10) {
    if (isNaN(number)) {
        return "Error";
    }

    const num = Number(number);
    
    // Проверка на диапазон для обычного отображения
    if ((Math.abs(num) >= 1e-9 && Math.abs(num) < 1e9) || num === 0) {
        return num.toFixed(precision)
            .replace(/(\.\d*?)0+$/, "$1")
            .replace(/\.$/, ".");
    } else {
        // Экспоненциальный формат для очень больших или очень маленьких чисел
        return num.toExponential(precision - 1).replace(/[eE]/, " ");
    }
}

// Создаем объект с функциями калькулятора
const calculator = {
    PI,
    E,
    add,
    subtract,
    multiply,
    divide,
    sin,
    cos,
    tg,
    arctg,
    ln,
    lg,
    power,
    exp,
    sqrt,
    sqrtSum,
    inverse,
    negate,
    formatNumber
};

// Экспорт для Node.js (для тестов)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = calculator;
}

// Экспорт для браузера
if (typeof window !== 'undefined') {
    window.calculator = calculator;
} 