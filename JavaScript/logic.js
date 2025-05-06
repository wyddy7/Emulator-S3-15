/* --- Старая логика пагинации (будет удалена/заменена) --- */
/*
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
*/
/* --- Конец старой логики пагинации --- */


// --- Логика для новой инструкции --- 

// Новый формат данных инструкции
const rewrittenInstructionData = {
    title: "Инструкция Электроника С3-15",
    sections: [
        {
            title: "1. Начало работы и ввод чисел",
            content: [
                { type: 'p', text: "Перед началом вычислений всегда нажимайте {button:C} (Сброс) для очистки регистров и установки калькулятора в исходное состояние." },
                { type: 'p', text: "Числа можно вводить в обычном формате (с десятичной точкой) или в научном (экспоненциальном) виде." },
                { 
                    type: 'list', 
                    items: [
                        "Обычный ввод: Просто набирайте цифры. Для ввода десятичной точки используйте кнопку {button:.}. Для смены знака числа используйте {button:+/-}.",
                        "Научный формат (M × 10^P): Введите мантиссу M, нажмите {button:ВП} (Ввод Порядка), затем введите порядок P (можно со знаком). Например, для ввода 1.23 × 10^-4 нажмите: {button:1} {button:.} {button:2} {button:3} {button:ВП} {button:+/-} {button:4}."
                    ] 
                },
                { type: 'p', text: "Максимальное количество цифр при вводе: 8 для мантиссы и 2 для порядка." }
            ]
        },
        {
            title: "2. Основные арифметические операции",
            content: [
                 { type: 'p', text: "Для выполнения сложения {button:+}, вычитания {button:-}, умножения {button:*} и деления {button:/} используйте соответствующие кнопки." },
                 { type: 'p', text: "Порядок выполнения операций стандартный алгебраический (умножение/деление имеют приоритет над сложением/вычитанием)." },
                 { 
                    type: 'list', 
                    items: [
                        "Пример (2 + 3 * 4): Нажмите {button:2} {button:+} {button:3} {button:*} {button:4} {button:=}. Результат: 14.",
                        "Для изменения порядка используйте промежуточное нажатие {button:=} или регистры памяти (см. раздел Память)." ,
                        "Цепочечные вычисления: После получения результата можно сразу нажать кнопку следующей операции для продолжения вычислений с этим результатом. Например: {button:2} {button:*} {button:3} {button:=} (результат 6) {button:+} {button:4} {button:=} (результат 10)."
                    ] 
                },
                 { type: 'p', text: "Кнопка {button:=} завершает вычисление текущей операции или цепочки операций." }
            ]
        },
        // --- Новые секции --- 
        {
            title: "3. Функции одного аргумента (Часть 1)",
            content: [
                { type: 'p', text: "Эти функции применяются к числу на дисплее сразу после нажатия кнопки. Результат заменяет исходное число."}, 
                { 
                    type: 'list', 
                    items: [
                        "{button:1/x}: Вычисляет обратное значение (1 делить на число). Ошибка, если на дисплее 0.",
                        "{button:√x}: Вычисляет квадратный корень. Ошибка, если число отрицательное.",
                        "{button:x²}: Возводит число в квадрат (добавлено для удобства, т.к. нет кнопки x^y с фиксированной 2).", // Предполагаем, что x^2 логично добавить
                        "{button:e^x}: Вычисляет экспоненту (e в степени числа на дисплее).",
                        "{button:ln}: Натуральный логарифм (основание e). Ошибка, если число <= 0.",
                        "{button:lg}: Десятичный логарифм (основание 10). Ошибка, если число <= 0."
                    ]
                }
            ]
        },
        {
            title: "4. Функции одного аргумента (Часть 2: Тригонометрия)",
            content: [
                { type: 'p', text: "Важно: Все тригонометрические функции работают с углами в **радианах**."}, 
                { 
                    type: 'list', 
                    items: [
                        "{button:sin}: Синус угла.",
                        "{button:cos}: Косинус угла.",
                        "{button:tan} / {button:tg}: Тангенс угла. Ошибка в точках π/2 + πk.",
                        "{button:arc} {button:sin}: Арксинус (результат в радианах от -π/2 до +π/2). Ошибка, если |число| > 1.",
                        "{button:arc} {button:cos}: Арккосинус (результат в радианах от 0 до π). Ошибка, если |число| > 1.",
                        "{button:arc} {button:tan} / {button:arc} {button:tg}: Арктангенс (результат в радианах от -π/2 до +π/2)."
                    ] 
                },
                { type: 'p', text: "Кнопка {button:arc} переключает режим для следующих кнопок sin, cos, tan на обратные функции (arcsin, arccos, arctan). Повторное нажатие {button:arc} возвращает обычный режим."}, 
                { type: 'p', text: "Кнопка {button:π} выводит на дисплей значение числа Пи (≈3.14159...)."}
            ]
        },
        // --- Секция Памяти --- 
        {
            title: "5. Работа с памятью",
            content: [
                { type: 'p', text: "Калькулятор имеет два независимых регистра памяти (условно Память 1 и Память 2)."}, 
                { type: 'p', text: "Для работы с памятью используются кнопки {button:ЗАП} (Записать в Память) и {button:СЧ} (Считать из Памяти) в сочетании с цифровыми клавишами {button:1} или {button:2}."}, 
                { 
                    type: 'list', 
                    items: [
                        "Запись в Память 1: Нажмите {button:ЗАП} затем {button:1}. Число с дисплея скопируется в регистр Памяти 1.",
                        "Запись в Память 2: Нажмите {button:ЗАП} затем {button:2}. Число с дисплея скопируется в регистр Памяти 2.",
                        "Чтение из Памяти 1: Нажмите {button:СЧ} затем {button:1}. Число из регистра Памяти 1 скопируется на дисплей, заменив текущее значение.",
                        "Чтение из Памяти 2: Нажмите {button:СЧ} затем {button:2}. Число из регистра Памяти 2 скопируется на дисплей."
                    ]
                },
                { type: 'p', text: "Важно: Операции с памятью не влияют на текущее вычисление (если оно не завершено нажатием {button:=}). Значение на дисплее просто копируется в память или из памяти."}, 
                { type: 'p', text: "Очистка: Регистры памяти **не очищаются** кнопкой {button:C}. Для очистки используйте запись нуля: {button:0} {button:ЗАП} {button:1} (для Памяти 1)."}
            ]
        },
        // --- Секция Сложных вычислений и Сброс --- 
        {
            title: "6. Сложные вычисления и Сброс",
            content: [
                { type: 'p', text: "Калькулятор использует стековую организацию для обработки порядка операций, что позволяет вводить выражения в естественной алгебраической форме."}, 
                { type: 'p', text: "При вводе выражения типа `A op1 B op2 C` (где `op2` имеет более высокий приоритет, чем `op1`), калькулятор автоматически сохраняет `A` и `op1` в стеке, вычисляет `B op2 C`, а затем применяет `op1` к результату."}, 
                { type: 'p', text: "Кнопка {button:C} (Сброс) полностью очищает дисплей, регистры X и Y (внутренние регистры калькулятора), снимает все активные операции и режимы (например, {button:arc}). **Регистры памяти (1 и 2) не очищаются.** Используйте {button:C} перед началом нового независимого вычисления."}, 
                { type: 'p', text: "Кнопка {button:Cx} (Сброс X) очищает только дисплей (регистр X), позволяя ввести новое число вместо предыдущего, не прерывая текущей операции. Например, если вы ввели `2 + 5` но хотели `2 + 6`, нажмите {button:Cx} {button:6} {button:=}."}
            ]
        }
    ],
    examples: [
        // Используем изображения как запрошено
        { type: 'h3', text: 'Таблицы операций и примеры'}, // Общий заголовок для изображений
        { type: 'image', src: 'images/image30.png', alt: 'Таблица 1: Основные операции'}, 
        { type: 'image', src: 'images/image15.png', alt: 'Таблица 2: Функции и преобразования'}, 
        { type: 'image', src: 'images/image16.png', alt: 'Пример работы с памятью'}, 
        { type: 'image', src: 'images/image20.png', alt: 'Сложные примеры 4-6'}, // Порядок может быть не тот, что в файле
        { type: 'image', src: 'images/image27.png', alt: 'Сложные примеры 1-3'}, // Порядок может быть не тот, что в файле
         // image30 повторяется? Пропускаем
    ],
    constraints: [
        // Используем изображение для ОДЗ
        { type: 'h3', text: 'Область допустимых значений (ОДЗ)'}, 
        { type: 'image', src: 'images/image37.png', alt: 'Таблица ОДЗ'}
    ] 
};


