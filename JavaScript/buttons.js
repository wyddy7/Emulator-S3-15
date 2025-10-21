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
let memoryRegister1 = 0; // Первый регистр памяти
let memoryRegister2 = 0; // Второй регистр памяти
let waitingForMemoryRegister = false; // Флаг ожидания ввода номера регистра
let memoryOperation = null; // 'zap' или 'sch'
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
let isVPFormatted = false;     // true, если число в VP формате (для отображения степеней)

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
    if (hasError) return '·'.repeat(15); // 15 точек для переполнения
    
    // Специальная обработка для VP формата
    if (isVPFormatted && typeof number === 'string' && number.includes('e')) {
        const parts = number.split(/e/i);
        const mantissaStr = parts[0];
        const exponentStr = parts[1] || '';
        
        const mantissaSign = mantissaStr.startsWith('-') ? '-' : '';
        let mantissaBody = mantissaStr.replace('-', '').replace('.', '');
        
        // Дополняем мантиссу до 10 цифр
        while (mantissaBody.length < 10) {
            mantissaBody += '0';
        }
        const mantissaDigits = mantissaBody.slice(0, 10);
        
        // Форматируем мантиссу: знак + 1 цифра + запятая + 9 цифр = 11 знаков
        const mantissaFormatted = mantissaSign + mantissaDigits[0] + ',' + mantissaDigits.slice(1);
        
        // Форматируем порядок
        const expSign = exponentStr.startsWith('-') ? '-' : ' ';
        const expDigits = exponentStr.replace(/^[+-]/, '').padStart(2, '0');
        const expPart = expSign + expDigits;
        
        return mantissaFormatted + expPart; // 14 символов
    }
    
    let formatted = number.toString();
    // Проверка на переполнение
    const absValue = Math.abs(parseFloat(formatted));
    if (absValue > 9.9999999e99 || isNaN(absValue)) {
        hasError = true;
        return '·'.repeat(15); // 15 точек для переполнения
    }
    // Проверка на слишком малое число
    if (absValue < 1e-99 && absValue !== 0) {
        return '0'.padStart(11, ' '); // Всегда 11 символов
    }

    // --- Режим восьмиразрядной мантиссы ---
    if (isEightDigitMantissaMode && formatted.toLowerCase().includes('e')) {
        const [mantissaStr] = formatted.split(/e/i);
        const mantissaSign = mantissaStr.startsWith('-') ? '-' : '';
        let mantissaBody = mantissaStr.replace('-', '').replace('.', '');

        while (mantissaBody.length < 8) {
            mantissaBody += '0';
        }
        const digitsToUse = mantissaBody.slice(0, 8);

        let mantissaFormatted = mantissaSign + digitsToUse[0] + '.' + digitsToUse.slice(1);
        return mantissaFormatted.padStart(11, ' '); // Всегда 11 символов
    }

    // --- Естественная форма (без e) ---
    if (!formatted.toLowerCase().includes('e')) {
        const sign = formatted.startsWith('-') ? '-' : '';
        const numberPart = formatted.startsWith('-') ? formatted.slice(1) : formatted;
        const parts = numberPart.split('.');
        let integerPart = parts[0];
        let decimalPart = parts[1] || '';
        
        // Обрезаем незначащие нули в конце дробной части
        decimalPart = decimalPart.replace(/0+$/, '');
        
        let result = `${sign}${integerPart}`;
        // Добавляем точку только если есть дробная часть
        if (decimalPart.length > 0) {
            result += '.' + decimalPart;
        } else {
            result += '.'; // Всегда показываем точку
        }
        
        // Ограничиваем длину до 11 символов
        if (result.length > 11) {
            result = result.slice(0, 11);
        }
        
        return result.padStart(11, ' '); // Всегда 11 символов для естественной формы
    }

    // --- Экспоненциальная форма: мантисса 11 знаков + порядок 3 знака = 14 символов ---
    const parts = formatted.split(/e/i);
    const mantissaStrRaw = parts[0];
    const exponentStrRaw = parts[1] || '';

    const mantissaSign = mantissaStrRaw.startsWith('-') ? '-' : '';
    let mantissaBody = mantissaStrRaw.replace('-', '').replace('.', '');

    // Дополняем мантиссу до 10 цифр (1 цифра + 9 цифр после запятой)
    while (mantissaBody.length < 10) {
        mantissaBody += '0';
    }
    const mantissaDigits = mantissaBody.slice(0, 10);

    // Форматируем мантиссу: знак + 1 цифра + запятая + 9 цифр = 11 знаков
    const mantissaFormatted = mantissaSign + mantissaDigits[0] + ',' + mantissaDigits.slice(1);

    // --- порядок: извлекаем из строки или используем глобальные переменные ---
    let expDigits, expSign;
    
    if (exponentStrRaw) {
        // Если порядок есть в строке (например, "555e-55")
        expSign = exponentStrRaw.startsWith('-') ? '-' : '+';
        expDigits = exponentStrRaw.replace(/^[+-]/, '').padStart(2, '0');
    } else {
        // Используем глобальные переменные (режим ВП)
        expSign = exponentSign;
        
        // Если пользователь ввел цифры степеней, используем их
        if (exponentDigits && exponentDigits !== '') {
            expDigits = exponentDigits.padStart(2, '0');
        } else {
            // В режиме ВП показываем "00" по умолчанию
            expDigits = '00';
        }
    }

    // Форматируем порядок: знак + 2 цифры = 3 знака
    let expPart;
    if (expSign === '-') {
        expPart = '-' + expDigits; // например "-34"
    } else {
        expPart = ' ' + expDigits; // например " 34" (пробел вместо +)
    }

    const result = `${mantissaFormatted}${expPart}`;
    return result; // Всегда 14 символов (11 + 3)
}

