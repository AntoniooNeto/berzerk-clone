import { Actor, Vector, CollisionType, Collider, Side, CollisionContact, Scene } from "excalibur";
import { GruposDeColisao, CORES, TAMANHO_BALA, VELOCIDADE_BALA, VELOCIDADE_BALA_ROBO } from '../config';

export let perdida: boolean = false;

export class Bala extends Actor {
    private doJogador: boolean;
    
    constructor(startingpos: Vector, owner: 'Jogador' | 'Robo', dir: Vector){
            super({
                
                pos: startingpos,
                width: TAMANHO_BALA,
                height:TAMANHO_BALA,
                color: (owner === 'Jogador') ? CORES.balaJogador : CORES.balaInimigo,
                collisionGroup: (owner === 'Jogador') ? GruposDeColisao.BalaJogador : GruposDeColisao.BalaInimigo,
                collisionType: CollisionType.Passive,

            });

            this.doJogador = owner === 'Jogador';

            const velocidade = this.doJogador ? VELOCIDADE_BALA : VELOCIDADE_BALA_ROBO;
            this.vel = dir.normalize().scale(velocidade);
            if (this.doJogador) perdida = true;
        }

        onInitialize() {
            this.on('exitviewport', () => this.kill());
    }

    onCollisionStart(_self: Collider, _other: Collider, _side: Side, _contact: CollisionContact): void {
        this.kill();
    }
    
    onPreKill(_scene: Scene): void {
        if (this.doJogador) perdida = false;
    }    
}