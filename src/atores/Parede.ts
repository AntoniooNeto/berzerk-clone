import { Actor, CollisionType, vec } from 'excalibur';
import { GruposDeColisao, CORES } from '../config';
import { Jogador } from './Jogador';
import { estadoJogo } from '../sistemas/EstadoJogo';

export class Parede extends Actor {
  constructor(x: number, y: number, largura: number, altura: number) {
    super({
      pos: vec(x, y),
      anchor: vec(0, 0), // x, y = canto superior esquerdo
      width: largura,
      height: altura,
      color: CORES.parede,
      collisionType: CollisionType.Fixed,
      collisionGroup: GruposDeColisao.Parede,
    });
  }


  onInitialize() {
    // Encostou na parede: se for o jogador, perde uma vida
    this.on('collisionstart', (evento) => {
    const alvo = evento.other as unknown as { owner?: unknown };
    const outro = alvo.owner ?? evento.other; // funciona nas duas versões da Excalibur
    if (outro instanceof Jogador) {
     estadoJogo.perderVida();
    }
  });
 }  
}