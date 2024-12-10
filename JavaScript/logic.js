const pages = [
    {
        title_1: "Подготовка к работе",
        title_2: "Ввод чисел",
        text_1: "Перед началом работы обязательно нажмите клавишу C для очистки калькулятора и перехода в исходное состояние.",
        text_2: "Вводите числа с десятичной запятой или в нормализованном виде. Нормализованное число представляется как M * 10^P.",
        text_3: "Для ввода такого числа используйте формат: M ВР P, где: M — мантисса, ВР — кнопка для ввода порядка (экспоненты), P — значение порядка.",
        text_4: "Nihua",
    },
    {
        title_1: "Ввод 2 аргументов",
        title_2: "Выполнение сложных выражений",
        text_1: "Аргумент тригонометрических функций вводится в радианах. Для перевода углов в радианы можно использовать формулу.",
        text_2: "Для выполнения выражений с несколькими операциями, например: --",
        text_3: "необходимо строго соблюдать порядок действий, используя кнопки калькулятора последовательно для выполнения каждой части выражения.",
        text_4: "",
    },
    {
        title_1: "Ввод 3 аргументов",
        title_2: "Выполнение сложных выражений",
        text_1: "Аргумент тригонометрических функций вводится в радианах. Для перевода углов в радианы можно использовать формулу.",
        text_2: "Для выполнения выражений с несколькими операциями, например: --",
        text_3: "необходимо строго соблюдать порядок действий, используя кнопки калькулятора последовательно для выполнения каждой части выражения.",
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
