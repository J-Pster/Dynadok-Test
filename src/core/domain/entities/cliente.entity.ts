import { BaseEntity } from './base-entity';

export interface ClienteProps {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Cliente extends BaseEntity<ClienteProps> {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco?: string;

  constructor(props: ClienteProps) {
    super(props);
    this.nome = props.nome;
    this.email = props.email;
    this.telefone = props.telefone;
    this.cpf = props.cpf;
    this.endereco = props.endereco;
  }

  update(props: Partial<ClienteProps>) {
    if (props.nome) this.nome = props.nome;
    if (props.email) this.email = props.email;
    if (props.telefone) this.telefone = props.telefone;
    if (props.cpf) this.cpf = props.cpf;
    if (props.endereco) this.endereco = props.endereco;
    this.updatedAt = new Date();
  }
}
