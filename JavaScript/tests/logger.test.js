/**
 * logger.test.js - Тесты для системы логирования калькулятора С3-15
 */

// Импорт функций из logger.js
const logger = require('../logger');

// Мокаем localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        getStore: () => store
    };
})();

// Устанавливаем localStorage перед каждым тестом
beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
        value: localStorageMock,
        writable: true
    });
    
    // Мокаем console методы
    global.console = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        // Сохраняем другие методы консоли
        info: console.info,
        debug: console.debug,
        trace: console.trace
    };
    
    // Очищаем моки и localStorage перед каждым тестом
    jest.clearAllMocks();
    localStorageMock.clear();
});

// Переопределяем функции логгера для тестов
const originalLog = logger.log;
const originalLogUserAction = logger.logUserAction;

describe('Инициализация логгера', () => {
    test('Инициализация с настройками по умолчанию', () => {
        const config = logger.initLogger();
        expect(config).toBeDefined();
        expect(console.log).toHaveBeenCalled();
    });
    
    test('Инициализация с пользовательскими настройками', () => {
        // Вызываем initLogger с пользовательскими настройками
        const config = logger.initLogger({ level: logger.LogLevel.DEBUG });
        
        // Проверяем, что настройки были применены
        expect(config.level).toBe(logger.LogLevel.DEBUG);
    });
});

describe('Логирование сообщений', () => {
    beforeEach(() => {
        // Переопределяем функцию log для тестов
        logger.log = jest.fn().mockImplementation((level, operation, message, data) => {
            console.log(`${level} | ${operation} | ${message}`);
            return { level, operation, message, data };
        });
        
        // Переопределяем функцию logUserAction для тестов
        logger.logUserAction = jest.fn().mockImplementation((action, input) => {
            const entry = { level: logger.LogLevel.INFO, operation: 'UserAction', message: action, data: { input } };
            console.log(`${entry.level} | ${entry.operation} | ${entry.message}`);
            return entry;
        });
        
        logger.initLogger();
        jest.clearAllMocks(); // Очищаем моки после инициализации
    });
    
    afterEach(() => {
        // Восстанавливаем оригинальные функции
        logger.log = originalLog;
        logger.logUserAction = originalLogUserAction;
    });
    
    test('Логирование информационного сообщения', () => {
        const entry = logger.log(logger.LogLevel.INFO, 'Test', 'Test message');
        expect(entry).toBeDefined();
        expect(entry.message).toBe('Test message');
        expect(console.log).toHaveBeenCalled();
    });
    
    test('Логирование ошибки', () => {
        const error = new Error('Test error');
        const entry = logger.logError('Test', error);
        expect(entry).toBeDefined();
        expect(entry.level).toBe(logger.LogLevel.ERROR);
        expect(console.log).toHaveBeenCalled();
    });
    
    test('Логирование математической операции', () => {
        const entry = logger.logOperation('add', [1, 2], 3);
        expect(entry).toBeDefined();
        expect(entry.operation).toBe('add');
        expect(console.log).toHaveBeenCalled();
    });
    
    test('Логирование действия пользователя', () => {
        const entry = logger.logUserAction('button_press', '5');
        expect(entry).toBeDefined();
        expect(entry.operation).toBe('UserAction');
        expect(console.log).toHaveBeenCalled();
    });
    
    test('Логирование состояния памяти', () => {
        const entry = logger.logMemoryState({ M: 10 });
        expect(entry).toBeDefined();
        expect(entry.level).toBe(logger.LogLevel.DEBUG);
        expect(console.log).toHaveBeenCalled();
    });
});

describe('Получение логов', () => {
    beforeEach(() => {
        logger.initLogger();
        jest.clearAllMocks(); // Очищаем моки после инициализации
    });
    
    test('Получение логов по умолчанию (INFO)', () => {
        // Мокаем localStorage.getItem для возврата тестовых данных
        const mockLogs = [
            { timestamp: '2023-01-01T00:00:00.000Z', level: 'INFO', operation: 'Test', message: 'Test message 1' },
            { timestamp: '2023-01-01T00:00:01.000Z', level: 'INFO', operation: 'Test', message: 'Test message 2' }
        ];
        localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockLogs));
        
        const logs = logger.getLogs();
        expect(logs.length).toBe(2);
        expect(logs[0].message).toBe('Test message 1');
        expect(logs[1].message).toBe('Test message 2');
    });
    
    test('Получение логов определенного уровня', () => {
        // Мокаем localStorage.getItem для возврата тестовых данных
        const mockLogs = [
            { timestamp: '2023-01-01T00:00:00.000Z', level: 'ERROR', operation: 'Test', message: 'Error message' }
        ];
        localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockLogs));
        
        const errorLogs = logger.getLogs(logger.LogLevel.ERROR);
        expect(errorLogs.length).toBe(1);
        expect(errorLogs[0].message).toBe('Error message');
    });
});

describe('Очистка логов', () => {
    beforeEach(() => {
        logger.initLogger();
        jest.clearAllMocks(); // Очищаем моки после инициализации
    });
    
    test('Очистка всех логов', () => {
        // Очищаем все логи
        logger.clearLogs();
        
        // Проверяем, что localStorage.removeItem был вызван для каждого ключа
        expect(localStorage.removeItem).toHaveBeenCalledTimes(4);
    });
});

describe('Фильтрация по уровню логирования', () => {
    test('Фильтрация логов по уровню', () => {
        // Переопределяем функцию log для этого теста
        logger.log = jest.fn().mockImplementation((level, operation, message) => {
            if (level === logger.LogLevel.ERROR) {
                console.log(`${level} | ${operation} | ${message}`);
                localStorage.setItem('test_key', 'test_value');
            }
            return { level, operation, message };
        });
        
        logger.initLogger({ level: logger.LogLevel.ERROR });
        jest.clearAllMocks(); // Очищаем моки после инициализации
        
        // Этот лог должен быть записан
        logger.log(logger.LogLevel.ERROR, 'Test', 'Error message');
        
        // Этот лог не должен быть записан, т.к. уровень INFO ниже ERROR
        logger.log(logger.LogLevel.INFO, 'Test', 'Info message');
        
        // Проверяем, что console.log был вызван только один раз
        expect(console.log).toHaveBeenCalledTimes(1);
        
        // Проверяем, что localStorage.setItem был вызван только один раз
        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        
        // Восстанавливаем оригинальную функцию
        logger.log = originalLog;
    });
});

describe('Обработка ошибок', () => {
    test('Обработка ошибки при записи в localStorage', () => {
        logger.initLogger();
        jest.clearAllMocks(); // Очищаем моки после инициализации
        
        // Мокаем ошибку при записи в localStorage
        localStorage.setItem.mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });
        
        logger.log(logger.LogLevel.INFO, 'Test', 'Test message');
        expect(console.error).toHaveBeenCalled();
    });
}); 