// Импорт модулей
// const calculator = require('./calculator');
// const logger = require('./logger');
// Импорт парсера
// const parser = require('./parser');

// Глобальные переменные - полная перестройка по образцу чистого калькулятора
let displayValue = '0';
let currentInput = '';
let operator = null;
let previousInput = '';
let memoryRegisterX = 0; // Основной регистр X (текущее значение)
let memoryRegisterP = 0; // Дополнительный регистр П
let isPowerOn = true; // Калькулятор всегда включен
let isDegreeMode = true;
let isFMode = false;
let hasError = false;
let resultMode = false; // true, если текущее значение — результат функции (sin, √ и т.д.) — запрещаем дописывать цифры
let lastOperator = null; // ВОССТАНАВЛИВАЕМ ДЛЯ ПОВТОРА ОПЕРАЦИИ ПРИ =
let lastOperand = null;  // ВОССТАНАВЛИВАЕМ ДЛЯ ПОВТОРА ОПЕРАЦИИ ПРИ =
let lastOperand2 = null; // ВОССТАНАВЛИВАЕМ ДЛЯ ПОВТОРА ОПЕРАЦИИ ПРИ =

// НОВАЯ ЛОГИКА: Ввод порядка (ВП)
let expectingExponent = false; // true, если ожидаем ввод порядка после ВП
let exponentSign = '';         // '+' или '-'
let exponentDigits = '';       // две цифры порядка

// НОВАЯ ЛОГИКА: Возведение в степень (y^x)
let powerBase = null; // Основание y для y^x
let isWaitingForPowerExponent = false; // true, если ожидаем ввод показателя степени x после F -> ВП

// Исправленная логика скобок
let bracketStack = []; // Хранит состояние (previousInput, operator, displayValue) при входе в скобки
let expressionStack = []; // Хранит числа и операторы внутри текущего уровня скобок
let currentLevelOpen = false; // Флаг: находимся ли внутри скобок

// НОВАЯ ЛОГИКА: Режим восьмиразрядной мантиссы
let isEightDigitMantissaMode = false; // true, если включен режим отображения 8-разрядной мантиссы (F -> CN)

// Дополнительные переменные для совместимости
let arcFlag = 0;               // Флаг арк-функций
let zapCounter = 0;            // Счётчик для переключения регистров ЗП/ВП
let schCounter = 0;            // Счётчик для переключения регистров СЧ

let quadraticCoeffBuffer = [];
let quadraticRoots = [];
let quadraticRootIndex = 0;
let isVPMode = false;

// Константы
let Pi = 3.1415926535;
let e_const = 2.718281828459;
let errorMessage = "error";

// История нажатий кнопок для отладки
let buttonHistory = [];
const MAX_HISTORY_LENGTH = 50; // Максимальное количество записей в истории

// Объявляем переменную screenText
let screenText;

// Инициализация логгера
try {
    // logger.initLogger({ level: 'INFO', clearOnInit: false });
    console.log('Логгер инициализирован');
} catch (e) {
    console.error('Ошибка инициализации логгера:', e);
}

/**
 * Логирование нажатия кнопки
 * @param {string} buttonValue - Значение нажатой кнопки
 */
function logButtonPress(buttonValue) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        button: buttonValue,
        currentInput,
        displayValue
    };
    
    buttonHistory.push(logEntry);
    
    // Ограничиваем размер истории
    if (buttonHistory.length > MAX_HISTORY_LENGTH) {
        buttonHistory.shift(); // Удаляем самую старую запись
    }
    
    console.log(`[КНОПКА]: ${buttonValue} | Ввод: ${currentInput} | Дисплей: ${displayValue}`);
}

/**
 * Вывод истории нажатий кнопок в консоль
 */
function printButtonHistory() {
    console.log('=== ИСТОРИЯ НАЖАТИЙ КНОПОК ===');
    buttonHistory.forEach((entry, index) => {
        console.log(`${index + 1}. [${entry.timestamp}] Кнопка: ${entry.button} | Ввод: ${entry.currentInput} | Дисплей: ${entry.displayValue}`);
    });
    console.log('==============================');
}

/**
 * Проверка на переполнение диапазона калькулятора С3-15
 * @param {number} number - Число для проверки
 * @returns {boolean} - true если переполнение
 */
function checkOverflow(number) {
    const maxValue = 9.999999999 * Math.pow(10, 99);
    const minValue = -9.999999999 * Math.pow(10, 99);
    return number > maxValue || number < minValue;
}

/**
 * Форматирование числа для отображения на экране
 * @param {number|string} number - Число для форматирования
 * @returns {string} - Отформатированное число
 */
