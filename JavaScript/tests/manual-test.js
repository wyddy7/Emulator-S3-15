/**
 * manual-test.js - Скрипт для ручного тестирования калькулятора
 * Этот скрипт можно запустить в консоли браузера для проверки работы калькулятора
 */

// Функция для симуляции нажатия кнопки
function simulateButtonClick(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        console.log(`Нажата кнопка: ${buttonId}`);
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        button.dispatchEvent(event);
    } else {
        console.error(`Кнопка с ID ${buttonId} не найдена`);
    }
}

// Функция для получения текущего значения на экране
function getDisplayValue() {
    const display = document.getElementById('screen');
    if (display) {
        return display.textContent;
    } else {
        console.error('Элемент экрана не найден');
        return null;
    }
}

// Функция для тестирования деления на π
function testDivisionByPi() {
    console.log('=== Тест деления на π ===');
    
    // Очистка калькулятора
    simulateButtonClick('btn_c');
    console.log(`Экран после очистки: ${getDisplayValue()}`);
    
    // Ввод числа 10
    simulateButtonClick('btn_1');
    simulateButtonClick('btn_0');
    console.log(`Экран после ввода 10: ${getDisplayValue()}`);
    
    // Нажатие кнопки деления
    simulateButtonClick('btn_division');
    console.log(`Экран после нажатия деления: ${getDisplayValue()}`);
    
    // Нажатие кнопки π
    simulateButtonClick('btn_pi');
    console.log(`Экран после нажатия π: ${getDisplayValue()}`);
    
    // Нажатие кнопки =
    simulateButtonClick('btn_equals');
    console.log(`Результат деления 10 на π: ${getDisplayValue()}`);
    
    // Ожидаемый результат: примерно 3.183098861837907
    console.log('Ожидаемый результат: 3.183098861837907');
}

// Функция для тестирования умножения на π
function testMultiplicationByPi() {
    console.log('=== Тест умножения на π ===');
    
    // Очистка калькулятора
    simulateButtonClick('btn_c');
    console.log(`Экран после очистки: ${getDisplayValue()}`);
    
    // Ввод числа 2
    simulateButtonClick('btn_2');
    console.log(`Экран после ввода 2: ${getDisplayValue()}`);
    
    // Нажатие кнопки умножения
    simulateButtonClick('btn_multiply');
    console.log(`Экран после нажатия умножения: ${getDisplayValue()}`);
    
    // Нажатие кнопки π
    simulateButtonClick('btn_pi');
    console.log(`Экран после нажатия π: ${getDisplayValue()}`);
    
    // Нажатие кнопки =
    simulateButtonClick('btn_equals');
    console.log(`Результат умножения 2 на π: ${getDisplayValue()}`);
    
    // Ожидаемый результат: примерно 6.283185307179586
    console.log('Ожидаемый результат: 6.283185307179586');
}

// Функция для запуска всех тестов
function runAllTests() {
    console.log('=== Запуск всех тестов ===');
    testDivisionByPi();
    console.log('');
    testMultiplicationByPi();
    console.log('=== Все тесты завершены ===');
}

// Экспорт функций для использования в консоли браузера
if (typeof window !== 'undefined') {
    window.simulateButtonClick = simulateButtonClick;
    window.getDisplayValue = getDisplayValue;
    window.testDivisionByPi = testDivisionByPi;
    window.testMultiplicationByPi = testMultiplicationByPi;
    window.runAllTests = runAllTests;
    
    console.log('Скрипт для ручного тестирования загружен.');
    console.log('Доступные функции:');
    console.log('- simulateButtonClick(buttonId) - симуляция нажатия кнопки');
    console.log('- getDisplayValue() - получение текущего значения на экране');
    console.log('- testDivisionByPi() - тест деления на π');
    console.log('- testMultiplicationByPi() - тест умножения на π');
    console.log('- runAllTests() - запуск всех тестов');
} 