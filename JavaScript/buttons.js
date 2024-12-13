let currentExpression = ""; // Глобальное выражение для ввода
let currentNumber = ""; // Переменная для хранения текущего числа
let currentOperation = "";
let currentRegularBrackets = "";
let Pi = 3.1415926535;
let exp = 2.718281828459;
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

let openBrackets = 0;
let closeBrackets = 0;

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
        console.log("Exponential conversion has occurred.");

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
    currentOperation = "";
    currentRegularBrackets = "";
    lgFlag = lnFlag = sinFlag = cosFlag = tgFlag = 0;
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
            currentNumber += value;
            break;

        case /[\-+/*/]/.test(value):
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

        // Очистка последнего числа
        case /cx$/.test(value):
            // currentExpression = currentExpression.slice(
            //     0,
            //     -currentNumber.length
            // );
            currentNumber = "";
            break;
        case /c$/.test(value):
            clearAll();
            currentNumber = "";
            break;

        // Константа pi
        case /pi$/.test(value):
            currentExpression += Pi;
            currentNumber = formatNumberAuto(Pi);
            break;
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
            lgFlag = 0;
            break;
        case sinFlag == 1:
            currentExpression += "sin(" + currentNumber + ")";
            sinFlag = 0;
            break;
        default:
            console.warn("Неизвестный ввод (bracketFlagCheck): " + value);
            break;
    }
}

function isOperation(operation) {
    if (operation == "p") return 1;
    else return 0;
}

// Обработка вычисления результата
function calculateResult() {
    try {
        if (currentExpression != "") {
            // Использование math.js для безопасного вычисления
            console.log("Try evaluation:\n" + currentExpression);
            // console.log("calculation of result...");

            const result = math.evaluate(currentExpression);
            currentNumber = result.toString();
            currentExpression = currentNumber;
        } // Обновить выражение для дальнейшего использования
    } catch (error) {
        console.log(
            "ERROR CORRUPTED" +
                "\n" +
                "currentExpression: " +
                currentExpression +
                "\n" +
                "currentNumber: " +
                currentNumber +
                "\n" +
                "currentOperation: " +
                currentOperation +
                "\n"
        );
        currentNumber = errorMessage; // Отображение ошибки на экране
    }
    console.log("calculation currentNumber: " + currentNumber);
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
document
    .getElementById("btn_clear")
    .addEventListener("click", () => handleInput("c"));
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
document
    .getElementById("btn_equal")
    .addEventListener("click", () => handleInput("="));
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

/*
C
lg
ln
e^x
Cx
arc
sin
cos
tg
зап
1/x
sqrt()
/p/
y^x
сч
/-/ 
вп
*/
(() => {
    currentExpression = "3+4*(7*log10(sqrt(7^2+9^2)*(6-2))+6)";
    handleInput("=");
    console.log("Result must be: " + currentExpression + "\n\n");
    clearAll();
    handleInput("3");
    handleInput("+");
    handleInput("4");
    handleInput("*");
    handleInput("(");
    handleInput("7");
    handleInput("*");
    handleInput("(");
    handleInput("7");
    handleInput("p");
    handleInput("9");
    handleInput("*");
    handleInput("(");
    handleInput("6");
    handleInput("-");
    handleInput("2");
    handleInput(")");
    handleInput(")");
    handleInput("lg");
    handleInput("+");
    handleInput("6");
    handleInput("=");
    console.log("result is: " + currentExpression);
    handleInput("+");
    handleInput("9");
    handleInput("=");
    console.log("aftermath: " + currentExpression);
    handleInput("+");
    handleInput("140");
    handleInput("=");
    console.log("aftermath 2: " + currentExpression);
    handleInput("c");
    handleInput("5");
    handleInput("4");
    handleInput("0");
    handleInput("lg");
    handleInput("=");
    console.log("aftermath log10(540): " + currentExpression);
    handleInput("c");
    handleInput("1");
    handleInput("1");
    handleInput("ln");
    handleInput("=");
    console.log("aftermath log(11): " + currentExpression);
    handleInput("1");
    handleInput("1");
    handleInput("*");
    handleInput("2");
    handleInput("1");
    handleInput("=");
})();
