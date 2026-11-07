import { Engine, Font, Keys, Label, Scene, TextAlign, vec } from 'excalibur';
// ...
import { ALTURA_JOGO, CORES, LARGURA_JOGO } from '../config';
import { estadoJogo } from '../sistemas/EstadoJogo';
import { CenaJogo } from './CenaJogo';

function criarTexto(texto: string, y: number, tamanho: number) {
  return new Label({
    text: texto,
    pos: vec(LARGURA_JOGO / 2, y),
    font: new Font({
      family: 'monospace',
      size: tamanho,
      color: CORES.texto,
      textAlign: TextAlign.Center, // centraliza o texto no x
      quality: 4,                  // desenha o texto em resolução maior, deixando mais nítido
    }),
  });
}

export class CenaGameOver extends Scene {
  private textoPontos!: Label;

  onInitialize() {
    this.add(criarTexto('GAME OVER', ALTURA_JOGO / 2 - 40, 24));
    this.textoPontos = criarTexto('', ALTURA_JOGO / 2, 12);
    this.add(this.textoPontos);
    this.add(criarTexto('ENTER PARA REINICIAR', ALTURA_JOGO / 2 + 40, 10));
  }

  // Roda toda vez que a cena aparece
  onActivate() {
    this.textoPontos.text = `PONTOS: ${estadoJogo.pontos}`;
  }

  onPostUpdate(engine: Engine) {
    if (engine.input.keyboard.wasPressed(Keys.Enter)) {
      this.reiniciar(engine);
    }
  }

  private reiniciar(engine: Engine) {
    estadoJogo.reiniciar();
    // Cria uma cena nova do jogo, para a sala e os robôs voltarem ao início
    engine.removeScene('jogo');
    engine.addScene('jogo', new CenaJogo());
    engine.goToScene('jogo');
    
  }
}