/**
 * logger.js - Система логирования для калькулятора С3-15
 * Обеспечивает запись операций, ошибок и состояний калькулятора
 */

// Уровни логирования
const LogLevel = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    OPERATION: 'OPERATION'
};

// Настройки логгера
let loggerConfig = {
    enabled: true,
    level: LogLevel.INFO, // По умолчанию INFO
    useLocalStorage: true,
    maxLogSize: 1000 // Максимальное количество записей в логе
};

// Ключи для хранения логов в localStorage
const STORAGE_KEYS = {
    ERROR: 'calculator_error_log',
    OPERATION: 'calculator_operation_log',
    INFO: 'calculator_info_log',
    DEBUG: 'calculator_debug_log'
};

/**
 * Инициализация логгера
 * @param {Object} config - Конфигурация логгера
 */
function initLogger(config = {}) {
    loggerConfig = { ...loggerConfig, ...config };
    
    // Создаем директорию logs, если используем файловую систему
    if (!loggerConfig.useLocalStorage) {
        // Здесь можно добавить код для создания директории, если бы мы использовали Node.js
        console.warn('Файловое логирование не поддерживается в браузере. Используется localStorage.');
        loggerConfig.useLocalStorage = true;
    }
    
    // Очистка логов при инициализации, если нужно
    if (loggerConfig.clearOnInit) {
        clearLogs();
    }
    
    log(LogLevel.INFO, 'Logger', 'Логгер инициализирован');
    return loggerConfig;
}

/**
 * Запись лога
 * @param {string} level - Уровень логирования
 * @param {string} operation - Операция или компонент
 * @param {string} message - Сообщение
 * @param {Object} data - Дополнительные данные
 */
function log(level, operation, message, data = null) {
    if (!loggerConfig.enabled) return;
    
    // Проверка уровня логирования
    const levels = Object.values(LogLevel);
    const configLevelIndex = levels.indexOf(loggerConfig.level);
    const currentLevelIndex = levels.indexOf(level);
    
    if (currentLevelIndex < configLevelIndex && level !== LogLevel.ERROR) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        operation,
        message,
        data
    };
    
    // Форматирование записи для вывода
    const formattedEntry = `${timestamp} | ${level} | ${operation} | ${message}${data ? ' | ' + JSON.stringify(data) : ''}`;
    
    // Вывод в консоль для отладки
    if (typeof console !== 'undefined' && console.log) {
        console.log(formattedEntry);
    }
    
    // Сохранение в хранилище
    if (loggerConfig.useLocalStorage && typeof localStorage !== 'undefined') {
        saveToLocalStorage(level, logEntry);
    }
    
    return logEntry;
}

/**
 * Сохранение лога в localStorage
 * @param {string} level - Уровень логирования
 * @param {Object} logEntry - Запись лога
 */
function saveToLocalStorage(level, logEntry) {
    if (typeof localStorage === 'undefined') return;
    
    const key = STORAGE_KEYS[level] || STORAGE_KEYS.INFO;
    let logs = [];
    
    try {
        const storedLogs = localStorage.getItem(key);
        if (storedLogs) {
            logs = JSON.parse(storedLogs);
        }
    } catch (e) {
        console.error('Ошибка при чтении логов из localStorage:', e);
        logs = [];
    }
    
    // Добавление новой записи
    logs.push(logEntry);
    
    // Ограничение размера лога
    if (logs.length > loggerConfig.maxLogSize) {
        logs = logs.slice(-loggerConfig.maxLogSize);
    }
    
    try {
        localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
        console.error('Ошибка при сохранении логов в localStorage:', e);
        // Если localStorage переполнен, удаляем половину старых записей
        if (e.name === 'QuotaExceededError') {
            logs = logs.slice(Math.floor(logs.length / 2));
            try {
                localStorage.setItem(key, JSON.stringify(logs));
            } catch (innerError) {
                console.error('Не удалось сохранить логи даже после очистки:', innerError);
            }
        }
    }
}

/**
 * Получение логов определенного уровня
 * @param {string} level - Уровень логирования
 * @returns {Array} - Массив записей логов
 */
function getLogs(level = LogLevel.INFO) {
    if (!loggerConfig.useLocalStorage || typeof localStorage === 'undefined') {
        console.warn('Получение логов поддерживается только при использовании localStorage');
        return [];
    }
    
    const key = STORAGE_KEYS[level] || STORAGE_KEYS.INFO;
    try {
        const storedLogs = localStorage.getItem(key);
        return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (e) {
        console.error('Ошибка при чтении логов из localStorage:', e);
        return [];
    }
}

/**
 * Очистка всех логов
 */
function clearLogs() {
    if (!loggerConfig.useLocalStorage || typeof localStorage === 'undefined') {
        console.warn('Очистка логов поддерживается только при использовании localStorage');
        return;
    }
    
    Object.values(STORAGE_KEYS).forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`Ошибка при очистке логов ${key}:`, e);
        }
    });
    
    log(LogLevel.INFO, 'Logger', 'Все логи очищены');
}

/**
 * Логирование ошибки
 * @param {string} operation - Операция, вызвавшая ошибку
 * @param {string|Error} error - Объект ошибки или сообщение
 * @param {Object} data - Дополнительные данные
 */
function logError(operation, error, data = null) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : null;
    
    return log(LogLevel.ERROR, operation, errorMessage, { ...data, stack: errorStack });
}

/**
 * Логирование математической операции
 * @param {string} operation - Название операции
 * @param {Array} args - Аргументы операции
 * @param {*} result - Результат операции
 */
function logOperation(operation, args, result) {
    return log(LogLevel.OPERATION, operation, `Аргументы: ${args.join(', ')}. Результат: ${result}`);
}

/**
 * Логирование действия пользователя
 * @param {string} action - Действие пользователя
 * @param {*} input - Ввод пользователя
 */
function logUserAction(action, input) {
    return log(LogLevel.INFO, 'UserAction', action, { input });
}

/**
 * Логирование состояния памяти
 * @param {Object} memoryState - Состояние памяти калькулятора
 */
function logMemoryState(memoryState) {
    return log(LogLevel.DEBUG, 'Memory', 'Состояние памяти', memoryState);
}

// Создаем объект логгера
const logger = {
    LogLevel,
    initLogger,
    log,
    logError,
    logOperation,
    logUserAction,
    logMemoryState,
    getLogs,
    clearLogs
};

// Экспорт для Node.js (для тестов)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
}

// Экспорт для браузера
if (typeof window !== 'undefined') {
    window.logger = logger;
} 