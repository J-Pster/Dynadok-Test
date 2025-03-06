import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../../domain/repositories/cliente-repository.interface';
import { CreateClienteDto } from '../../dtos/cliente.dto';
import {
  MESSAGING_SERVICE,
  MessagingService,
} from '../../../domain/messaging/messaging-service.interface';

@Injectable()
export class CreateClienteUseCase {
  private readonly logger = new Logger(CreateClienteUseCase.name);

  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
    @Inject(MESSAGING_SERVICE)
    private readonly messagingService: MessagingService,
  ) {}

  async execute(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const existingClienteEmail = await this.clienteRepository.findByEmail(
      createClienteDto.email,
    );
    if (existingClienteEmail) {
      throw new Error('Cliente com este email já existe');
    }

    const existingClienteCpf = await this.clienteRepository.findByCpf(
      createClienteDto.cpf,
    );
    if (existingClienteCpf) {
      throw new Error('Cliente com este CPF já existe');
    }

    const cliente = new Cliente({
      nome: createClienteDto.nome,
      email: createClienteDto.email,
      telefone: createClienteDto.telefone,
      cpf: createClienteDto.cpf,
      endereco: createClienteDto.endereco,
    });

    const createdCliente = await this.clienteRepository.create(cliente);

    // Enviar evento para o tópico cliente-criado
    try {
      await this.messagingService.sendMessage(
        'cliente-criado',
        {
          id: createdCliente.id,
          nome: createdCliente.nome,
          email: createdCliente.email,
          createdAt: new Date().toISOString(),
        },
        createdCliente.id,
      );
      this.logger.log(
        `Evento de cliente criado enviado para: ${createdCliente.email}`,
      );
    } catch (error) {
      // Apenas logamos o erro, mas permitimos que o fluxo continue
      this.logger.error('Erro ao enviar mensagem para Kafka:', error);
    }

    return createdCliente;
  }
}
