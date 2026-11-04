import { Actor, CollisionType, vec } from 'excalibur';
import { GruposDeColisao, CORES, TAMANHO_ROBO } from '../config';

export class Robo extends Actor {
    constructor(x: number, y: number){
        super({
            pos: vec(x, y), 
            anchor: vec(0.5, 0.5),
            width: TAMANHO_ROBO,
            height: TAMANHO_ROBO,
            color: CORES.robo,
            collisionType: CollisionType.Fixed,
            collisionGroup: GruposDeColisao.Inimigo,
        });
    }
}