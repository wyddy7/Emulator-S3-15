let currentExpression = ""; // Глобальное выражение для ввода
let currentNumber = ""; // Переменная для хранения текущего числа
let currentOperation = ""; 
let currentRegularBrackets = "";
let Pi = 3.1415926535;
let exp = 2.718281828459;
let countP = 0;
let errorMessage = "............";

let register1 = "";
let register2 = "";
let registerFlag1 = 0;
let registerFlag2 = 0;
let zapFlag = 0;
let tempRegister = "";
// let firstRegister = "";
// let firstRegisterFlag = 0;
// let secondRegister = "";
// let secondRegisterFlag = 0;

const screenText = document.querySelector(".screen_text");

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
        return num.toExponential(9).replace(/[eE]/, " "); // Экспоненциальный формат с 6 знаками в мантиссе
    }
}
// Обновление экрана
function updateScreen() {
    const currentReg = currentNumber;
    // Форматируем число в зависимости от значения
    const displayValue = formatNumberAuto(currentReg || "0");
    screenText.textContent = displayValue;
}

// Очистка экрана
function clearAll() {
    currentExpression = "";
    currentNumber = "";
    updateScreen();
}

// Обработка ввода чисел и операторов с использованием switch
function handleInput(value) {
    switch (true) {
        // Ввод цифр и точки
        case /[0-9.]/.test(value):
            if (/^0.$/.test(currentExpression)) {
                currentExpression = currentExpression.replace("0", "");
            }
            // if (/1$/.test(value)) {

            // } else if (/2$/.test(value)) {

            // } else {
            //     currentNumber += value;
            //     currentExpression += value;
            // }
            currentNumber += value;
            break;

        // Ввод операторов (+, -, *, /)
        case /[\-+/*/]/.test(value):
            currentOperation = value;
            currentExpression += currentNumber + value;
            currentNumber = "";
            break;

        // Открывающая скобка
        case /[(]/.test(value):
            currentRegularBrackets += value;
            currentExpression += value;
            currentNumber = "";
            break;

        // Закрывающая скобка
        case /[)]/.test(value):
            const openBrackets = (currentExpression.match(/\(/g) || []).length;
            const closeBrackets = (currentExpression.match(/\)/g) || []).length;
            if (openBrackets > closeBrackets) {
                currentExpression += value;
                currentNumber = "";
            } else if (openBrackets === closeBrackets) {
                currentExpression = "(" + currentExpression + value;
                currentNumber = "";
            }
            break;

        // Очистка последнего числа
        case /cx$/.test(value):
            currentExpression = currentExpression.slice(
                0,
                -currentNumber.length
            );
            currentNumber = "";
            break;

        // Запоминание (zap)
        case /zap/.test(value):
            zapFlag = 1;
            break;

        // Константа pi
        case /pi$/.test(value):
            currentExpression += Pi;
            currentNumber = formatNumberAuto(Pi);
            break;

        // Инвертирование знака
        case /negate$/.test(value):
            if (currentNumber) {
                currentNumber = (parseFloat(currentNumber) * -1).toString();
                currentExpression += "(-1)";
            }
            break;

        // Корень квадратный
        case /sqrt$/.test(value):
            currentExpression = "sqrt(" + currentExpression + ")";
            break;

        // Логарифм (ln)
        case /ln$/.test(value):
            currentExpression = "log(" + currentExpression + ")";
            currentNumber = "";
            break;
        case /lg$/.test(value):
            currentExpression = "log10(" + currentExpression + ")";
            currentNumber = "";
            break;

        default:
            console.warn("Неизвестный ввод: " + value);
            break;
    }

    updateScreen();
}

function bracketFlagCheck(value) {
    switch (true)  {
        case /\/p\//.test(value):
            currentExpression += currentNumber + "^2)";
            break;
        case /lg$/.test(value):
            break;

        default:
            console.warn("Неизвестный ввод: " + value);
            break;
       
    }
}

// Обработка вычисления результата
function calculateResult() {
    const temp = "log(10)";
    console.log("Irr: "+ math.evaluate(temp));
    try {
        if (currentExpression != "") {
            if (countP == 1) {
                currentExpression += ")^2)";
                countP = 0;
            }
            // if (firstRegisterFlag === 1 && /[+\-/*]$/.test(currentExpression)) {
            //     currentExpression += firstRegister;
            // } else if (
            //     secondRegisterFlag === 1 &&
            //     /[+\-/*]$/.test(currentExpression)
            // ) {
            //     currentExpression += firstRegister;
            // }
            const openBrackets = (currentExpression.match(/\(/g) || []).length;
            const closeBrackets = (currentExpression.match(/\)/g) || []).length;
            // Добавляем закрывающую скобку только если баланс позволяет
            if (openBrackets > closeBrackets) {
                currentExpression += ")";
            }

            // Использование math.js для безопасного вычисления
            console.log("Try evaluation:\n" + currentExpression);

            const result = math.evaluate(currentExpression);
            currentNumber = result.toString();
            currentExpression = currentNumber;
        } // Обновить выражение для дальнейшего использования
    } catch (error) {
        currentNumber = errorMessage; // Отображение ошибки на экране
        console.log(
            "ERROR" +
                "\n" +
                "currentExpression: " +
                currentExpression +
                "\n" +
                "currentNumber: " +
                currentNumber +
                "\n" +
                "currentRegisters:" +
                "\n\t" +
                "firstRegister: " +
                firstRegister +
                " (flag:" +
                firstRegisterFlag +
                ")" +
                "\n\t" +
                "secondRegister: " +
                secondRegister +
                " (flag:" +
                secondRegisterFlag +
                ")"
        );
    }
    updateScreen();
}

// Привязка кнопок
document
    .getElementById("btn_0")
    .addEventListener("click", () => handleInput("0"));
document
    .getElementById("btn_1")
    .addEventListener("click", () => handleInput("1"));
document
    .getElementById("btn_2")
    .addEventListener("click", () => handleInput("2"));
document
    .getElementById("btn_3")
    .addEventListener("click", () => handleInput("3"));
document
    .getElementById("btn_4")
    .addEventListener("click", () => handleInput("4"));
document
    .getElementById("btn_5")
    .addEventListener("click", () => handleInput("5"));
document
    .getElementById("btn_6")
    .addEventListener("click", () => handleInput("6"));
document
    .getElementById("btn_7")
    .addEventListener("click", () => handleInput("7"));
document
    .getElementById("btn_8")
    .addEventListener("click", () => handleInput("8"));
document
    .getElementById("btn_9")
    .addEventListener("click", () => handleInput("9"));
document.getElementById("btn_clear").addEventListener("click", clearAll);
document
    .getElementById("btn_dot")
    .addEventListener("click", () => handleInput("."));
document
    .getElementById("btn_plus")
    .addEventListener("click", () => handleInput("+"));
document
    .getElementById("btn_minus")
    .addEventListener("click", () => handleInput("-"));
document
    .getElementById("btn_multiply")
    .addEventListener("click", () => handleInput("*"));
document
    .getElementById("btn_division")
    .addEventListener("click", () => handleInput("/"));
document
    .getElementById("btn_left_bracket")
    .addEventListener("click", () => handleInput("("));
document
    .getElementById("btn_right_bracket")
    .addEventListener("click", () => handleInput(")"));
document.getElementById("btn_equal").addEventListener("click", calculateResult);
document
    .getElementById("btn_sqrt")
    .addEventListener("click", () => handleInput("sqrt("));
document
    .getElementById("btn_exp_degree")
    .addEventListener("click", () => handleInput("^"));
document
    .getElementById("btn_reverse")
    .addEventListener("click", () => handleInput("reverse"));
document
    .getElementById("btn_negate")
    .addEventListener("click", () => handleInput("negate"));
document
    .getElementById("btn_p")
    .addEventListener("click", () => handleInput("p"));
document
    .getElementById("btn_lg")
    .addEventListener("click", () => handleInput("lg"));
document
    .getElementById("btn_ln")
    .addEventListener("click", () => handleInput("ln"));
document
    .getElementById("btn_pi")
    .addEventListener("click", () => handleInput("pi"));
document
    .getElementById("btn_zap")
    .addEventListener("click", () => handleInput("zap"));
document
    .getElementById("btn_sch")
    .addEventListener("click", () => handleInput("sch"));
document
    .getElementById("btn_cx")
    .addEventListener("click", () => handleInput("cx"));
document
    .getElementById("btn_sqrt")
    .addEventListener("click", () => handleInput("sqrt"));
