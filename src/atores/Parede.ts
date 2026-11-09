import { Actor, CollisionType, vec, Color, GraphicsGroup } from 'excalibur';
import { GruposDeColisao, CORES, TAMANHO_TILE } from '../config';
import { Jogador } from './Jogador';
import { pegarTile, type RefTile } from '../sistemas/Tiles';

export class Parede extends Actor {

  private tile?: RefTile;

  constructor(
    x: number,
    y: number,
    largura: number,
    altura: number,
    cor: Color = CORES.parede,
    tile?: RefTile
  ) {
    super({
      pos: vec(x, y),
      anchor: vec(0, 0), // x, y = canto superior esquerdo
      width: largura,
      height: altura,
      color: cor,
      collisionType: CollisionType.Fixed,
      collisionGroup: GruposDeColisao.Parede,
    });
    this.tile = tile;
  }

  onInitialize() {
    //=================Sprite==================
    if (this.tile) {
      const membros = [];
      for (let px = 0; px < this.width; px += TAMANHO_TILE) {
        for (let py = 0; py < this.height; py += TAMANHO_TILE) {
          const w = Math.min(TAMANHO_TILE, this.width - px);
          const h = Math.min(TAMANHO_TILE, this.height - py);
          membros.push({ graphic: pegarTile(this.tile, w, h), offset: vec(px, py) });
        }
      }
      this.graphics.use(new GraphicsGroup({ members: membros }));
    }

    //=================Eletricidade==================
    // Encostou na parede: se for o jogador, ele morre
    this.on('collisionstart', (evento) => {
      const alvo = evento.other as unknown as { owner?: unknown };
      const outro = alvo.owner ?? evento.other; // funciona nas duas versões da Excalibur
      if (outro instanceof Jogador) {
        outro.morrer();
      }
    });
  }
}