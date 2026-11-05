import { Actor, CollisionType, Collider, CollisionContact, Engine, Side, vec } from 'excalibur';
import { GruposDeColisao, CORES, TAMANHO_ROBO, VELOCIDADE_ROBO, PONTOS_ROBO } from '../config';
import { Bala } from './Bala';
import { estadoJogo } from '../sistemas/EstadoJogo';

export class Robo extends Actor {
    private alvo: Actor;

    constructor(x: number, y: number, alvo: Actor) {
        super({
            pos: vec(x, y), 
            anchor: vec(0.5, 0.5),
            width: TAMANHO_ROBO,
            height: TAMANHO_ROBO,
            color: CORES.robo,
            collisionType: CollisionType.Active,
            collisionGroup: GruposDeColisao.Inimigo,
        });
        this.alvo = alvo;
    }

    onPreUpdate(_engine: Engine, _delta: number): void {
        const ate = this.alvo.pos.sub(this.pos);
        
        this.vel = ate.normalize().scale(VELOCIDADE_ROBO);
    }

    onCollisionStart(_self: Collider, other: Collider, _side: Side, _contact: CollisionContact): void {
        if (other.owner instanceof Bala) {
            this.morrer();
        }
    }

    private morrer(): void {
        estadoJogo.adicionarPontos(PONTOS_ROBO);
        console.log('Robô morto! Pontos ganhos:', estadoJogo.pontos);
        this.kill();
    }
}