// let parsedInstructionData = null; // Больше не используем парсер
let currentInstructionSectionIndex = 0;

// Получаем ссылки на элементы UI инструкции
const instructionTabsContainer = document.querySelector('.instruction-tabs');
const tabButtons = document.querySelectorAll('.tab-button');
const instructionTabContent = document.getElementById('instruction-tab-content');
const examplesTabContent = document.getElementById('examples-tab-content');
const instructionSectionContent = document.getElementById('instruction-section-content');
const instructionPrevBtn = document.getElementById('instruction-prev-btn');
const instructionNextBtn = document.getElementById('instruction-next-btn');
const instructionPageInfo = document.getElementById('instruction-page-info');

// --- Новая функция для рендеринга контента с обработкой кнопок ---
function renderContentItem(item) {
    let element;
    if (item.type === 'p') {
        element = document.createElement('p');
        // Заменяем {button:TEXT} на <span class="inline-button">TEXT</span> (только для основного текста инструкции)
        element.innerHTML = item.text.replace(/\{button:([^}]+)\}/g, '<span class="inline-button">$1</span>');
    } else if (item.type === 'list') {
        element = document.createElement('ul');
        item.items.forEach(listItemText => {
            const li = document.createElement('li');
            // Заменяем {button:TEXT} и здесь
            li.innerHTML = listItemText.replace(/\{button:([^}]+)\}/g, '<span class="inline-button">$1</span>');
            element.appendChild(li);
        });
    } else if (item.type === 'image') { // Обработка изображения
         element = document.createElement('img');
         element.src = item.src;
         element.alt = item.alt || '';
         // Стили для img применяются через CSS (.instruction-content-area img)
    } else if (item.type === 'h3') { 
        element = document.createElement('h3');
        element.textContent = item.text;
    } 
    // Убрали обработку таблиц
    
    return element;
}