function formatNumberAuto(number) {
    if (hasError) return '-'.repeat(9);
    let formatted = number.toString().replace('.', ',');
    // Проверка на переполнение
    const absValue = Math.abs(parseFloat(formatted.replace(',', '.')));
    if (absValue > 9.9999999e99 || isNaN(absValue)) {
        hasError = true;
        return '-'.repeat(9);
    }
    // Проверка на слишком малое число
    if (absValue < 1e-99 && absValue !== 0) {
        return '0';
    }

    // --- Режим восьмиразрядной мантиссы ---
    if (isEightDigitMantissaMode && formatted.toLowerCase().includes('e')) {
        const [mantissaStr] = formatted.split(/e/i);
        const mantissaSign = mantissaStr.startsWith('-') ? '-' : '';
        let mantissaBody = mantissaStr.replace('-', '').replace(',', '');

        while (mantissaBody.length < 8) {
            mantissaBody += '0';
        }
        const digitsToUse = mantissaBody.slice(0, 8);

        let mantissaFormatted = mantissaSign + digitsToUse[0] + ',' + digitsToUse.slice(1);
        return mantissaFormatted;
    }

    // --- Естественная форма (без e) ---
    if (!formatted.toLowerCase().includes('e')) {
        const sign = formatted.startsWith('-') ? '-' : '';
        const numberPart = formatted.startsWith('-') ? formatted.slice(1) : formatted;
        const parts = numberPart.split(',');
        let integerPart = parts[0];
        let decimalPart = parts[1] || '';
        const combined = integerPart + decimalPart;
        const trimmed = combined.slice(0, 8);
        integerPart = trimmed.slice(0, integerPart.length);
        decimalPart = trimmed.slice(integerPart.length);
        let result = `${sign}${integerPart}`;
        if (parts.length > 1) result += ',' + decimalPart;
        return result;
    }

    // --- Экспоненциальная форма: мантисса 5 цифр ---
    const [mantissaStrRaw] = formatted.split(/e/i);

    const mantissaSign = mantissaStrRaw.startsWith('-') ? '-' : '';
    let mantissaBody = mantissaStrRaw.replace('-', '').replace(',', '');

    while (mantissaBody.length < 5) {
        mantissaBody += '0';
    }
    const mantissaDigits = mantissaBody.slice(0, 5);

    const mantissaFormatted = mantissaSign + mantissaDigits[0] + ',' + mantissaDigits.slice(1);

    // --- порядок: используем только глобальные exponentSign и exponentDigits ---
    let expDigits = exponentDigits;
    if (!expDigits || expDigits.length === 0) expDigits = '00';
    expDigits = expDigits.padStart(2, '0');

    let expPart;
    if (exponentSign === '-') {
        expPart = '-' + expDigits;
    } else {
        expPart = ' ' + expDigits; // пробел для положительного
    }

    return `${mantissaFormatted}${expPart}`;
}

/**
 * Обновление экрана калькулятора
 */
function updateScreen() {
    if (!screenText) {
        console.warn('Элемент экрана не найден');
        return;
    }
    
    if (!isPowerOn) {
        screenText.classList.add('off');
        screenText.textContent = '';
        return;
    }
    
    if (hasError) {
        screenText.textContent = '-'.repeat(9);
        screenText.classList.add('negative-shift');
        return;
    }
    
    screenText.classList.remove('off');
    
    const formattedValue = formatNumberAuto(displayValue || '0');
    
    if (formattedValue.startsWith('-')) {
        screenText.classList.add('negative-shift');
    } else {
        screenText.classList.remove('negative-shift');
    }
    
    // Разделение на span для правильного отображения
    if (formattedValue.includes(',')) {
        const parts = formattedValue.split(',');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        screenText.innerHTML =
            `<span class="integer-part">${integerPart}</span>` +
            `<span class="comma-part">,</span>` +
            `<span class="decimal-part">${decimalPart}</span>`;
    } else {
        screenText.innerHTML = `<span class="integer-part">${formattedValue}</span>`;
    }
    
    // Логирование состояния
    try {
        console.log(`Экран обновлён: ${formattedValue}`);
    } catch (e) {
        console.error('Ошибка логирования:', e);
    }
}

/**
 * Очистка калькулятора
 */
function clearAll() {
    displayValue = '0';
    currentInput = '0';
    operator = null;
    previousInput = '';
    memoryRegisterX = 0;
    bracketStack = [];
    expressionStack = [];
    currentLevelOpen = false;
    isFMode = false;
    resultMode = false;
    expectingExponent = false;
    exponentSign = '';
    exponentDigits = '';
    lastOperator = null;
    lastOperand = null;
    lastOperand2 = null;
    powerBase = null;
    isWaitingForPowerExponent = false;
    isEightDigitMantissaMode = false;
    quadraticCoeffBuffer = [];
    quadraticRoots = [];
    quadraticRootIndex = 0;
    hasError = false;
    
    try {
        console.log('Калькулятор очищен');
    } catch (e) {
        console.error('Ошибка логирования:', e);
    }
    
    updateScreen();
}

/**
 * Обработка ввода пользователя
 * @param {string} value - Введенное значение
 */
