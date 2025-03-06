import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from './app-logger.service';
import { Logger } from '@nestjs/common';

describe('AppLoggerService', () => {
  let service: AppLoggerService;
  let configService: ConfigService;

  // Espionar métodos do Logger nativo do NestJS
  const mockLogMethod = jest.fn();
  const mockErrorMethod = jest.fn();
  const mockWarnMethod = jest.fn();
  const mockDebugMethod = jest.fn();
  const mockVerboseMethod = jest.fn();

  beforeEach(async () => {
    // Sobrescrever os métodos do Logger do NestJS
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogMethod);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockErrorMethod);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockWarnMethod);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockDebugMethod);
    jest
      .spyOn(Logger.prototype, 'verbose')
      .mockImplementation(mockVerboseMethod);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppLoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<AppLoggerService>(AppLoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar com o logger desabilitado por padrão', () => {
      expect(configService.get).toHaveBeenCalledWith('logging.enabled', false);
      expect((service as any).isEnabled).toBe(false);
    });

    it('deve inicializar com o logger habilitado se configurado', () => {
      // Reconfigurar o mock do ConfigService para retornar true
      jest
        .spyOn(configService, 'get')
        .mockImplementation((key, defaultValue) => {
          if (key === 'logging.enabled') return true;
          return defaultValue;
        });

      // Reinstanciar o serviço para aplicar nova configuração
      const newService = new AppLoggerService(configService);

      expect(configService.get).toHaveBeenCalledWith('logging.enabled', false);
      expect((newService as any).isEnabled).toBe(true);
    });
  });

  describe('log', () => {
    it('não deve logar quando o logger está desabilitado', () => {
      (service as any).isEnabled = false;

      // Limpar o mock antes de chamar o método para ignorar chamadas anteriores
      mockLogMethod.mockClear();

      service.log('Mensagem de teste', 'TestContext');
      expect(mockLogMethod).not.toHaveBeenCalled();
    });

    it('deve logar quando o logger está habilitado', () => {
      // Sobrescrever a variável isEnabled para true
      (service as any).isEnabled = true;

      service.log('Mensagem de teste', 'TestContext');
      expect(mockLogMethod).toHaveBeenCalledWith(
        'Mensagem de teste',
        'TestContext',
      );
    });
  });

  describe('error', () => {
    it('deve sempre logar erros, independente da configuração', () => {
      service.error('Erro de teste', 'StackTrace', 'TestContext');
      expect(mockErrorMethod).toHaveBeenCalledWith(
        'Erro de teste',
        'StackTrace',
        'TestContext',
      );

      // Verificar com logger desabilitado (comportamento padrão)
      jest.clearAllMocks();
      (service as any).isEnabled = false;

      service.error('Erro de teste 2', 'StackTrace2', 'TestContext2');
      expect(mockErrorMethod).toHaveBeenCalledWith(
        'Erro de teste 2',
        'StackTrace2',
        'TestContext2',
      );
    });
  });

  describe('warn', () => {
    it('não deve logar warnings quando o logger está desabilitado', () => {
      service.warn('Aviso de teste', 'TestContext');
      expect(mockWarnMethod).not.toHaveBeenCalled();
    });

    it('deve logar warnings quando o logger está habilitado', () => {
      (service as any).isEnabled = true;

      service.warn('Aviso de teste', 'TestContext');
      expect(mockWarnMethod).toHaveBeenCalledWith(
        'Aviso de teste',
        'TestContext',
      );
    });
  });

  describe('debug', () => {
    it('não deve logar debug quando o logger está desabilitado', () => {
      service.debug('Debug de teste', 'TestContext');
      expect(mockDebugMethod).not.toHaveBeenCalled();
    });

    it('deve logar debug quando o logger está habilitado', () => {
      (service as any).isEnabled = true;

      service.debug('Debug de teste', 'TestContext');
      expect(mockDebugMethod).toHaveBeenCalledWith(
        'Debug de teste',
        'TestContext',
      );
    });
  });

  describe('verbose', () => {
    it('não deve logar verbose quando o logger está desabilitado', () => {
      service.verbose('Verbose de teste', 'TestContext');
      expect(mockVerboseMethod).not.toHaveBeenCalled();
    });

    it('deve logar verbose quando o logger está habilitado', () => {
      (service as any).isEnabled = true;

      service.verbose('Verbose de teste', 'TestContext');
      expect(mockVerboseMethod).toHaveBeenCalledWith(
        'Verbose de teste',
        'TestContext',
      );
    });
  });
});