// Функция отображения контента секции инструкции (Работает только с sections)
function displayInstructionSection(index) {
    const data = rewrittenInstructionData; 

    if (!data || !data.sections || data.sections.length === 0) {
        instructionSectionContent.innerHTML = '<p>Нет данных для отображения.</p>';
        instructionPageInfo.textContent = 'Страница 0 / 0';
        instructionPrevBtn.disabled = true;
        instructionNextBtn.disabled = true;
        return;
    }
     if (index < 0 || index >= data.sections.length) {
         console.warn(`Некорректный индекс секции: ${index}`);
         return;
     }

    const section = data.sections[index];
    instructionSectionContent.innerHTML = ''; 
    const titleElement = document.createElement('h2'); 
    titleElement.textContent = section.title;
    instructionSectionContent.appendChild(titleElement);
    section.content.forEach(item => {
        const renderedElement = renderContentItem(item);
        if (renderedElement) {
            instructionSectionContent.appendChild(renderedElement);
        }
    });

    // Обновляем пагинацию
    currentInstructionSectionIndex = index;
    const totalSections = data.sections.length; // Теперь считаем только sections
    instructionPageInfo.textContent = `Страница ${index + 1} / ${totalSections}`;
    instructionPrevBtn.disabled = index === 0;
    instructionNextBtn.disabled = index === totalSections - 1;
}

// Функция отображения контента примеров и ограничений (переписана под изображения)
function displayExamplesAndConstraints() {
    const data = rewrittenInstructionData;
    if (!data) return;
    
    examplesTabContent.innerHTML = ''; // Очищаем

    // Рендерим все элементы из data.examples
    if (data.examples && data.examples.length > 0) {
        data.examples.forEach(item => {
            const renderedElement = renderContentItem(item);
             if (renderedElement) {
                 examplesTabContent.appendChild(renderedElement);
             }
        });
    }

    // Рендерим все элементы из data.constraints
    if (data.constraints && data.constraints.length > 0) {
        // Добавляем разделитель или заголовок, если нужно
        const separator = document.createElement('hr'); // Например, горизонтальная линия
        separator.style.margin = '2em 0';
        examplesTabContent.appendChild(separator);

        data.constraints.forEach(item => {
            const renderedElement = renderContentItem(item);
             if (renderedElement) {
                 examplesTabContent.appendChild(renderedElement);
             }
        });
    }

     // Если оба пусты
     if (examplesTabContent.innerHTML === '') {
        examplesTabContent.innerHTML = '<p>Нет данных для отображения.</p>';
    }
}

// Получаем ссылку на контейнер пагинации
const instructionPaginationControls = document.querySelector('.instruction-pagination');

// Обработчик переключения вкладок (добавляем скрытие/показ пагинации)
instructionTabsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('tab-button')) {
        const targetTab = event.target.dataset.tab;

        tabButtons.forEach(button => button.classList.remove('active'));
        event.target.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if (targetTab === 'instruction') {
            instructionTabContent.classList.add('active');
            instructionPaginationControls.style.display = 'flex'; // Показываем пагинацию
        } else if (targetTab === 'examples') {
            examplesTabContent.classList.add('active');
            instructionPaginationControls.style.display = 'none'; // Скрываем пагинацию
        }
    }
});


console.log("Используем переписанные данные инструкции...");

// Отображаем первую секцию инструкции и контент примеров/ограничений
displayInstructionSection(0); 
displayExamplesAndConstraints();
// Пагинация изначально видна, так как активна первая вкладка
instructionPaginationControls.style.display = 'flex'; 

// Добавляем обработчики для кнопок пагинации инструкции
instructionPrevBtn.addEventListener('click', () => {
    if (currentInstructionSectionIndex > 0) {
        displayInstructionSection(currentInstructionSectionIndex - 1);
    }
});

instructionNextBtn.addEventListener('click', () => {
    // Используем rewrittenInstructionData для проверки границ
    if (rewrittenInstructionData && currentInstructionSectionIndex < rewrittenInstructionData.sections.length - 1) {
        displayInstructionSection(currentInstructionSectionIndex + 1);
    }
});

// --- Конец логики для новой инструкции ---