function handleInput(value) {
    // Логируем нажатие кнопки
    logButtonPress(value);
    
    if (hasError) return;
    if (!isPowerOn) return;
    
    // Обработка цифр и запятой
    if (/[0-9]/.test(value)) {
        if (resultMode) return; // Запрет на ввод цифр после функции (sin, √ и т.д.)
        if (expectingExponent) {
            // Поддерживаем начальное состояние '00': первая введённая цифра заменяет первый ноль,
            // вторая — второй ноль.
            if (exponentDigits === '') {
                exponentDigits = value;
            } else if (exponentDigits.length === 1) {
                exponentDigits += value;
            } else {
                // Если уже две цифры — игнорируем лишние нажатия
                return;
            }

            // Для промежуточного отображения: если ещё не ввели цифры — показываем "00"
            const displayExp = (exponentDigits === '' ? '00' : exponentDigits.padEnd(2, '0'));

            const baseNum = currentInput.replace(',', '.');
            const tempInput = `${baseNum}e${exponentSign}${displayExp}`;

            displayValue = formatNumberAuto(tempInput);
            updateScreen();

            // Если ввели 2 цифры — фиксируем экспоненту в currentInput и выходим из режима ввода порядка
            if (exponentDigits.length === 2) {
                currentInput = `${baseNum}e${exponentSign}${exponentDigits}`;
                expectingExponent = false;
                displayValue = formatNumberAuto(currentInput);
                updateScreen();
            }

            return; // обработали ввод как ввод порядка
        }
        
        // Обработка замены начального '0'
        if (currentInput === '0') {
            currentInput = value; // Заменяем '0' на новую цифру
        } else if (currentInput === '-0') {
            currentInput = '-' + value; // Заменяем '-0' на '-новая_цифра'
        } else {
            // Обычный случай: добавляем цифру, если не превышено 8 цифр
            if (currentInput.replace(/[^0-9]/g, '').length >= 8) return;
            currentInput += value;
        }
        displayValue = currentInput || '0';
        updateScreen();
        return;
    }
    
    // Обработка запятой
    if (value === ',') {
        if (!currentInput.includes(',')) {
            currentInput += currentInput === '' ? '0,' : ','; // Добавляем '0,' если ввод пуст, иначе ','
            resultMode = false;
            expectingExponent = false; // Сбрасываем при вводе запятой
            displayValue = currentInput; // Присваиваем displayValue значение currentInput
            updateScreen();            // Вызываем обновление дисплейного значения
        }
        return;
    }
    
    // Обработка операторов
    if (['+', '-', '*', '/'].includes(value)) {
        handleOperation(value);
        return;
    }
    
    // Обработка скобок
    if (value === '(') {
        startBracket();
        return;
    }
    
    if (value === ')') {
        endBracket();
        return;
    }
    
    // Обработка специальных функций
    switch (value) {
        case 'c':
            clearAll();
            break;
            
        case 'cx':
            currentInput = '';
            displayValue = '0';
            updateScreen();
            break;
            
        case 'pi':
            if (resultMode) clearAll();
            currentInput = Pi.toString();
            displayValue = currentInput;
            updateScreen();
            break;
            
        case 'arc':
            // Режим арк-функций
            arcFlag = 1;
            break;
            
        case 'sin':
        case 'cos':
        case 'tg':
            handleTrigFunction(value);
            break;
            
        case 'lg':
        case 'ln':
            handleLogFunction(value);
            break;
            
        case 'sqrt':
            handleSqrtFunction();
            break;
            
        case 'reverse':
            handleReverseFunction();
            break;
            
        case 'negate':
            handleNegateFunction();
            break;
            
        case 'exp_degree':
            handleExpFunction();
            break;
            
        case 'p':
            handlePFunction();
            break;
            
        case 'y_degree':
            handleYDegreeFunction();
            break;
            
        case 'zap':
            handleZapFunction();
            break;
            
        case 'vp':
            handleVpFunction();
            break;
            
        case 'sch':
            handleSchFunction();
            break;
            
        case '=':
            calculateResult();
            break;
            
        default:
            console.warn("Неизвестный ввод: " + value);
            break;
    }
}

/**
 * Проверка баланса скобок
 * @param {string} brackets - Выражение для проверки
 * @returns {string} - Результат проверки: ">", "=", "<"
 */
function bracketCheck(brackets) {
    openBrackets = (brackets.match(/\(/g) || []).length;
    closeBrackets = (brackets.match(/\)/g) || []).length;
    if (openBrackets > closeBrackets) {
        return ">";
    } else if (openBrackets === closeBrackets) {
        return "=";
    } else if (openBrackets < closeBrackets) {
        return "<";
    }
}

/**
 * Извлечение последней пары скобок из выражения
 * @param {string} expression - Выражение
 * @returns {Object} - Обновленное выражение и последние скобки
 */
function extractBrackets(expression) {
    let updatedExpression = "";
    let lastBrackets = "";
    let stack = [];
    for (let i = expression.length - 1; i > 0; i--) {
        if (expression[i] == ")") {
            stack.push(i);
        }
        if (expression[i] == "(") {
            if (stack.length != 0) {
                stack.pop();
            }
            if (stack.length == 0) {
                updatedExpression = expression.slice(0, i);
                lastBrackets = expression.slice(i, expression.length);
                return { updatedExpression, lastBrackets };
            }
        }
    }
}

/**
 * Обработка флагов для различных операций
 * @param {string} value - Тип операции
 */
function bracketFlagCheck(value) {
    // Эта функция больше не используется в новой архитектуре
    // Все функции теперь обрабатываются напрямую в handleInput
    console.warn("bracketFlagCheck больше не используется в новой архитектуре");
}

/**
 * Проверка, является ли операция специальной
 * @param {string} operation - Операция для проверки
 * @returns {number} - 1, если операция специальная, иначе 0
 */
function isOperation(operation) {
    if (operation == "p") return 1;
    else return 0;
}

/**
 * Обработка операций
 * @param {string} op - Оператор
 */
function handleOperation(op) {
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : null;
    
    if (inputValue !== null) {
        if (operator !== null) {
            calculateResult();
        }
        previousInput = currentInput;
        currentInput = '';
        operator = op;
        displayValue = previousInput;
    } else if (previousInput !== '') {
        operator = op;
        displayValue = previousInput;
    }
    
    resultMode = false;
    updateScreen();
}

/**
 * Обработка тригонометрических функций
 * @param {string} func - Функция (sin, cos, tg)
 */
