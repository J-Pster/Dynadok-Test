export const MESSAGING_SERVICE = 'MESSAGING_SERVICE';

export interface MessagingService {
  /**
   * Envia uma mensagem para um tópico específico
   * @param topic Nome do tópico
   * @param message Mensagem a ser enviada
   * @param key Chave opcional para particionamento
   */
  sendMessage<T>(topic: string, message: T, key?: string): Promise<void>;
}
