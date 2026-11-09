import { Actor, CollisionType, Collider, CollisionContact, Engine, Side, Vector, vec, SpriteSheet, Animation, AnimationStrategy} from 'excalibur';
import { GruposDeColisao, TAMANHO_ROBO, DISTANCIA_BALA, TIPOS_ROBO, type TipoRobo, type DadosRobo } from '../config';
import { TAMANHO_SPRITE, TEMPO_MORTE, TEMPO_TIRO } from '../config';
import { Bala } from './Bala';
import { estadoJogo } from '../sistemas/EstadoJogo';
import { type Dificuldade } from '../sistemas/Dificuldade';
import { Recursos } from '../sistemas/Recursos';

export class Robo extends Actor {
    private alvo: Actor;
    private dados: DadosRobo;
    private velocidade: number;
    private recarga: number;
    private morrendo = false;
    private tempoMorte = 0;
    private tipo: TipoRobo;
    private cooldown = 1000 + Math.random() * 2000;

    constructor(x: number, y: number, alvo: Actor, tipo: TipoRobo, dificuldade: Dificuldade) {
        super({
            pos: vec(x, y), 
            anchor: vec(0.5, 0.5),
            width: TAMANHO_ROBO,
            height: TAMANHO_ROBO,
            color: TIPOS_ROBO[tipo].cor,
            collisionType: CollisionType.Active,
            collisionGroup: GruposDeColisao.Inimigo,
        });
        this.tipo = tipo;
        this.alvo = alvo;
        this.dados = TIPOS_ROBO[tipo];
        this.velocidade = this.dados.velocidade * dificuldade.multiplicadorVelocidade;
        this.recarga = this.dados.recargaTiro * dificuldade.multiplicadorRecarga;
    }

        //=================Sprite e animacoes==================
    onInitialize(_engine: Engine): void {

        const imagem = this.tipo === 'rapido' ? Recursos.Rato : Recursos.Mago;


        const folha = SpriteSheet.fromImageSource({
            image: imagem,
            grid: { rows: 15, columns: 8, spriteWidth: TAMANHO_SPRITE, spriteHeight: TAMANHO_SPRITE },
        });

        const animParado = Animation.fromSpriteSheetCoordinates({
            spriteSheet: folha,
            strategy: AnimationStrategy.Loop,
            frameCoordinates: [
                { x: 0, y: 1, duration: 200 },
                { x: 1, y: 1, duration: 200 },
                { x: 2, y: 1, duration: 200 },
                { x: 3, y: 1, duration: 200 },
            ],
        });

        const animAndando = Animation.fromSpriteSheetCoordinates({
            spriteSheet: folha,
            strategy: AnimationStrategy.Loop,
            frameCoordinates: [
                { x: 0, y: 8, duration: 120 },
                { x: 1, y: 8, duration: 120 },
                { x: 2, y: 8, duration: 120 },
                { x: 3, y: 8, duration: 120 },
                { x: 4, y: 8, duration: 120 },
                { x: 5, y: 8, duration: 120 },
            ],
        });

        const animAtirando = Animation.fromSpriteSheetCoordinates({
            spriteSheet: folha,
            strategy: AnimationStrategy.End,
            frameCoordinates: [
                { x: 0, y: 13, duration: TEMPO_TIRO },
                { x: 1, y: 13, duration: TEMPO_TIRO },
                { x: 2, y: 13, duration: TEMPO_TIRO },
                { x: 3, y: 13, duration: TEMPO_TIRO },
            ],
        });

        const animMorrendo = Animation.fromSpriteSheetCoordinates({
            spriteSheet: folha,
            strategy: AnimationStrategy.End,
            frameCoordinates: [
                { x: 0, y: 9, duration: TEMPO_MORTE },
                { x: 1, y: 9, duration: TEMPO_MORTE },
                { x: 2, y: 9, duration: TEMPO_MORTE },
                { x: 3, y: 9, duration: TEMPO_MORTE },
                { x: 4, y: 9, duration: TEMPO_MORTE },
                { x: 5, y: 9, duration: TEMPO_MORTE },
                { x: 6, y: 9, duration: TEMPO_MORTE },
                { x: 7, y: 9, duration: TEMPO_MORTE },
            ],
        });

        this.graphics.add('parado', animParado);
        this.graphics.add('andando', animAndando);
        this.graphics.add('atirando', animAtirando);
        this.graphics.add('morrendo', animMorrendo);

        this.graphics.use('andando'); // o robô está sempre perseguindo
    }

    onPreUpdate(_engine: Engine, delta: number): void {
        // Morrendo: espera a animação acabar e some
        if (this.morrendo) {
            this.tempoMorte += delta;
            if (this.tempoMorte >= 8 * TEMPO_MORTE) this.kill();
            return;
        }
        
        const ate = this.alvo.pos.sub(this.pos);
        
        this.vel = ate.normalize().scale(this.velocidade);

        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.atirar(ate);
            this.cooldown = this.recarga;
        }

         // Vira o sprite para o lado em que está andando
        if (this.vel.x !== 0) {
            const indoParaEsquerda = this.vel.x < 0;
            // o mago é desenhado olhando para a direita, o rato olhando para a esquerda
            const desenhoOlhaEsquerda = this.tipo === 'rapido';
            this.graphics.flipHorizontal = indoParaEsquerda !== desenhoOlhaEsquerda;
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
        estadoJogo.robosRestantes -= 1;
        console.log('Robô morto! Pontos ganhos:', estadoJogo.pontos);
        if (this.morrendo) return;
        this.morrendo = true;
        this.vel = vec(0, 0);
        this.body.collisionType = CollisionType.PreventCollision; // não machuca mais
        this.graphics.use('morrendo');
    }
}