function handleTrigFunction(func) {
    const inputValue = currentInput !== '' ? parseFloat(currentInput.replace(',', '.')) : parseFloat(previousInput.replace(',', '.'));
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    let result;
    
    if (arcFlag) {
        // Арк-функции
        switch (func) {
            case 'sin':
                if (inputValue < -1 || inputValue > 1) {
                    hasError = true;
                    updateScreen();
                    return;
                }
                result = Math.asin(inputValue);
                result = isDegreeMode ? (result * 180) / Math.PI : result;
                break;
            case 'cos':
                if (inputValue < -1 || inputValue > 1) {
                    hasError = true;
                    updateScreen();
                    return;
                }
                result = Math.acos(inputValue);
                result = isDegreeMode ? (result * 180) / Math.PI : result;
                break;
            case 'tg':
                result = Math.atan(inputValue);
                result = isDegreeMode ? (result * 180) / Math.PI : result;
                break;
        }
        arcFlag = 0; // Сбрасываем флаг после использования
    } else {
        // Обычные функции
        const radians = isDegreeMode ? inputValue * Math.PI / 180 : inputValue;
        
        switch (func) {
            case 'sin':
                result = Math.sin(radians);
                break;
            case 'cos':
                result = Math.cos(radians);
                break;
            case 'tg':
                result = Math.tan(radians);
                break;
        }
    }
    
    if (Math.abs(result) > 9.9999999e99 || (Math.abs(result) < 1e-99 && result !== 0)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    currentInput = result.toString().replace('.', ',');
    displayValue = formatNumberAuto(currentInput);
    resultMode = true;
    updateScreen();
}

/**
 * Обработка логарифмических функций
 * @param {string} func - Функция (lg, ln)
 */
function handleLogFunction(func) {
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : parseFloat(previousInput);
    
    if (isNaN(inputValue) || inputValue <= 0) {
        hasError = true;
        updateScreen();
        return;
    }
    
    let result;
    if (func === 'lg') {
        result = Math.log10(inputValue);
    } else { // ln
        result = Math.log(inputValue);
    }
    
    if (checkOverflow(result)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    currentInput = result.toString();
    displayValue = currentInput;
    resultMode = true;
    updateScreen();
}

/**
 * Обработка квадратного корня
 */
function handleSqrtFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : parseFloat(previousInput);
    
    if (isNaN(inputValue) || inputValue < 0) {
        hasError = true;
        updateScreen();
        return;
    }
    
    const result = Math.sqrt(inputValue);
    
    if (checkOverflow(result)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    currentInput = result.toString();
    displayValue = currentInput;
    resultMode = true;
    updateScreen();
}

/**
 * Обработка обратного числа (1/x)
 */
function handleReverseFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : parseFloat(previousInput);
    
    if (isNaN(inputValue) || inputValue === 0) {
        hasError = true;
        updateScreen();
        return;
    }
    
    const result = 1 / inputValue;
    
    if (checkOverflow(result)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    currentInput = result.toString();
    displayValue = currentInput;
    resultMode = true;
    updateScreen();
}

/**
 * Обработка смены знака
 */
function handleNegateFunction() {
    if (currentInput === '' || currentInput === '0') {
        currentInput = '-0';
    } else if (currentInput === '-0') {
        currentInput = '0';
    } else if (currentInput.startsWith('-')) {
        currentInput = currentInput.substring(1);
    } else {
        currentInput = '-' + currentInput;
    }
    
    displayValue = currentInput;
    updateScreen();
}

/**
 * Обработка экспоненты (e^x)
 */
function handleExpFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : parseFloat(previousInput);
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    const result = Math.pow(e_const, inputValue);
    
    if (checkOverflow(result)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    currentInput = result.toString();
    displayValue = currentInput;
    resultMode = true;
    updateScreen();
}

/**
 * Обработка функции P (корень из суммы квадратов)
 */
function handlePFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput.replace(',', '.')) : parseFloat(previousInput.replace(',', '.'));
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    // Сохраняем первое число для функции P
    memoryRegisterX = inputValue;
    currentInput = '';
    displayValue = '0';
    updateScreen();
}

/**
 * Обработка возведения в степень y^x
 */
function handleYDegreeFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput.replace(',', '.')) : parseFloat(previousInput.replace(',', '.'));
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    // Сохраняем основание для y^x
    powerBase = inputValue;
    currentInput = '';
    displayValue = '0';
    updateScreen();
}

/**
 * Обработка записи в память (ЗП)
 */
function handleZapFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput.replace(',', '.')) : parseFloat(previousInput.replace(',', '.'));
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    // В новой архитектуре используем только один регистр памяти
    memoryRegisterP = inputValue;
    console.log(`ЗП: Сохранено в memoryRegisterP: ${memoryRegisterP}`);
}

/**
 * Обработка вызова из памяти (ВП)
 */
function handleVpFunction() {
    if (memoryRegisterP !== 0) {
        currentInput = memoryRegisterP.toString().replace('.', ',');
        displayValue = formatNumberAuto(currentInput);
        console.log(`ВП: Вызвано из memoryRegisterP: ${memoryRegisterP}`);
        updateScreen();
    } else {
        console.log("ВП: Нет данных в памяти");
    }
}

/**
 * Обработка счёта из памяти (СЧ)
 */
function handleSchFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput.replace(',', '.')) : parseFloat(previousInput.replace(',', '.'));
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    // В новой архитектуре используем только один регистр памяти
    const result = memoryRegisterP + inputValue;
    
    if (Math.abs(result) > 9.9999999e99) {
        hasError = true;
        updateScreen();
        return;
    }
    
    memoryRegisterP = result;
    currentInput = result.toString().replace('.', ',');
    displayValue = formatNumberAuto(currentInput);
    console.log(`СЧ: Прибавлено к memoryRegisterP: ${memoryRegisterP}`);
    updateScreen();
}

/**
 * Вычисление результата выражения
 */
