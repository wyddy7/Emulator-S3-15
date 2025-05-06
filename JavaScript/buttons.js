// Импорт модулей
// const calculator = require('./calculator');
// const logger = require('./logger');
// Импорт парсера
// const parser = require('./parser');

// Глобальные переменные
let currentExpression = ""; // Глобальное выражение для ввода
let currentNumber = ""; // Переменная для хранения текущего числа
let currentOperation = "";
let currentRegularBrackets = "";
let Pi = 3.1415926535;
let e_const = 2.718281828459; // Переименовано из exp, чтобы избежать конфликта с функцией exp
let countP = 0;
let errorMessage = "error";
let tempExpression = "";
let register1 = "";
let register2 = "";
let registerFlag1 = 0;
let registerFlag2 = 0;
let zapFlag = 0;
let tempRegister = "";
let lgFlag = 0;
let lnFlag = 0;
let sinFlag = 0;
let cosFlag = 0;
let tgFlag = 0;
let arcFlag = 0;
let expFlag = 0;
let inverseFlag = 0;
let yDegreeFlag = 0;

let openBrackets = 0;
let closeBrackets = 0;

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
        currentExpression,
        currentNumber
    };
    
    buttonHistory.push(logEntry);
    
    // Ограничиваем размер истории
    if (buttonHistory.length > MAX_HISTORY_LENGTH) {
        buttonHistory.shift(); // Удаляем самую старую запись
    }
    
    console.log(`[КНОПКА]: ${buttonValue} | Выражение: ${currentExpression} | Число: ${currentNumber}`);
}

/**
 * Вывод истории нажатий кнопок в консоль
 */
function printButtonHistory() {
    console.log('=== ИСТОРИЯ НАЖАТИЙ КНОПОК ===');
    buttonHistory.forEach((entry, index) => {
        console.log(`${index + 1}. [${entry.timestamp}] Кнопка: ${entry.button} | Выражение: ${entry.currentExpression} | Число: ${entry.currentNumber}`);
    });
    console.log('==============================');
}

/**
 * Форматирование числа для отображения на экране
 * @param {number|string} number - Число для форматирования
 * @returns {string} - Отформатированное число
 */
function formatNumberAuto(number) {
    if (isNaN(number)) return errorMessage;

    // Преобразуем строку в число (если не уже)
    const num = Number(number);
    // Условие для выбора формата
    if ((Math.abs(num) >= 1e-9 && Math.abs(num) < 1e9) || Math.abs(num) == 0) {
        return num
            .toFixed(6)
            .replace(/(\.\d*?)0+$/, "$1")
            .replace(/\.$/, ".");
    } else {
        console.log("Exponential conversion has occurred.");

        return num.toExponential(9).replace(/[eE]/, " "); // Экспоненциальный формат с 6 знаками в мантиссе
    }
}

/**
 * Обновление экрана калькулятора
 */
function updateScreen() {
    if (!screenText) {
        console.warn('Элемент экрана не найден');
        return;
    }
    
    const currentReg = currentNumber;
    // Форматируем число в зависимости от значения
    const displayValue = formatNumberAuto(currentReg || "0");
    screenText.textContent = displayValue;
    
    // Логирование состояния
    try {
        // logger.logMemoryState({
        //     currentExpression,
        //     currentNumber,
        //     register1,
        //     register2
        // });
    } catch (e) {
        console.error('Ошибка логирования:', e);
    }
}

/**
 * Очистка калькулятора
 */
