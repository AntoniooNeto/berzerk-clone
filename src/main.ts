import { Engine, DisplayMode, Loader } from 'excalibur';
import { LARGURA_JOGO, ALTURA_JOGO, CORES } from './config';
import { CenaJogo } from './cenas/CenaJogo';
import { CenaGameOver } from './cenas/CenaGameOver'
import { Recursos } from './sistemas/Recursos';



const jogo = new Engine({
  width: LARGURA_JOGO,
  height: ALTURA_JOGO,
  displayMode: DisplayMode.FitScreen,
  pixelArt: true,
  backgroundColor: CORES.fundo,
});

const loader = new Loader([Recursos.Arqueiro, Recursos.Rato, Recursos.Mago]);

jogo.addScene('jogo', new CenaJogo());
jogo.addScene('gameover', new CenaGameOver());
jogo.start(loader).then(() => jogo.goToScene('jogo'));