function calculateResult() {
    if (!isPowerOn || hasError) return;
    if (currentLevelOpen || bracketStack.length > 0) {
        if (currentLevelOpen) endBracket();
        return;
    }
    
    // НОВАЯ ЛОГИКА: ОБРАБОТКА y^x
    if (isWaitingForPowerExponent) {
        const inputValue = currentInput !== '' ? parseFloat(currentInput.replace(',', '.')) : null;
        if (inputValue !== null && powerBase !== null) {
            let result;
            try {
                // Возведение в степень
                result = Math.pow(powerBase, inputValue);
                // Проверка на переполнение
                if (Math.abs(result) > 9.9999999e99) {
                    hasError = true;
                    updateScreen();
                    return;
                }
                // Проверка на слишком малое число
                if (Math.abs(result) < 1e-99 && result !== 0) {
                    hasError = true;
                    updateScreen();
                    return;
                }
                // Сохраняем результат
                currentInput = result.toString().replace('.', ',');
                displayValue = formatNumberAuto(currentInput);
                // Сбрасываем флаги
                isWaitingForPowerExponent = false;
                powerBase = null;
                updateScreen();
            } catch (e) {
                hasError = true;
                updateScreen();
            }
        } else {
            // Если не ввели показатель степени или не было основания
            hasError = true;
            updateScreen();
        }
        return;
    }
    
    const inputValue = currentInput !== '' ? parseFloat(currentInput.replace(',', '.')) : null;
    if (operator !== null) {
        const prevValue = parseFloat(previousInput.replace(',', '.'));
        if (isNaN(prevValue) || (inputValue === null && operator !== null)) {
            if (inputValue === null) {
                displayValue = formatNumberAuto(previousInput);
                currentInput = previousInput;
                operator = null;
                updateScreen();
                return;
            }
        }
        let result;
        const currentOperand = inputValue !== null ? inputValue : prevValue;
        switch (operator) {
            case '+': result = prevValue + currentOperand; break;
            case '-': result = prevValue - currentOperand; break;
            case '*': result = prevValue * currentOperand; break;
            case '/':
                if (currentOperand === 0) {
                    hasError = true;
                    updateScreen();
                    return;
                }
                result = prevValue / currentOperand;
                break;
            default: return;
        }
        if (Math.abs(result) > 9.9999999e99) {
            hasError = true;
            updateScreen();
            return;
        }
        
        // Обработка специальных флагов
        if (memoryRegisterX !== 0) {
            // Функция P: sqrt(x^2 + y^2)
            const firstValue = memoryRegisterX;
            result = Math.sqrt(firstValue * firstValue + inputValue * inputValue);
            memoryRegisterX = 0; // Сбрасываем после использования
        }
        
        if (powerBase !== null) {
            // Функция y^x
            result = Math.pow(powerBase, inputValue);
            powerBase = null; // Сбрасываем после использования
        }
        
        // CORRECTED REPEAT LOGIC: Сохраняем операнды и оператор для следующего повтора
        // Результат становится новым первым операндом для повтора
        lastOperand = result;
        // Введённый операнд (currentOperand) становится вторым операндом для повтора
        lastOperand2 = currentOperand;
        lastOperator = operator;
        operator = null;
        previousInput = '';
        currentInput = result.toString().replace('.', ',');
        displayValue = formatNumberAuto(currentInput);
        updateScreen();
    } else if (lastOperator !== null && lastOperand !== null && lastOperand2 !== null && inputValue !== null) {
        // Логика повторения операции: используем текущее значение (inputValue) и lastOperand2
        let result;
        switch (lastOperator) {
            case '+': result = inputValue + lastOperand2; break;
            case '-': result = inputValue - lastOperand2; break;
            case '*': result = inputValue * lastOperand2; break;
            case '/':
                if (lastOperand2 === 0) {
                    hasError = true;
                    updateScreen();
                    return;
                }
                result = inputValue / lastOperand2;
                break;
            default: return;
        }
        if (Math.abs(result) > 9.9999999e99) {
            hasError = true;
            updateScreen();
            return;
        }
        // CORRECTED REPEAT LOGIC: Обновляем lastOperand для следующего повтора, lastOperand2 остаётся
        lastOperand = result;
        // lastOperand2 не меняется, используется снова
        // lastOperator остаётся тем же
        currentInput = result.toString().replace('.', ',');
        displayValue = formatNumberAuto(currentInput);
        updateScreen();
    } else if (inputValue !== null) {
        displayValue = formatNumberAuto(currentInput);
        updateScreen();
    }
}



// Добавляем проверку на существование элементов перед добавлением обработчиков событий
function addEventListenerIfExists(id, eventType, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(eventType, handler);
    }
}

