import { Engine, DisplayMode } from 'excalibur';
import { LARGURA_JOGO, ALTURA_JOGO, CORES } from './config';
import { CenaJogo } from './cenas/CenaJogo';
import { CenaGameOver } from './cenas/CenaGameOver'

const jogo = new Engine({
  width: LARGURA_JOGO,
  height: ALTURA_JOGO,
  displayMode: DisplayMode.FitScreen,
  pixelArt: true,
  backgroundColor: CORES.fundo,
});

jogo.addScene('jogo', new CenaJogo());
jogo.start().then(() => jogo.goToScene('jogo'));
jogo.addScene('gameover', new CenaGameOver());