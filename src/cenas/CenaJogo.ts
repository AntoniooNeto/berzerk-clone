import { Scene } from 'excalibur';
import { Parede } from '../atores/Parede';
import {
  LARGURA_JOGO as L,
  ALTURA_JOGO as A,
  ESPESSURA_PAREDE as E,
  TAMANHO_PORTA as P,
} from '../config';

export class CenaJogo extends Scene {
  onInitialize() {
    this.montarSala();
  }

  private montarSala() {
    const portaX = (L - P) / 2; // aberturas de cima e de baixo
    const portaY = (A - P) / 2; // aberturas da esquerda e da direita

    // Cima
    this.add(new Parede(0, 0, portaX, E));
    this.add(new Parede(portaX + P, 0, L - portaX - P, E));
    // Baixo
    this.add(new Parede(0, A - E, portaX, E));
    this.add(new Parede(portaX + P, A - E, L - portaX - P, E));
    // Esquerda
    this.add(new Parede(0, 0, E, portaY));
    this.add(new Parede(0, portaY + P, E, A - portaY - P));
    // Direita
    this.add(new Parede(L - E, 0, E, portaY));
    this.add(new Parede(L - E, portaY + P, E, A - portaY - P));
  }
}