// Инициализация кнопок после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM полностью загружен, инициализация кнопок...');
    
    // Инициализация элемента экрана
    screenText = document.querySelector(".screen_text");
    if (!screenText) {
        console.error('Элемент экрана не найден в DOM');
    }
    
    // Привязываем обработчики событий к кнопкам
    addEventListenerIfExists("btn_0", "click", () => handleInput("0"));
    addEventListenerIfExists("btn_1", "click", () => handleInput("1"));
    addEventListenerIfExists("btn_2", "click", () => handleInput("2"));
    addEventListenerIfExists("btn_3", "click", () => handleInput("3"));
    addEventListenerIfExists("btn_4", "click", () => handleInput("4"));
    addEventListenerIfExists("btn_5", "click", () => handleInput("5"));
    addEventListenerIfExists("btn_6", "click", () => handleInput("6"));
    addEventListenerIfExists("btn_7", "click", () => handleInput("7"));
    addEventListenerIfExists("btn_8", "click", () => handleInput("8"));
    addEventListenerIfExists("btn_9", "click", () => handleInput("9"));
    addEventListenerIfExists("btn_clear", "click", () => handleInput("c"));
    addEventListenerIfExists("btn_dot", "click", () => handleInput("."));
    addEventListenerIfExists("btn_plus", "click", () => handleInput("+"));
    addEventListenerIfExists("btn_minus", "click", () => handleInput("-"));
    addEventListenerIfExists("btn_multiply", "click", () => handleInput("*"));
    addEventListenerIfExists("btn_division", "click", () => handleInput("/"));
    addEventListenerIfExists("btn_left_bracket", "click", () => handleInput("("));
    addEventListenerIfExists("btn_right_bracket", "click", () => handleInput(")"));
    addEventListenerIfExists("btn_equal", "click", () => handleInput("="));
    addEventListenerIfExists("btn_sqrt", "click", () => handleInput("sqrt"));
    addEventListenerIfExists("btn_exp_degree", "click", () => handleInput("exp_degree"));
    addEventListenerIfExists("btn_reverse", "click", () => handleInput("reverse"));
    addEventListenerIfExists("btn_negate", "click", () => handleInput("negate"));
    addEventListenerIfExists("btn_p", "click", () => handleInput("p"));
    addEventListenerIfExists("btn_lg", "click", () => handleInput("lg"));
    addEventListenerIfExists("btn_ln", "click", () => handleInput("ln"));
    addEventListenerIfExists("btn_pi", "click", () => handleInput("pi"));
    addEventListenerIfExists("btn_zap", "click", () => handleInput("zap"));
    addEventListenerIfExists("btn_vp", "click", () => handleInput("vp"));
    addEventListenerIfExists("btn_sch", "click", () => handleInput("sch"));
    addEventListenerIfExists("btn_cx", "click", () => handleInput("cx"));
    addEventListenerIfExists("btn_sin", "click", () => handleInput("sin"));
    addEventListenerIfExists("btn_cos", "click", () => handleInput("cos"));
    addEventListenerIfExists("btn_tg", "click", () => handleInput("tg"));
    addEventListenerIfExists("btn_arc", "click", () => handleInput("arc"));
    addEventListenerIfExists("btn_y_degree", "click", () => handleInput("y_degree"));
    
    // Инициализация экрана
    updateScreen();
    
    // Добавляем тестовую функцию для отладки выражений с отрицательными числами
    window.testNegativeExpression = function() {
        clearAll();
        console.log("=== ТЕСТ ВЫРАЖЕНИЯ С ОТРИЦАТЕЛЬНЫМИ ЧИСЛАМИ ===");
        
        // Тест 1: (-1)-896523*3
        // Тестовое выражение 1: (-1)-896523*3
        console.log("Тестовое выражение 1: (-1)-896523*3");
        // В новой архитектуре это нужно тестировать через handleInput
        console.log("Результат: тест не поддерживается в новой архитектуре");
        
        // Тест 2: -1-896523*3
        clearAll();
        console.log("Тестовое выражение 2: -1-896523*3");
        console.log("Результат: тест не поддерживается в новой архитектуре");
        
        // Тест 3: (-1)-(896523*3)
        clearAll();
        console.log("Тестовое выражение 3: (-1)-(896523*3)");
        console.log("Результат: тест не поддерживается в новой архитектуре");
        
        // Тест 4: -1-(896523*3)
        clearAll();
        console.log("Тестовое выражение 4: -1-(896523*3)");
        console.log("Результат: тест не поддерживается в новой архитектуре");
        
        console.log("=== КОНЕЦ ТЕСТА ===");
    };
    
    /**
     * Функция для симуляции последовательности нажатий кнопок
     * @param {string} sequence - Последовательность кнопок, разделенная пробелами
     */
    window.simulateKeyPresses = function(sequence) {
        clearAll();
        console.log("=== СИМУЛЯЦИЯ ПОСЛЕДОВАТЕЛЬНОСТИ НАЖАТИЙ КНОПОК ===");
        console.log("Последовательность:", sequence);
        
        // Разбиваем последовательность на отдельные кнопки
        const keys = sequence.split(' ');
        
        // Симулируем нажатие каждой кнопки
        for (const key of keys) {
            console.log(`\nНажатие кнопки: ${key}`);
            console.log(`Состояние до нажатия: currentInput="${currentInput}", displayValue="${displayValue}"`);
            
            handleInput(key);
            
            console.log(`Состояние после нажатия: currentInput="${currentInput}", displayValue="${displayValue}"`);
        }
        
        console.log("\n=== РЕЗУЛЬТАТ СИМУЛЯЦИИ ===");
        console.log(`Итоговый ввод: ${currentInput}`);
        console.log(`Итоговое значение на экране: ${displayValue}`);
        console.log("=== КОНЕЦ СИМУЛЯЦИИ ===");
        
        return {
            input: currentInput,
            display: displayValue
        };
    };
    
    /**
     * Функция для тестирования выражения с отрицательными числами через симуляцию нажатий кнопок
     */
    window.testNegativeExpressionWithKeyPresses = function() {
        console.log("=== ТЕСТ ВЫРАЖЕНИЯ С ОТРИЦАТЕЛЬНЫМИ ЧИСЛАМИ ЧЕРЕЗ СИМУЛЯЦИЮ НАЖАТИЙ ===");
        
        // Тест 1: (-1)-896523*3
        console.log("\nТест 1: (-1)-896523*3");
        window.simulateKeyPresses("( - 1 ) - 8 9 6 5 2 3 * 3 =");
        
        // Тест 2: -1-896523*3
        console.log("\nТест 2: -1-896523*3");
        window.simulateKeyPresses("- 1 - 8 9 6 5 2 3 * 3 =");
        
        // Тест 3: (-1)-(896523*3)
        console.log("\nТест 3: (-1)-(896523*3)");
        window.simulateKeyPresses("( - 1 ) - ( 8 9 6 5 2 3 * 3 ) =");
        
        // Тест 4: -1-(896523*3)
        console.log("\nТест 4: -1-(896523*3)");
        window.simulateKeyPresses("- 1 - ( 8 9 6 5 2 3 * 3 ) =");
        
        console.log("=== КОНЕЦ ТЕСТА ===");
    };
    
    /**
     * Функция для тестирования кнопки P (корень из суммы квадратов)
     */
    window.testPButton = function() {
        console.log("=== ТЕСТ КНОПКИ P (корень из суммы квадратов) ===");
        
        // Тест 1: 7 P 9 = должно дать sqrt(7^2 + 9^2) = sqrt(49 + 81) = sqrt(130) ≈ 11.4018
        clearAll();
        console.log("\nТест 1: 7 P 9 =");
        window.simulateKeyPresses("7 p 9 =");
        
        // Тест 2: 3 P 4 = должно дать sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5
        clearAll();
        console.log("\nТест 2: 3 P 4 =");
        window.simulateKeyPresses("3 p 4 =");
        
        // Тест 3: 5 P 12 + 2 = должно дать sqrt(5^2 + 12^2) + 2 = sqrt(25 + 144) + 2 = 13 + 2 = 15
        clearAll();
        console.log("\nТест 3: 5 P 12 + 2 =");
        window.simulateKeyPresses("5 p 12 + 2 =");
        
        console.log("=== КОНЕЦ ТЕСТА КНОПКИ P ===");
    };
    
    /**
     * Функция для тестирования кнопки y^x
     */
    window.testYDegreeButton = function() {
        console.log("=== ТЕСТ КНОПКИ y^x ===");
        
        // Тест 1: 7 y^x 2 = должно дать 7^2 = 49
        clearAll();
        console.log("\nТест 1: 7 y^x 2 =");
        window.simulateKeyPresses("7 y_degree 2 =");
        
        // Тест 2: 3 + 2 * 7 y^x 2 = должно дать 3 + 2 * 49 = 3 + 98 = 101
        clearAll();
        console.log("\nТест 2: 3 + 2 * 7 y^x 2 =");
        window.simulateKeyPresses("3 + 2 * 7 y_degree 2 =");
        
        // Тест 3: 2 y^x 3 = должно дать 2^3 = 8
        clearAll();
        console.log("\nТест 3: 2 y^x 3 =");
        window.simulateKeyPresses("2 y_degree 3 =");
        
        console.log("=== КОНЕЦ ТЕСТА КНОПКИ y^x ===");
    };
    
    /**
     * Функция для тестирования кнопки ARC
     */
    window.testArcButton = function() {
        console.log("=== ТЕСТ КНОПКИ ARC ===");
        
        // Тест 1: arc sin 0.5 = должно дать arcsin(0.5) ≈ 0.5236 радиан
        clearAll();
        console.log("\nТест 1: arc sin 0.5 =");
        window.simulateKeyPresses("arc sin 0 . 5 =");
        
        // Тест 2: arc cos 0.5 = должно дать arccos(0.5) ≈ 1.0472 радиан
        clearAll();
        console.log("\nТест 2: arc cos 0.5 =");
        window.simulateKeyPresses("arc cos 0 . 5 =");
        
        // Тест 3: arc tg 1 = должно дать arctg(1) ≈ 0.7854 радиан
        clearAll();
        console.log("\nТест 3: arc tg 1 =");
        window.simulateKeyPresses("arc tg 1 =");
        
        console.log("=== КОНЕЦ ТЕСТА КНОПКИ ARC ===");
    };
    
    /**
     * Функция для тестирования памяти (ЗП, ВП, СЧ)
     */
    window.testMemoryButtons = function() {
        console.log("=== ТЕСТ КНОПОК ПАМЯТИ (ЗП, ВП, СЧ) ===");
        
        // Тест 1: ЗП 1, ЗП 2, ВП 1, ВП 2
        clearAll();
        console.log("\nТест 1: ЗП 1, ЗП 2, ВП 1, ВП 2");
        window.simulateKeyPresses("5 zap 3 zap vp vp");
        
        // Тест 2: ЗП 1, СЧ 2, ВП 1
        clearAll();
        console.log("\nТест 2: ЗП 1, СЧ 2, ВП 1");
        window.simulateKeyPresses("10 zap 5 sch vp");
        
        // Тест 3: ЗП 1, ЗП 2, СЧ 1, СЧ 2
        clearAll();
        console.log("\nТест 3: ЗП 1, ЗП 2, СЧ 1, СЧ 2");
        window.simulateKeyPresses("7 zap 3 zap 2 sch 1 sch");
        
        console.log("=== КОНЕЦ ТЕСТА ПАМЯТИ ===");
    };
    
    /**
     * Функция для тестирования переполнения
     */
    window.testOverflow = function() {
        console.log("=== ТЕСТ ПЕРЕПОЛНЕНИЯ ===");
        
        // Тест 1: Очень большое число
        clearAll();
        console.log("\nТест 1: Очень большое число");
        currentInput = "1e100"; // Число больше максимального диапазона
        updateScreen();
        console.log("Результат:", screenText.textContent);
        
        // Тест 2: Очень маленькое число
        clearAll();
        console.log("\nТест 2: Очень маленькое число");
        currentInput = "-1e100"; // Число меньше минимального диапазона
        updateScreen();
        console.log("Результат:", screenText.textContent);
        
        console.log("=== КОНЕЦ ТЕСТА ПЕРЕПОЛНЕНИЯ ===");
    };
    
    /**
     * Функция для тестирования всех остальных кнопок
     */
    window.testAllButtons = function() {
        console.log("=== ТЕСТ ВСЕХ ОСТАЛЬНЫХ КНОПОК ===");
        
        // Тест тригонометрических функций
        console.log("\n--- Тригонометрические функции ---");
        
        // sin
        clearAll();
        console.log("sin(6) =");
        window.simulateKeyPresses("6 sin =");
        
        // cos
        clearAll();
        console.log("cos(6) =");
        window.simulateKeyPresses("6 cos =");
        
        // tg
        clearAll();
        console.log("tg(6) =");
        window.simulateKeyPresses("6 tg =");
        
        // Тест логарифмов
        console.log("\n--- Логарифмы ---");
        
        // lg (log10)
        clearAll();
        console.log("lg(100) =");
        window.simulateKeyPresses("1 0 0 lg =");
        
        // ln (log)
        clearAll();
        console.log("ln(2.718) =");
        window.simulateKeyPresses("2 . 7 1 8 ln =");
        
        // Тест экспоненты
        console.log("\n--- Экспонента ---");
        
        // exp_degree (e^x)
        clearAll();
        console.log("e^2 =");
        window.simulateKeyPresses("2 exp_degree =");
        
        // Тест других операций
        console.log("\n--- Другие операции ---");
        
        // sqrt
        clearAll();
        console.log("sqrt(9) =");
        window.simulateKeyPresses("9 sqrt =");
        
        // reverse (1/x)
        clearAll();
        console.log("1/4 =");
        window.simulateKeyPresses("4 reverse =");
        
        // negate (смена знака)
        clearAll();
        console.log("-5 =");
        window.simulateKeyPresses("5 negate =");
        
        // pi
        clearAll();
        console.log("pi =");
        window.simulateKeyPresses("pi =");
        
        // Тест скобок
        console.log("\n--- Скобки ---");
        
        // Простые скобки
        clearAll();
        console.log("(3 + 4) * 2 =");
        window.simulateKeyPresses("( 3 + 4 ) * 2 =");
        
        // Вложенные скобки
        clearAll();
        console.log("((3 + 4) * 2) + 1 =");
        window.simulateKeyPresses("( ( 3 + 4 ) * 2 ) + 1 =");
        
        console.log("=== КОНЕЦ ТЕСТА ВСЕХ КНОПОК ===");
    };
    
    /**
     * Функция для комплексного тестирования всех функций
     */
    window.runAllTests = function() {
        console.log("=== КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ ВСЕХ ФУНКЦИЙ КАЛЬКУЛЯТОРА ===");
        
        window.testMemoryButtons();
        window.testPButton();
        window.testYDegreeButton();
        window.testArcFixed(); // Используем исправленную версию
        window.testOverflow();
        window.testAllButtons();
        window.testMultipleOperators();
        
        console.log("=== ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ ===");
    };
    
    /**
     * Функция для тестирования множественных операторов
     */
    window.testMultipleOperators = function() {
        console.log("=== ТЕСТ МНОЖЕСТВЕННЫХ ОПЕРАТОРОВ ===");
        
        // Тест 1: 5 + + + - * 3 = должно дать 5 * 3 = 15
        clearAll();
        console.log("\nТест 1: 5 + + + - * 3 =");
        window.simulateKeyPresses("5 + + + - * 3 =");
        
        // Тест 2: 2 * * * / 4 = должно дать 2 / 4 = 0.5
        clearAll();
        console.log("\nТест 2: 2 * * * / 4 =");
        window.simulateKeyPresses("2 * * * / 4 =");
        
        // Тест 3: 10 - - - + + 5 = должно дать 10 + 5 = 15
        clearAll();
        console.log("\nТест 3: 10 - - - + + 5 =");
        window.simulateKeyPresses("1 0 - - - + + 5 =");
        
        // Тест 4: 8 / / / * * 2 = должно дать 8 * 2 = 16
        clearAll();
        console.log("\nТест 4: 8 / / / * * 2 =");
        window.simulateKeyPresses("8 / / / * * 2 =");
        
        console.log("=== КОНЕЦ ТЕСТА МНОЖЕСТВЕННЫХ ОПЕРАТОРОВ ===");
    };
    
    /**
     * Функция для тестирования исправленной логики ARC
     */
    window.testArcFixed = function() {
        console.log("=== ТЕСТ ИСПРАВЛЕННОЙ ЛОГИКИ ARC ===");
        
        // Тест 1: 75 arc sin = должно дать arcsin(75)
        clearAll();
        console.log("\nТест 1: 75 arc sin =");
        window.simulateKeyPresses("7 5 arc sin =");
        
        // Тест 2: 0.5 arc cos = должно дать arccos(0.5)
        clearAll();
        console.log("\nТест 2: 0.5 arc cos =");
        window.simulateKeyPresses("0 . 5 arc cos =");
        
        // Тест 3: 1 arc tg = должно дать arctg(1)
        clearAll();
        console.log("\nТест 3: 1 arc tg =");
        window.simulateKeyPresses("1 arc tg =");
        
        // Тест 4: 30 arc sin + 45 arc cos = должно дать arcsin(30) + arccos(45)
        clearAll();
        console.log("\nТест 4: 30 arc sin + 45 arc cos =");
        window.simulateKeyPresses("3 0 arc sin + 4 5 arc cos =");
        
        console.log("=== КОНЕЦ ТЕСТА ИСПРАВЛЕННОЙ ЛОГИКИ ARC ===");
    };
});

