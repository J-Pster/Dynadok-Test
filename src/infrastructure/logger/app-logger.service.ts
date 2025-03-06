import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger = new Logger();
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('logging.enabled', false);
  }

  log(message: string, context?: string): void {
    if (this.isEnabled) {
      this.logger.log(message, context);
    }
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    if (this.isEnabled) {
      this.logger.warn(message, context);
    }
  }

  debug(message: string, context?: string): void {
    if (this.isEnabled) {
      this.logger.debug(message, context);
    }
  }

  verbose(message: string, context?: string): void {
    if (this.isEnabled) {
      this.logger.verbose(message, context);
    }
  }
}
