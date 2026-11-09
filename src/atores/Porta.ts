import { Actor, CollisionType, vec } from 'excalibur';
import { GruposDeColisao } from '../config';

export class Porta extends Actor {
  constructor(x: number, y: number, largura: number, altura: number) {
    super({
      pos: vec(x, y),
      anchor: vec(0, 0), // x, y = canto superior esquerdo
      width: largura,
      height: altura,
      collisionType: CollisionType.Fixed,
      collisionGroup: GruposDeColisao.Parede, // bloqueia jogador, robôs e tiros
    });
  }
}