// Удаляем тестовую последовательность, которая может мешать работе кнопок
// (() => {
//     currentExpression = "3+4*(7*log10(sqrt(7^2+9^2)*(6-2))+6)";
//     handleInput("=");
//     console.log("Result must be: " + currentExpression + "\n\n");
//     clearAll();
//     handleInput("3");
//     handleInput("+");
//     handleInput("4");
//     handleInput("*");
//     handleInput("(");
//     handleInput("7");
//     handleInput("*");
//     handleInput("(");
//     handleInput("7");
//     handleInput("p");
//     handleInput("9");
//     handleInput("*");
//     handleInput("(");
//     handleInput("6");
//     handleInput("-");
//     handleInput("2");
//     handleInput(")");
//     handleInput(")");
//     handleInput("lg");
//     handleInput("+");
//     handleInput("6");
//     handleInput("=");
//     console.log("result is: " + currentExpression);
//     handleInput("+");
//     handleInput("9");
//     handleInput("=");
//     console.log("aftermath: " + currentExpression);
//     handleInput("+");
//     handleInput("140");
//     handleInput("=");
//     console.log("aftermath 2: " + currentExpression);
//     handleInput("c");
//     handleInput("5");
//     handleInput("4");
//     handleInput("0");
//     handleInput("lg");
//     handleInput("=");
//     console.log("aftermath log10(540): " + currentExpression);
//     handleInput("c");
//     handleInput("1");
//     handleInput("1");
//     handleInput("ln");
//     handleInput("=");
//     console.log("aftermath log(11): " + currentExpression);
//     handleInput("1");
//     handleInput("1");
//     handleInput("*");
//     handleInput("2");
//     handleInput("1");
//     handleInput("=");
// })();
