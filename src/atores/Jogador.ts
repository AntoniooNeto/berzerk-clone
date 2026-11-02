import { Actor, CollisionType, vec } from 'excalibur';
import { GruposDeColisao, CORES } from '../config';

export class Jogador extends Actor {
    constructor(x: number, y: number, largura: number, altura: number){
        super({
            pos: vec(x, y),
            anchor: vec(0.5, 0.5),
            width: largura,
            height: altura,
            color: CORES.jogador,
            collisionType: CollisionType.Active,
            collisionGroup: GruposDeColisao.Jogador,
        });
    }
}