/**
 * Специальный форматтер для режима ВП
 * Отображает всю строку целиком без разделения на span
 */
function formatVPDisplay(value) {
    // Если это уже отформатированная строка (14 символов) - возвращаем как есть
    if (typeof value === 'string' && value.length === 14 && value.includes(',')) {
        return `<span class="vp-display">${value}</span>`;
    }
    
    // Если это строка с "e" - форматируем как VP
    if (typeof value === 'string' && value.includes('e')) {
        const parts = value.split(/e/i);
        const mantissaStr = parts[0];
        const exponentStr = parts[1] || '';
        
        const mantissaSign = mantissaStr.startsWith('-') ? '-' : '';
        let mantissaBody = mantissaStr.replace('-', '').replace('.', '');
        
        // Дополняем мантиссу до 10 цифр
        while (mantissaBody.length < 10) {
            mantissaBody += '0';
        }
        const mantissaDigits = mantissaBody.slice(0, 10);
        
        // Форматируем мантиссу: знак + 1 цифра + запятая + 9 цифр = 11 знаков
        const mantissaFormatted = mantissaSign + mantissaDigits[0] + ',' + mantissaDigits.slice(1);
        
        // Форматируем порядок
        const expSign = exponentStr.startsWith('-') ? '-' : ' ';
        const expDigits = exponentStr.replace(/^[+-]/, '').padStart(2, '0');
        const expPart = expSign + expDigits;
        
        return `<span class="vp-display">${mantissaFormatted}${expPart}</span>`;
    }
    
    // Если это уже отформатированная строка - возвращаем как есть
    return `<span class="vp-display">${value}</span>`;
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
        screenText.textContent = '·'.repeat(15); // 15 точек для переполнения
        screenText.classList.add('negative-shift');
        return;
    }
    
    screenText.classList.remove('off');
    
    const formattedValue = formatNumberAuto(displayValue || currentInput || '0');
    
    if (formattedValue.startsWith('-')) {
        screenText.classList.add('negative-shift');
    } else {
        screenText.classList.remove('negative-shift');
    }
    
    // Разделение на span для правильного отображения
    if (expectingExponent || isVPFormatted) {
        // Режим ВП - показываем полную строку с порядком
        const fullDisplayValue = displayValue || currentInput || '0';
        screenText.innerHTML = formatVPDisplay(fullDisplayValue);
    } else if (formattedValue.includes('.')) {
        // Обычное форматирование с точкой
        const parts = formattedValue.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        screenText.innerHTML =
            `<span class="integer-part">${integerPart}</span>` +
            `<span class="comma-part">.</span>` +
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
    // Сначала сбрасываем ошибку
    hasError = false;
    
    displayValue = '0';
    currentInput = '';
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
    isVPFormatted = false;
    lastOperator = null;
    lastOperand = null;
    lastOperand2 = null;
    powerBase = null;
    isWaitingForPowerExponent = false;
    isEightDigitMantissaMode = false;
    quadraticCoeffBuffer = [];
    quadraticRoots = [];
    quadraticRootIndex = 0;
    
    // Сбрасываем дополнительные переменные
    arcFlag = 0;
    zapCounter = 0;
    schCounter = 0;
    memoryRegisterX = 0;
    memoryRegister1 = 0;
    memoryRegister2 = 0;
    waitingForMemoryRegister = false;
    memoryOperation = null;
    
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
    
    // Разрешаем очистку даже при ошибке
    if (hasError && value !== 'c' && value !== 'cx') return;
    if (!isPowerOn) return;
    
    // Блокируем все операции кроме 1, 2, zap, sch и сброса при ожидании ввода номера регистра
    if (waitingForMemoryRegister && !['1', '2', 'zap', 'sch', 'c', 'cx'].includes(value)) {
        console.log(`Заблокировано: ${value} (ожидается ввод номера регистра)`);
        return;
    }
    
    // Обработка negate в режиме ВП (должна быть в начале)
    if (value === 'negate' && expectingExponent) {
        // Если мы в режиме ввода порядка — переключаем ТОЛЬКО знак порядка
        exponentSign = (exponentSign === '-') ? '+' : '-';

        const baseNum = currentInput;
        const expPart = (exponentDigits === '' ? '00' : exponentDigits.padStart(2, '0'));

        // Форматируем напрямую без "e"
        const mantissaSign = baseNum.startsWith('-') ? '-' : '';
        let mantissaBody = baseNum.replace('-', '').replace('.', '');

        // Дополняем мантиссу до 10 цифр
        while (mantissaBody.length < 10) {
            mantissaBody += '0';
        }
        const mantissaDigits = mantissaBody.slice(0, 10);

        // Форматируем мантиссу: знак + 1 цифра + запятая + 9 цифр = 11 знаков
        const mantissaFormatted = mantissaSign + mantissaDigits[0] + ',' + mantissaDigits.slice(1);

        // Форматируем порядок
        const expSign = exponentSign === '-' ? '-' : ' ';
        const expPartFormatted = expSign + expPart;

        displayValue = mantissaFormatted + expPartFormatted; // 14 символов без "e"
        updateScreen();
        return; // выходим, чтобы не обработать как обычный negate
    }
    
    // Обработка цифр и запятой
    if (/[0-9]/.test(value)) {
        // Если ожидаем ввод номера регистра памяти
        if (waitingForMemoryRegister && (value === '1' || value === '2')) {
            const registerNumber = parseInt(value);
            
            if (memoryOperation === 'zap') {
                // Записываем в выбранный регистр
                if (registerNumber === 1) {
                    memoryRegister1 = memoryRegisterX;
                    console.log(`ЗП: Сохранено в регистр 1: ${memoryRegister1}`);
                } else {
                    memoryRegister2 = memoryRegisterX;
                    console.log(`ЗП: Сохранено в регистр 2: ${memoryRegister2}`);
                }
            } else if (memoryOperation === 'sch') {
                // Извлекаем из выбранного регистра
                let valueFromMemory;
                if (registerNumber === 1) {
                    valueFromMemory = memoryRegister1;
                    console.log(`СЧ: Извлечено из регистра 1: ${valueFromMemory}`);
                } else {
                    valueFromMemory = memoryRegister2;
                    console.log(`СЧ: Извлечено из регистра 2: ${valueFromMemory}`);
                }
                
                // Устанавливаем извлеченное значение как текущий ввод
                currentInput = valueFromMemory.toString();
                displayValue = formatNumberAuto(currentInput);
                updateScreen();
            }
            
            // Выходим из режима ожидания
            waitingForMemoryRegister = false;
            memoryOperation = null;
            memoryRegisterX = 0;
            return;
        }
        
        // Если ожидаем ввод регистра, но нажали не 1 или 2 - игнорируем
        if (waitingForMemoryRegister) {
            return;
        }
        
        if (resultMode) {
            // Очищаем экран и начинаем новое число
            currentInput = '';
            displayValue = '0';
            resultMode = false;
        }
        if (expectingExponent) {
            // Поддерживаем начальное состояние '00': первая введённая цифра заменяет первый ноль,
            // вторая — второй ноль.
            if (exponentDigits === '') {
                exponentDigits = value;
            } else if (exponentDigits.length === 1) {
                // Проверяем, не превышает ли значение 99
                const currentValue = parseInt(exponentDigits + value);
                if (currentValue > 99) {
                    return; // Игнорируем, если превышает 99
                }
                exponentDigits += value;
            } else {
                // Если уже две цифры — игнорируем лишние нажатия цифр
                return;
            }

            // Для промежуточного отображения: если ещё не ввели цифры — показываем "00"
            const displayExp = (exponentDigits === '' ? '00' : exponentDigits.padStart(2, '0'));

            const baseNum = currentInput;
            
            // Форматируем напрямую без "e"
            const mantissaSign = baseNum.startsWith('-') ? '-' : '';
            let mantissaBody = baseNum.replace('-', '').replace('.', '');

            // Дополняем мантиссу до 10 цифр
            while (mantissaBody.length < 10) {
                mantissaBody += '0';
            }
            const mantissaDigits = mantissaBody.slice(0, 10);

            // Форматируем мантиссу: знак + 1 цифра + запятая + 9 цифр = 11 знаков
            const mantissaFormatted = mantissaSign + mantissaDigits[0] + ',' + mantissaDigits.slice(1);

            // Форматируем порядок
            const expSign = exponentSign === '-' ? '-' : ' ';
            const expPart = expSign + displayExp;

            displayValue = mantissaFormatted + expPart; // 14 символов без "e"
            updateScreen();

            // Если ввели 2 цифры — фиксируем экспоненту, но остаемся в режиме ВП для смены знака
            if (exponentDigits.length === 2) {
                // НЕ изменяем currentInput здесь, оставляем исходное число
                // currentInput остается как исходное число (например, "8")
                // НЕ сбрасываем expectingExponent - остаемся в режиме ВП для смены знака порядка
                // displayValue уже правильно отформатирован выше
            }

            return; // обработали ввод как ввод порядка
        }
        
        // Обработка замены начального '0'
        if (currentInput === '0') {
            currentInput = value; // Заменяем '0' на новую цифру
        } else if (currentInput === '-0') {
            currentInput = '-' + value; // Заменяем '-0' на '-новая_цифра'
        } else {
            // Обычный случай: добавляем цифру, если не превышено 11 символов
            if (currentInput.length >= 11) return;
            currentInput += value;
        }
        displayValue = currentInput || '0';
        updateScreen();
        return;
    }
    
    // Обработка точки
    if (value === '.') {
        if (expectingExponent) {
            // В режиме ВП точка добавляется к мантиссе
            if (!currentInput.includes('.')) {
                currentInput += currentInput === '' ? '0.' : '.';
                resultMode = false;
                // НЕ сбрасываем expectingExponent - остаемся в режиме ВП
                
                // Обновляем отображение с новой мантиссой
                const baseNum = currentInput;
                const expPart = (exponentDigits === '' ? '00' : exponentDigits.padStart(2, '0'));
                const tempInput = `${baseNum}e${exponentSign}${expPart}`;
                displayValue = formatNumberAuto(tempInput);
                updateScreen();
            }
        } else {
            // Обычный режим
            if (!currentInput.includes('.')) {
                currentInput += currentInput === '' ? '0.' : '.'; // Добавляем '0.' если ввод пуст, иначе '.'
                resultMode = false;
                displayValue = currentInput; // Присваиваем displayValue значение currentInput
                updateScreen();            // Вызываем обновление дисплейного значения
            }
        }
        return;
    }
    
    // Обработка операторов
    if (['+', '-', '*', '/'].includes(value)) {
        // Сбрасываем режим ВП при нажатии оператора, но сохраняем экспоненциальную форму
        if (expectingExponent) {
            // Сохраняем экспоненциальную форму в currentInput перед сбросом режима
            const baseNum = currentInput;
            const expPart = (exponentDigits === '' ? '00' : exponentDigits.padStart(2, '0'));
            currentInput = `${baseNum}e${exponentSign}${expPart}`;
            
            expectingExponent = false;
            exponentSign = '';
            exponentDigits = '';
        }
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
    
    // Обработка ВП (ввод порядка) - научная форма
    if (value === 'vp') {
        if (currentInput !== '') {
            // Входим в режим ввода порядка: по умолчанию показываем два нуля в порядке
            expectingExponent = true;
            exponentSign = '+';     // всегда храним явный знак (положительный)
            exponentDigits = '';    // пока пусто, но на экране будем рисовать "00"

            // Форматируем напрямую без "e"
            const baseNum = currentInput;
            const mantissaSign = baseNum.startsWith('-') ? '-' : '';
            let mantissaBody = baseNum.replace('-', '').replace('.', '');

            // Дополняем мантиссу до 10 цифр
            while (mantissaBody.length < 10) {
                mantissaBody += '0';
            }
            const mantissaDigits = mantissaBody.slice(0, 10);

            // Форматируем мантиссу: знак + 1 цифра + запятая + 9 цифр = 11 знаков
            const mantissaFormatted = mantissaSign + mantissaDigits[0] + ',' + mantissaDigits.slice(1);

            // Форматируем порядок: пробел + 00 = 3 знака
            const expPart = ' 00';

            displayValue = mantissaFormatted + expPart; // 14 символов без "e"
            updateScreen();
        } else {
            // Нечего переводить в экспоненту — ошибка
            hasError = true;
            updateScreen();
        }
        return; // выходим, чтобы не обработать это как обычный ввод
    }
    
    // Обработка специальных функций
    switch (value) {
        case 'c':
            clearAll();
            break;
            
        case 'cx':
            // Очищаем текущий ввод и сбрасываем ошибку
            hasError = false;
            currentInput = '';
            displayValue = '0';
            
            // Сбрасываем операции с памятью
            waitingForMemoryRegister = false;
            memoryOperation = null;
            memoryRegisterX = 0;
            
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
            // Обычная смена знака мантиссы (обработка в режиме ВП уже сделана выше)
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
            // Сбрасываем режим ВП при нажатии равно, но сохраняем экспоненциальную форму
            if (expectingExponent) {
                // Сохраняем экспоненциальную форму в currentInput перед сбросом режима
                const baseNum = currentInput;
                const expPart = (exponentDigits === '' ? '00' : exponentDigits.padStart(2, '0'));
                currentInput = `${baseNum}e${exponentSign}${expPart}`;
                
                // Устанавливаем флаг VP форматирования для отображения степеней
                isVPFormatted = true;
                
                expectingExponent = false;
                exponentSign = '';
                exponentDigits = '';
                
                // Обновляем экран с экспоненциальной формой
                displayValue = formatNumberAuto(currentInput);
                updateScreen();
                return; // Выходим БЕЗ вызова calculateResult()
            }
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
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : parseFloat(previousInput);
    
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
    
    // Сохраняем результат в обычной форме
    currentInput = result.toString();
    
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
    resultMode = true; // Запрещаем дописывание цифр после смены знака
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
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : parseFloat(previousInput);
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    // Сохраняем первое число для функции P (корень из суммы квадратов)
    memoryRegisterX = inputValue;
    currentInput = '';
    displayValue = '0';
    
    // Устанавливаем флаг, что ожидаем второе число для вычисления √(x² + y²)
    isWaitingForPowerExponent = true; // Переиспользуем флаг для P функции
    
    updateScreen();
}

/**
 * Обработка возведения в степень y^x
 */
function handleYDegreeFunction() {
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : parseFloat(previousInput);
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    // Сохраняем основание для y^x
    powerBase = inputValue;
    currentInput = '';
    displayValue = '0';
    
    // Устанавливаем флаг, что ожидаем показатель степени
    isWaitingForPowerExponent = true;
    
    updateScreen();
}

/**
 * Обработка записи в память (ЗП)
 */
function handleZapFunction() {
    if (waitingForMemoryRegister) {
        // Если уже ожидаем ввод регистра, переключаемся на zap операцию
        memoryOperation = 'zap';
        console.log(`ЗП: Переключено на запись, ожидание ввода номера регистра (1 или 2) для значения: ${memoryRegisterX}`);
        return;
    }
    
    let inputValue;
    
    // Получаем значение для сохранения
    if (currentInput !== '') {
        inputValue = parseFloat(currentInput);
    } else if (previousInput !== '') {
        inputValue = parseFloat(previousInput);
    } else if (displayValue !== '0' && displayValue !== '') {
        inputValue = parseFloat(displayValue);
    } else {
        inputValue = 0; // Если ничего не введено, сохраняем 0
    }
    
    if (isNaN(inputValue)) {
        hasError = true;
        updateScreen();
        return;
    }
    
    // Входим в режим ожидания ввода номера регистра
    waitingForMemoryRegister = true;
    memoryOperation = 'zap';
    
    // Сохраняем значение для записи
    memoryRegisterX = inputValue;
    
    console.log(`ЗП: Ожидание ввода номера регистра (1 или 2) для значения: ${inputValue}`);
}

/**
 * Обработка вызова из памяти (ВП)
 */
function handleVpFunction() {
    // ВП теперь работает с двумя регистрами - сначала проверяем регистр 1, затем 2
    if (memoryRegister1 !== 0) {
        currentInput = memoryRegister1.toString();
        displayValue = formatNumberAuto(currentInput);
        console.log(`ВП: Вызвано из регистра 1: ${memoryRegister1}`);
        updateScreen();
    } else if (memoryRegister2 !== 0) {
        currentInput = memoryRegister2.toString();
        displayValue = formatNumberAuto(currentInput);
        console.log(`ВП: Вызвано из регистра 2: ${memoryRegister2}`);
        updateScreen();
    } else {
        console.log("ВП: Нет данных в памяти");
    }
}

/**
 * Обработка счёта из памяти (СЧ)
 */
function handleSchFunction() {
    if (waitingForMemoryRegister) {
        // Если уже ожидаем ввод регистра, переключаемся на sch операцию
        memoryOperation = 'sch';
        console.log(`СЧ: Переключено на считывание, ожидание ввода номера регистра (1 или 2)`);
        return;
    }
    
    // Входим в режим ожидания ввода номера регистра
    waitingForMemoryRegister = true;
    memoryOperation = 'sch';
    
    console.log(`СЧ: Ожидание ввода номера регистра (1 или 2)`);
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
    
    // НОВАЯ ЛОГИКА: ОБРАБОТКА y^x и P функции
    if (isWaitingForPowerExponent) {
        const inputValue = currentInput !== '' ? parseFloat(currentInput) : null;
        
        // Проверяем, какая функция активна
        if (powerBase !== null) {
            // y^x функция
            if (inputValue !== null) {
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
                    // Сохраняем результат в обычной форме
                    currentInput = result.toString();
                    
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
                // Если не ввели показатель степени
                hasError = true;
                updateScreen();
            }
        } else if (memoryRegisterX !== 0) {
            // P функция (корень из суммы квадратов)
            if (inputValue !== null) {
                let result;
                try {
                    // Вычисляем √(x² + y²)
                    const x = memoryRegisterX;
                    const y = inputValue;
                    result = Math.sqrt(x * x + y * y);
                    
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
                    
                    // Сохраняем результат в обычной форме
                    currentInput = result.toString();
                    
                    displayValue = formatNumberAuto(currentInput);
                    // Сбрасываем флаги
                    isWaitingForPowerExponent = false;
                    memoryRegisterX = 0;
                    updateScreen();
                } catch (e) {
                    hasError = true;
                    updateScreen();
                }
            } else {
                // Если не ввели второе число для P функции
                hasError = true;
                updateScreen();
            }
        } else {
            // Если не ввели основание или первое число
            hasError = true;
            updateScreen();
        }
        return;
    }
    
    const inputValue = currentInput !== '' ? parseFloat(currentInput) : null;
    if (operator !== null) {
        const prevValue = parseFloat(previousInput);
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
        
        // Проверка на "практически равные" числа для экспоненциальных операций
        // Если результат очень близок к одному из операндов, используем исходный формат
        if (Math.abs(result - prevValue) < Math.abs(prevValue) * 1e-10) {
            // Результат практически равен первому операнду - сохраняем его формат
            currentInput = previousInput;
            displayValue = formatNumberAuto(currentInput);
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
        
        // Сохраняем результат в обычной форме
        currentInput = result.toString();
        
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
        
        // Проверка на "практически равные" числа для экспоненциальных операций
        // Если результат очень близок к текущему значению, сохраняем его формат
        if (Math.abs(result - inputValue) < Math.abs(inputValue) * 1e-10) {
            // Результат практически равен текущему значению - сохраняем его формат
            displayValue = formatNumberAuto(currentInput);
            updateScreen();
            return;
        }
        
        // CORRECTED REPEAT LOGIC: Обновляем lastOperand для следующего повтора, lastOperand2 остаётся
        lastOperand = result;
        // lastOperand2 не меняется, используется снова
        // lastOperator остаётся тем же
        
        // Сохраняем результат в обычной форме
        currentInput = result.toString();
        
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
    
    /**
     * Функция для тестирования экспоненциального форматирования
     */
    window.testExponentialFormatting = function() {
        console.log("=== ТЕСТ ЭКСПОНЕНЦИАЛЬНОГО ФОРМАТИРОВАНИЯ ===");
        
        // Тест 1: Положительный порядок
        console.log("\nТест 1: Положительный порядок");
        const test1 = formatNumberAuto("3.145678904e34");
        console.log(`Вход: 3.145678904e34`);
        console.log(`Результат: "${test1}"`);
        console.log(`Длина: ${test1.length}`);
        console.log(`Ожидается: "3,145678904 34" (14 символов)`);
        
        // Тест 2: Отрицательный порядок
        console.log("\nТест 2: Отрицательный порядок");
        const test2 = formatNumberAuto("3.145678904e-34");
        console.log(`Вход: 3.145678904e-34`);
        console.log(`Результат: "${test2}"`);
        console.log(`Длина: ${test2.length}`);
        console.log(`Ожидается: "3,145678904-34" (14 символов)`);
        
        // Тест 3: Очень большое число
        console.log("\nТест 3: Очень большое число");
        const test3 = formatNumberAuto("1.234567890e99");
        console.log(`Вход: 1.234567890e99`);
        console.log(`Результат: "${test3}"`);
        console.log(`Длина: ${test3.length}`);
        console.log(`Ожидается: "1,234567890 99" (14 символов)`);
        
        // Тест 4: Очень маленькое число
        console.log("\nТест 4: Очень маленькое число");
        const test4 = formatNumberAuto("5.678901234e-99");
        console.log(`Вход: 5.678901234e-99`);
        console.log(`Результат: "${test4}"`);
        console.log(`Длина: ${test4.length}`);
        console.log(`Ожидается: "5,678901234-99" (14 символов)`);
        
        // Тест 5: Число с недостаточным количеством цифр в мантиссе
        console.log("\nТест 5: Короткая мантисса");
        const test5 = formatNumberAuto("1.23e45");
        console.log(`Вход: 1.23e45`);
        console.log(`Результат: "${test5}"`);
        console.log(`Длина: ${test5.length}`);
        console.log(`Ожидается: "1,230000000 45" (14 символов)`);
        
        // Тест 6: Отрицательное число
        console.log("\nТест 6: Отрицательное число");
        const test6 = formatNumberAuto("-2.345678901e-12");
        console.log(`Вход: -2.345678901e-12`);
        console.log(`Результат: "${test6}"`);
        console.log(`Длина: ${test6.length}`);
        console.log(`Ожидается: "-2,345678901-12" (14 символов)`);
        
        // Тест 7: Проверка через симуляцию ВП
        console.log("\nТест 7: Режим ВП (ввод порядка)");
        clearAll();
        console.log("Симуляция: 3.141592653 ВП 25");
        window.simulateKeyPresses("3 . 1 4 1 5 9 2 6 5 3 vp 2 5");
        console.log(`Результат: "${screenText.textContent}"`);
        console.log(`Длина: ${screenText.textContent.length}`);
        console.log(`Ожидается: "3,141592653 25" (14 символов)`);
        
        // Тест 8: ВП с отрицательным порядком
        console.log("\nТест 8: ВП с отрицательным порядком");
        clearAll();
        console.log("Симуляция: 1.234567890 ВП 34 negate");
        window.simulateKeyPresses("1 . 2 3 4 5 6 7 8 9 0 vp 3 4 negate");
        console.log(`Результат: "${screenText.textContent}"`);
        console.log(`Длина: ${screenText.textContent.length}`);
        console.log(`Ожидается: "1,234567890-34" (14 символов)`);
        
        console.log("\n=== КОНЕЦ ТЕСТА ЭКСПОНЕНЦИАЛЬНОГО ФОРМАТИРОВАНИЯ ===");
    };

    /**
     * Функция для тестирования исправлений дисплея
     */
    window.testDisplayFixes = function() {
        console.log("=== ТЕСТ ИСПРАВЛЕНИЙ ДИСПЛЕЯ ===");
        
        // Тест 1: Проверка работы запятой
        clearAll();
        console.log("\nТест 1: Ввод запятой");
        window.simulateKeyPresses("3 , 7 0 0 0 0 0");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 3,700000 (15 символов)");
        
        // Тест 2: Проверка обрезания незначащих нулей
        clearAll();
        console.log("\nТест 2: Обрезание незначащих нулей");
        window.simulateKeyPresses("3 , 7 0 0 0 0 0");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 3,7 (15 символов)");
        
        // Тест 2.1: Проверка сохранения значащих нулей
        clearAll();
        console.log("\nТест 2.1: Сохранение значащих нулей");
        window.simulateKeyPresses("3 , 7 0 0 0 0 3");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 3,700003 (15 символов)");
        
        // Тест 3: Проверка переполнения (точки вместо дефисов)
        clearAll();
        console.log("\nТест 3: Переполнение");
        currentInput = "1e100"; // Очень большое число
        updateScreen();
        console.log("Результат переполнения:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: точки ··············· (15 символов)");
        
        // Тест 4: Проверка экспоненциальной формы (10+3=13 символов)
        clearAll();
        console.log("\nТест 4: Экспоненциальная форма");
        currentInput = "3.141592653e53";
        displayValue = formatNumberAuto(currentInput);
        updateScreen();
        console.log("Результат экспоненциальной формы:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 3,141592653 53 (15 символов)");
        
        // Тест 5: Проверка простого числа с запятой
        clearAll();
        console.log("\nТест 5: Простое число с запятой");
        window.simulateKeyPresses("1 2 3 ,");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 123,000000 (15 символов)");
        
        // Тест 6: Проверка целого числа (должна быть запятая)
        clearAll();
        console.log("\nТест 6: Целое число");
        window.simulateKeyPresses("4 5 6");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 456, (15 символов)");
        
        // Тест 7: Проверка ВП (ввод порядка) - научная форма
        clearAll();
        console.log("\nТест 7: ВП - научная форма");
        window.simulateKeyPresses("3 , 1 4 1 5 9 2 6 5 3 vp 5 3");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 3,141592653 53 (15 символов)");
        
        // Тест 8: Проверка ВП с отрицательным порядком
        clearAll();
        console.log("\nТест 8: ВП с отрицательным порядком");
        window.simulateKeyPresses("1 , 2 3 4 5 6 7 8 9 0 vp negate 1 2");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 1,234567890-12 (15 символов)");
        
        // Тест 9: Проверка смены знака порядка после ввода цифр
        clearAll();
        console.log("\nТест 9: Смена знака порядка после ввода цифр");
        window.simulateKeyPresses("8 vp 2 5 negate");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 8,000000000-25 (15 символов)");
        console.log("Проверяем, что currentInput остался '8', а не изменился на экспоненциальную форму");
        
        // Тест 9.1: Проверка повторного нажатия negate
        console.log("\nТест 9.1: Повторное нажатие negate");
        window.simulateKeyPresses("negate");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: 8,000000000 25 (15 символов) - знак порядка снова +");
        
        // Тест 10: Проверка выхода из режима ВП при нажатии оператора
        clearAll();
        console.log("\nТест 10: Выход из режима ВП при нажатии оператора");
        window.simulateKeyPresses("5 5 5 vp 8 5 - 8");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: результат вычисления 5,550000000-85 - 8");
        console.log("Проверяем, что экспоненциальная форма сохранилась при выходе из режима ВП");
        
        // Тест 11: Проверка сохранения экспоненциальной формы при операциях
        clearAll();
        console.log("\nТест 11: Сохранение экспоненциальной формы при операциях");
        window.simulateKeyPresses("5 5 5 vp 5 2 negate - 2 =");
        console.log("Результат:", screenText.textContent);
        console.log("Длина:", screenText.textContent.length);
        console.log("Ожидается: результат вычисления 5,550000000-52 - 2");
        console.log("Проверяем, что экспоненциальная форма сохранилась и вычисления работают правильно");
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
