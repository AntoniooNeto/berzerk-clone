import { Actor, Vector, CollisionType, Collider, Side, CollisionContact } from "excalibur";
import { GruposDeColisao, CORES, TAMANHO_BALA, VELOCIDADE_BALA } from '../config';

export class Bala extends Actor {
    
    constructor(startingpos: Vector, owner: 'Jogador' | 'Robo', dir: Vector){
            super({
                
                pos: startingpos,
                width: TAMANHO_BALA,
                height:TAMANHO_BALA,
                color: (owner === 'Jogador') ? CORES.balaJogador : CORES.balaInimigo,
                collisionGroup: (owner === 'Jogador') ? GruposDeColisao.BalaJogador : GruposDeColisao.BalaInimigo,
                collisionType: CollisionType.Passive,

            });
            
            this.vel = dir.normalize().scale(VELOCIDADE_BALA);
        }

        onInitialize() {
            this.on('exitviewport', () => {
                this.kill();
        });
  }
        onCollisionStart(_self: Collider, _other: Collider, _side: Side, _contact: CollisionContact): void {
            this.kill();
        }
    
        
}