import { Actor, CollisionType, Collider, CollisionContact, Engine, Side, Vector, vec } from 'excalibur';
import { GruposDeColisao, TAMANHO_ROBO, DISTANCIA_BALA, TIPOS_ROBO, type TipoRobo, type DadosRobo } from '../config';
import { Bala } from './Bala';
import { estadoJogo } from '../sistemas/EstadoJogo';

export class Robo extends Actor {
    private alvo: Actor;
    private dados: DadosRobo;

    private cooldown = 1000 + Math.random() * 2000;

    constructor(x: number, y: number, alvo: Actor, tipo: TipoRobo) {
        super({
            pos: vec(x, y), 
            anchor: vec(0.5, 0.5),
            width: TAMANHO_ROBO,
            height: TAMANHO_ROBO,
            color: TIPOS_ROBO[tipo].cor,
            collisionType: CollisionType.Active,
            collisionGroup: GruposDeColisao.Inimigo,
        });
        this.alvo = alvo;
        this.dados = TIPOS_ROBO[tipo];
    }

    onPreUpdate(_engine: Engine, delta: number): void {
        const ate = this.alvo.pos.sub(this.pos);
        
        this.vel = ate.normalize().scale(this.dados.velocidade);

        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.atirar(ate);
            this.cooldown = this.dados.recargaTiro;
        }
    }

    private atirar(direcao: Vector): void {
        const saida = this.pos.add(direcao.normalize().scale(DISTANCIA_BALA));
        const bala = new Bala(saida, 'Robo', direcao);
        this.scene?.add(bala);
    }

    onCollisionStart(_self: Collider, other: Collider, _side: Side, _contact: CollisionContact): void {
        if (other.owner instanceof Bala) {
            this.morrer();
        }
    }

    private morrer(): void {
        estadoJogo.adicionarPontos(this.dados.pontos);
        console.log('Robô morto! Pontos ganhos:', estadoJogo.pontos);
        this.kill();
    }
}