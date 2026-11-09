import { Color, Engine, Font, Label, TextAlign, vec } from 'excalibur';
import { CORES, LARGURA_JOGO, ALTURA_JOGO, ESPESSURA_PAREDE, TAMANHO_TILE } from '../config';
import { estadoJogo } from '../sistemas/EstadoJogo';



function criarFonte(cor: Color) {
    
  return new Font({
    family: "'Press Start 2P', monospacee", 
    size: 10, 
    color: cor, 
    quality: 4
  });
}

export class Placar extends Label {
  constructor() {
    super({
      text: 'PONTOS: 0',
      pos: vec(TAMANHO_TILE + 4, 3),
      anchor: vec(0, 0), // x, y = canto superior esquerdo do texto
      font: criarFonte(CORES.hud),
      z: 10, // desenha por cima das paredes
    });
  }

  onPreUpdate() {
    this.text = `PONTOS: ${estadoJogo.pontos}`;
  }
}

export class Vidas extends Label {
  constructor() {
    super({
      text: 'VIDAS: 3',
      pos: vec(220, 3),
      anchor: vec(0, 0),
      font: criarFonte(CORES.hud),
      z: 10,
    });
  }

  onPreUpdate(engine: Engine) {
    this.text = `VIDAS: ${estadoJogo.vidas}`;

    // Quando as vidas acabam, vai para a tela de Game Over
    if (estadoJogo.fimDeJogo) {
      engine.goToScene('gameover');
    }
  }
}

export class NumeroSala extends Label {
  constructor() {
    super({
      text: 'SALA: 1',
      pos: vec(TAMANHO_TILE + 4, ALTURA_JOGO - ESPESSURA_PAREDE + 3),
      anchor: vec(0, 0),
      font: criarFonte(CORES.hud),
      z: 10,
    });
  }

  onPreUpdate() {
    this.text = `SALA: ${estadoJogo.sala}`;
  }
}

export class MensagemBonus extends Label {
  constructor(texto: string) {
    super({
      text: texto,
      pos: vec(LARGURA_JOGO / 2, ALTURA_JOGO / 2),
      anchor: vec(0.5, 0.5),
      font: new Font({
        family: 'monospace',
        size: 14,
        color: CORES.bonus,
        quality: 4,
        textAlign: TextAlign.Center,
      }),
      z: 10,
    });

    this.actions.delay(2000).die();
  }
}