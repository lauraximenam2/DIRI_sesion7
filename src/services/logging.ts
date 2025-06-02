// src/services/logging.ts
type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private levels: LogLevel[];
  private currentLevel: LogLevel;

  constructor(defaultLevel: LogLevel = "debug") { 
    this.levels = ["debug", "info", "warn", "error"];
    this.currentLevel = defaultLevel;


    if (import.meta.env) {
        this.currentLevel = "info"; 
    }
  }

  setLevel(level: LogLevel): void {
    if (this.levels.includes(level)) {
      this.currentLevel = level;
    } else {
      console.error(`[LOGGER] Nivel de log no válido: ${level}. Usando nivel actual: ${this.currentLevel}`);
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {

    const levelIndex = this.levels.indexOf(level);
    const currentLevelIndex = this.levels.indexOf(this.currentLevel);

    if (levelIndex >= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${level.toUpperCase()}] ${timestamp}: ${message}`;

      if (context) {
        console[level](logMessage, context);
      } else {
        console[level](logMessage);
      }
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    let fullMessage = message;
    if (error instanceof Error) {
        fullMessage += ` - Error: ${error.message}${error.stack ? `\nStack: ${error.stack}` : ''}`;
    } else if (error) {
        fullMessage += ` - Details: ${JSON.stringify(error)}`;
    }
    this.log("error", fullMessage, context);
  }
}


const logger = new Logger(import.meta.env.VITE_LOG_LEVEL as LogLevel || 'debug');

export default logger;