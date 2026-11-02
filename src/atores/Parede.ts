import { Actor, CollisionType, vec } from 'excalibur';
import { GruposDeColisao, CORES } from '../config';

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
}