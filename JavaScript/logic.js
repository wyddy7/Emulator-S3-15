const pages = [
    {
        title_1: "Знакомство с калькулятором",
        title_2: "Первые шаги",
        text_1: "Нажмите C для включения. Экран покажет \"0.\"",
        text_2: "Введите число: 5 → нажмите + → введите 3 → нажмите = → результат: 8",
        text_3: "⚠️ Перед началом работы обязательно нажмите C для очистки всех регистров.",
        text_4: "",
    },
    {
        title_1: "Основные операции",
        title_2: "+ - × /",
        text_1: "+ складывает, - вычитает, × умножает, / делит. Введите первое число, оператор, второе число, затем =.",
        text_2: "⚠️ Без скобок: 8 + 2 + 2 × 0 + 9 = 9 (слева направо). Со скобками: 8 + 2 + (2 × 0) + 9 = 19. В скобках умножение × вычисляется первым, затем + и -.",
        text_3: "",
        text_4: "",
    },
    {
        title_1: "Специальные кнопки",
        title_2: "π, смена знака, очистка",
        text_1: "π — константа 3.14159... Нажмите кнопку π для вставки.",
        text_2: "± меняет знак (+ ↔ -). CX очищает текущий ввод, C очищает всё.",
        text_3: "",
        text_4: "",
    },
    {
        title_1: "Тригонометрия",
        title_2: "Sin, Cos, Tg и Arc",
        text_1: "Вводите углы в радианах. Примеры: sin(π/2) = 1, cos(0) = 1.",
        text_2: "ARC активирует обратные функции: введите 0.5 → нажмите ARC → SIN = получите угол (arcsin(0.5)).",
        text_3: "ArcFlag сбрасывается после одного использования.",
        text_4: "",
    },
    {
        title_1: "Логарифмы и степени",
        title_2: "Lg, Ln, e^x, y^x",
        text_1: "lg — десятичный (log₁₀), ln — натуральный (logₑ). exp вычисляет e^x.",
        text_2: "y^x возводит в степень: введите основание y → нажмите y^x → введите степень x → =.",
        text_3: "",
        text_4: "",
    },
    {
        title_1: "Корни и обратные",
        title_2: "√, 1/x, P",
        text_1: "√ извлекает квадратный корень. reverse вычисляет 1/x. Примеры: √16 = 4, reverse(5) = 0.2.",
        text_2: "P вычисляет √(x² + y²): введите первое число → P → второе число → =. Пример: 3 P 4 = 5 (теорема Пифагора).",
        text_3: "",
        text_4: "",
    },
    {
        title_1: "Память калькулятора",
        title_2: "ЗП, СЧ и регистры",
        text_1: "ЗП сохраняет в регистр. Нажмите число → ЗП → 1 (или 2 для второго регистра).",
        text_2: "СЧ читает из регистра. Нажмите СЧ → 1 (или 2). Выведется 0, если регистр пуст.",
        text_3: "",
        text_4: "",
    },
    {
        title_1: "Ввод порядка (ВП)",
        title_2: "Научная форма M × 10^P",
        text_1: "⚠️ ВП — это НЕ память! ВП переводит число в экспоненциальную форму.",
        text_2: "Нажмите число → ВП → введите 2 цифры порядка. ± меняет знак порядка.",
        text_3: "Пример: 5 ВП 23 означает 5 × 10²³. Используйте для очень больших или маленьких чисел.",
        text_4: "",
    },
];

let currentPageIndex = 0;
let lastPage = pages.length - 1;

const titleElement_1 = document.getElementById("page-title_1");
const titleElement_2 = document.getElementById("page-title_2");
const textElement_1 = document.getElementById("page-text_1");
const textElement_2 = document.getElementById("page-text_2");
const textElement_3 = document.getElementById("page-text_3");
const textElement_4 = document.getElementById("page-text_4");
const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");

// Функция для обновления контента страницы
function updatePage() {
    titleElement_1.textContent = pages[currentPageIndex].title_1;
    titleElement_2.textContent = pages[currentPageIndex].title_2;
    textElement_1.textContent = pages[currentPageIndex].text_1;
    textElement_2.textContent = pages[currentPageIndex].text_2;
    textElement_3.textContent = pages[currentPageIndex].text_3;
    textElement_4.textContent = pages[currentPageIndex].text_4;
    // console.log(currentPageIndex);

    // Блокируем кнопки на границах
    prevButton.disabled = currentPageIndex === 0;
    nextButton.disabled = currentPageIndex === lastPage;
}
function prevPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        updatePage();
    }
}
function nextPage() {
    if (currentPageIndex < lastPage) {
        currentPageIndex++;
        updatePage();
    }
}
// Обработчики для кнопок
prevButton.addEventListener("click", prevPage);
nextButton.addEventListener("click", nextPage);

// Инициализация начального состояния
updatePage();
