import { Scene } from 'excalibur';
import { Parede } from '../atores/Parede';
import { Jogador } from '../atores/Jogador';
import { Robo } from '../atores/Robo';
import { Placar, Vidas } from '../atores/Hud';
import {
  LARGURA_JOGO as L,
  ALTURA_JOGO as A,
  ESPESSURA_PAREDE as E,
  TAMANHO_PORTA as P,
  TAMANHO_JOGADOR,
  ALTURA_JOGO,
  LARGURA_JOGO,
} from '../config';

export const jogador = new Jogador(LARGURA_JOGO/2, ALTURA_JOGO/2, TAMANHO_JOGADOR, TAMANHO_JOGADOR);

export class CenaJogo extends Scene {
  onInitialize() {
    this.montarSala();
    this.spawnarRobos();
    this.add(jogador);
    this.add(new Placar());
    this.add(new Vidas());
  }


  private spawnarRobos() {
    const posicoes = [
      { x: 80, y: 70},
      { x: 240, y: 70},
      { x: 160, y: 175},
    ];

    for (const posicao of posicoes) {
      this.add(new Robo(posicao.x, posicao.y, jogador));
    }
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