function clearAll() {
    currentExpression = "";
    currentNumber = "";
    currentOperation = "";
    currentRegularBrackets = "";
    lgFlag = lnFlag = sinFlag = cosFlag = tgFlag = arcFlag = expFlag = inverseFlag = yDegreeFlag = 0;
    
    try {
        // logger.logUserAction('clear', 'Очистка калькулятора');
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
    
    try {
        // logger.logUserAction('input', value);
    } catch (e) {
        console.error('Ошибка логирования:', e);
    }
    
    switch (true) {
        // Ввод цифр и точки
        case /[0-9.]/.test(value):
            if (/^0.$/.test(currentExpression)) {
                currentExpression = currentExpression.replace("0", "");
            }
            currentNumber += value;
            break;

        // Базовые арифметические операции
        case /[\-+*/]/.test(value):
            if (isOperation(currentOperation)) {
                bracketFlagCheck(currentOperation);
                currentOperation = value;
                currentExpression += value;
                currentNumber = "";
                break;
            } else {
                currentOperation = value;
                if (currentExpression != currentNumber)
                    currentExpression += currentNumber + value;
                else currentExpression += value;
                currentNumber = "";
                break;
            }
            
        // Скобки
        case /[(]/.test(value):
            currentRegularBrackets += value;
            currentExpression += value;
            break;
            
        case /[)]/.test(value):
            openBrackets = (currentRegularBrackets.match(/\(/g) || []).length;
            closeBrackets = (currentRegularBrackets.match(/\)/g) || []).length;
            if (openBrackets > closeBrackets) {
                currentExpression += currentNumber + value;
            } else if (openBrackets === closeBrackets || openBrackets == 0) {
                currentExpression = "(" + currentExpression + value;
            }
            currentOperation = "";
            currentNumber = "";
            break;

        // Очистка последнего числа (CX)
        case /cx$/.test(value):
            currentNumber = "";
            break;
            
        // Полная очистка (C)
        case /c$/.test(value):
            clearAll();
            currentNumber = "";
            break;

        // Константа pi
        case /pi$/.test(value):
            // Если текущее число не пустое, добавляем его в выражение перед π
            if (currentNumber !== "") {
                currentExpression += currentNumber;
                currentNumber = "";
                // Добавляем оператор умножения, если нет другого оператора
                if (!/[\+\-\*\/\(]$/.test(currentExpression)) {
                    currentExpression += "*";
                }
            }
            // Добавляем π в выражение с пробелами для разделения
            currentExpression += " " + Pi + " ";
            // Устанавливаем текущее число как π для отображения на экране
            currentNumber = formatNumberAuto(Pi);
            break;
            
        // Функция P (корень из суммы квадратов)
        case /p$/.test(value):
            currentOperation = value;
            tempExpression = "sqrt(" + currentNumber + "^2+";
            currentNumber = "";
            break;
            
        // Инвертирование знака
        case /negate$/.test(value):
            if (currentNumber) {
                currentNumber = (parseFloat(currentNumber) * -1).toString();
                currentExpression += "(-1)";
            }
            break;
            
        // Логарифм по основанию 10
        case /lg$/.test(value):
            currentOperation = value;
            if (currentExpression.endsWith(")")) {
                temp = extractBrackets(currentExpression);
                console.log("temp.lastBrackets: " + temp.lastBrackets);
                currentExpression =
                    temp.updatedExpression + "log10" + temp.lastBrackets;
            } else {
                console.log("LG CHECK NO BRACKETS )");
                if (currentExpression != currentNumber) {
                    lgFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Натуральный логарифм
        case /ln$/.test(value):
            currentOperation = value;
            if (currentExpression.endsWith(")")) {
                temp = extractBrackets(currentExpression);
                console.log("ln temp.lastBrackets: " + temp.lastBrackets);
                currentExpression =
                    temp.updatedExpression + "log" + temp.lastBrackets;
            } else {
                console.log("Ln CHECK NO BRACKETS )");
                if (currentExpression != currentNumber) {
                    lnFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Синус
        case /sin$/.test(value):
            currentOperation = value;
            if (arcFlag) {
                // Арксинус
                if (currentExpression.endsWith(")")) {
                    temp = extractBrackets(currentExpression);
                    currentExpression = temp.updatedExpression + "asin" + temp.lastBrackets;
                } else {
                    sinFlag = 1;
                    bracketFlagCheck("arcsin");
                }
                arcFlag = 0;
            } else {
                // Обычный синус
                if (currentExpression.endsWith(")")) {
                    temp = extractBrackets(currentExpression);
                    currentExpression = temp.updatedExpression + "sin" + temp.lastBrackets;
                } else {
                    sinFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Косинус
        case /cos$/.test(value):
            currentOperation = value;
            if (arcFlag) {
                // Арккосинус
                if (currentExpression.endsWith(")")) {
                    temp = extractBrackets(currentExpression);
                    currentExpression = temp.updatedExpression + "acos" + temp.lastBrackets;
                } else {
                    cosFlag = 1;
                    bracketFlagCheck("arccos");
                }
                arcFlag = 0;
            } else {
                // Обычный косинус
                if (currentExpression.endsWith(")")) {
                    temp = extractBrackets(currentExpression);
                    currentExpression = temp.updatedExpression + "cos" + temp.lastBrackets;
                } else {
                    cosFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Тангенс
        case /tg$/.test(value):
            currentOperation = value;
            if (arcFlag) {
                // Арктангенс
                if (currentExpression.endsWith(")")) {
                    temp = extractBrackets(currentExpression);
                    currentExpression = temp.updatedExpression + "atan" + temp.lastBrackets;
                } else {
                    tgFlag = 1;
                    bracketFlagCheck("arctg");
                }
                arcFlag = 0;
            } else {
                // Обычный тангенс
                if (currentExpression.endsWith(")")) {
                    temp = extractBrackets(currentExpression);
                    currentExpression = temp.updatedExpression + "tan" + temp.lastBrackets;
                } else {
                    tgFlag = 1;
                    bracketFlagCheck(value);
                }
            }
            currentNumber = "";
            break;
            
        // Режим арк-функций
        case /arc$/.test(value):
            arcFlag = 1;
            break;
            
        // Экспонента (e^x)
        case /exp_degree$/.test(value):
            currentOperation = value;
            if (currentExpression.endsWith(")")) {
                temp = extractBrackets(currentExpression);
                currentExpression = temp.updatedExpression + `(${e_const})^` + temp.lastBrackets;
            } else {
                expFlag = 1;
                bracketFlagCheck(value);
            }
            currentNumber = "";
            break;
            
        // Обратное число (1/x)
        case /reverse$/.test(value):
            if (currentNumber && currentNumber !== "0") {
                inverseFlag = 1;
                bracketFlagCheck(value);
                currentNumber = "";
            } else if (currentExpression.endsWith(")")) {
                temp = extractBrackets(currentExpression);
                currentExpression = temp.updatedExpression + "1/" + temp.lastBrackets;
                currentNumber = "";
            }
            break;
            
        // Квадратный корень
        case /sqrt$/.test(value):
            if (currentExpression.endsWith(")")) {
                temp = extractBrackets(currentExpression);
                currentExpression = temp.updatedExpression + "sqrt" + temp.lastBrackets;
            } else {
                currentExpression += "sqrt(" + currentNumber + ")";
                currentNumber = "";
            }
            break;
            
        // Возведение в степень y
        case /y_degree$/.test(value):
            if (currentNumber) {
                yDegreeFlag = 1;
                tempRegister = currentNumber;
                currentNumber = "";
            }
            break;
            
        // Запись в память (ЗП)
        case /zap$/.test(value):
            if (currentNumber) {
                register1 = currentNumber;
                zapFlag = 1;
                try {
                    // logger.logMemoryState({ action: 'save', register: 'register1', value: register1 });
                } catch (e) {
                    console.error('Ошибка логирования:', e);
                }
            }
            break;
            
        // Вызов из памяти (ВП)
        case /vp$/.test(value):
            if (zapFlag) {
                currentNumber = register1;
                try {
                    // logger.logMemoryState({ action: 'recall', register: 'register1', value: register1 });
                } catch (e) {
                    console.error('Ошибка логирования:', e);
                }
            }
            break;
            
        // Вычисление результата
        case /=$/.test(value):
            if (!currentExpression.endsWith(currentNumber)) {
                if (!currentExpression.endsWith(currentNumber + ")")) {
                    console.log(
                        "= currentExpression не оканчивается на currentNumber\ncurrentNumber:" +
                            currentNumber +
                            "\ncurrentExpression: " +
                            currentExpression
                    );
                currentExpression += currentNumber;}
            }
            if (bracketCheck(currentExpression) == ">")
                currentExpression += ")";
            else if (bracketCheck(currentExpression) == "<") {
                currentExpression = "(" + currentExpression; // я пока хз работает ли
            }
            calculateResult();
            break;

        default:
            console.warn("Неизвестный ввод: " + value);
            break;
    }

    updateScreen();
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
    switch (true) {
        case value == "p":
            currentExpression += tempExpression + currentNumber + "^2)";
            tempExpression = "";
            break;
        case lgFlag == 1:
            currentExpression += "log10(" + currentNumber + ")";
            lgFlag = 0;
            break;
        case lnFlag == 1:
            currentExpression += "log(" + currentNumber + ")";
            lnFlag = 0;
            break;
        case sinFlag == 1:
            if (value === "arcsin") {
                currentExpression += "asin(" + currentNumber + ")";
            } else {
                currentExpression += "sin(" + currentNumber + ")";
            }
            sinFlag = 0;
            break;
        case cosFlag == 1:
            if (value === "arccos") {
                currentExpression += "acos(" + currentNumber + ")";
            } else {
                currentExpression += "cos(" + currentNumber + ")";
            }
            cosFlag = 0;
            break;
        case tgFlag == 1:
            if (value === "arctg") {
                currentExpression += "atan(" + currentNumber + ")";
            } else {
                currentExpression += "tan(" + currentNumber + ")";
            }
            tgFlag = 0;
            break;
        case expFlag == 1:
            currentExpression += `(${e_const})^(` + currentNumber + ")";
            expFlag = 0;
            break;
        case inverseFlag == 1:
            currentExpression += "1/(" + currentNumber + ")";
            inverseFlag = 0;
            break;
        case yDegreeFlag == 1:
            currentExpression += tempRegister + "^(" + currentNumber + ")";
            yDegreeFlag = 0;
            tempRegister = "";
            break;
        default:
            console.warn("Неизвестный ввод (bracketFlagCheck): " + value);
            break;
    }
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
 * Вычисление результата выражения
 */
function calculateResult() {
    try {
        if (currentExpression != "") {
            console.log("Try evaluation:\n" + currentExpression);
            
            // Выводим историю нажатий кнопок перед вычислением
            printButtonHistory();
            
            let result;
            
            // Используем парсер для вычисления выражения
            if (typeof window.parser !== 'undefined' && window.parser) {
                // Преобразуем выражение в токены
                const tokens = window.parser.parseExpression(currentExpression);
                console.log("Parsed tokens:", tokens);
                
                // Вычисляем результат
                result = window.parser.rez(tokens);
            } else if (typeof math !== 'undefined' && math) {
                // Запасной вариант с math.js
                result = math.evaluate(currentExpression);
            } else {
                throw new Error("Не найдены библиотеки для вычислений");
            }
            
            if (result !== undefined && !isNaN(result)) {
                currentNumber = result.toString();
                currentExpression = currentNumber;
                
                try {
                    // logger.logOperation('calculate', [currentExpression], result);
                } catch (e) {
                    console.error('Ошибка логирования:', e);
                }
            } else {
                throw new Error("Результат вычисления некорректен");
            }
        }
    } catch (error) {
        console.error(
            "Ошибка вычисления:",
            error,
            "\nВыражение:",
            currentExpression,
            "\nТекущее число:",
            currentNumber,
            "\nТекущая операция:",
            currentOperation
        );
        currentNumber = errorMessage; // Отображение ошибки на экране
        
        try {
            // logger.logError('calculate', error, { expression: currentExpression });
        } catch (e) {
            console.error('Ошибка логирования:', e);
        }
    }
    console.log("calculation currentNumber: " + currentNumber);
    updateScreen();
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
        currentExpression = "(-1)-896523*3";
        console.log("Тестовое выражение 1:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
        // Тест 2: -1-896523*3
        clearAll();
        currentExpression = "-1-896523*3";
        console.log("Тестовое выражение 2:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
        // Тест 3: (-1)-(896523*3)
        clearAll();
        currentExpression = "(-1)-(896523*3)";
        console.log("Тестовое выражение 3:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
        // Тест 4: -1-(896523*3)
        clearAll();
        currentExpression = "-1-(896523*3)";
        console.log("Тестовое выражение 4:", currentExpression);
        calculateResult();
        console.log("Результат:", currentNumber);
        
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
            console.log(`Состояние до нажатия: currentExpression="${currentExpression}", currentNumber="${currentNumber}"`);
            
            handleInput(key);
            
            console.log(`Состояние после нажатия: currentExpression="${currentExpression}", currentNumber="${currentNumber}"`);
        }
        
        console.log("\n=== РЕЗУЛЬТАТ СИМУЛЯЦИИ ===");
        console.log(`Итоговое выражение: ${currentExpression}`);
        console.log(`Итоговое число на экране: ${currentNumber}`);
        console.log("=== КОНЕЦ СИМУЛЯЦИИ ===");
        
        return {
            expression: currentExpression,
            number: currentNumber
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
