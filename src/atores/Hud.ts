import { Color, Engine, Font, Label, vec } from 'excalibur';
import { CORES, TAMANHO_TILE } from '../config';
import { estadoJogo } from '../sistemas/EstadoJogo';

function criarFonte(cor: Color) {
    
  return new Font({ family: 'monospace', size: 10, color: cor, quality: 4});
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
      pos: vec(240, 3),
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