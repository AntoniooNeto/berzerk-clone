import { Actor, CollisionType, Collider, CollisionContact, Engine, Side, vec, Keys, Vector, SpriteSheet, Animation, AnimationStrategy } from 'excalibur';
import { GruposDeColisao, CORES, VELOCIDADE_JOGADOR, DISTANCIA_BALA, RECARGA_BALA, X0_JOGADOR, Y0_JOGADOR, PONTOS_MORTE, TAMANHO_SPRITE, TEMPO_TIRO, TEMPO_MORTE } from '../config';
import { Bala } from './Bala';
import { estadoJogo } from '../sistemas/EstadoJogo';
import { Recursos } from '../sistemas/Recursos';

export class Jogador extends Actor {
    // pra onde ta virado
    private direcao: Vector = vec(1, 0);
    private esperar = 0; 
    private balaAtual: Bala | null = null;
    private viradoEsquerda = false;
    private tempoTiro = 0;
    private atirando = false;
    private morrendo = false;
    private tempoMorte = 0;
    private animAtirando!: Animation;
    private animMorrendo!: Animation;

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

    //=================Sprite e animacoes==================
    onInitialize(_engine: Engine): void {

        const folha = SpriteSheet.fromImageSource({
            image: Recursos.Arqueiro,
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
                { x: 0, y: 8, duration: 80 },
                { x: 1, y: 8, duration: 80 },
                { x: 2, y: 8, duration: 80 },
                { x: 3, y: 8, duration: 80 },
                { x: 4, y: 8, duration: 80 },
                { x: 5, y: 8, duration: 80 },
            ],
        });

        this.animAtirando = Animation.fromSpriteSheetCoordinates({
            spriteSheet: folha,
            strategy: AnimationStrategy.End,
            frameCoordinates: [
                { x: 0, y: 13, duration: TEMPO_TIRO },
                { x: 1, y: 13, duration: TEMPO_TIRO },
                { x: 2, y: 13, duration: TEMPO_TIRO },
                { x: 3, y: 13, duration: TEMPO_TIRO },
            ],
        });

        this.animMorrendo = Animation.fromSpriteSheetCoordinates({
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
        this.graphics.add('atirando', this.animAtirando);
        this.graphics.add('morrendo', this.animMorrendo);

        this.graphics.use('parado');
    }
    //===============Movimento do jogador=================
    onPreUpdate(engine: Engine, delta: number): void {
        const tecla = engine.input.keyboard;
        this.esperar -= delta;   
        this.tempoTiro -= delta;
        if (this.tempoTiro <= 0){ this.atirando = false; }
        if (this.morrendo) {
            this.tempoMorte -= delta;
            if (this.tempoMorte <= 0) {
                this.morrendo = false;
                estadoJogo.removerPontos(PONTOS_MORTE);
                estadoJogo.perderVida();
                
            }
        }

        //--------Movimento no eixo x---------
        let direcao_x = 0;  

        if(tecla.isHeld(Keys.A)) direcao_x -= 1;
        if(tecla.isHeld(Keys.ArrowLeft)) direcao_x -= 1;

        if(tecla.isHeld(Keys.D)) direcao_x += 1;
        if(tecla.isHeld(Keys.ArrowRight)) direcao_x += 1;

        if (direcao_x < 0) this.viradoEsquerda = true;
        else if (direcao_x > 0) this.viradoEsquerda = false;
        this.graphics.flipHorizontal = !this.viradoEsquerda;

        //--------Movimento no eixo y---------
        let direcao_y = 0;
        if(tecla.isHeld(Keys.W)) direcao_y -= 1;
        if(tecla.isHeld(Keys.ArrowUp)) direcao_y -= 1;

        if(tecla.isHeld(Keys.S)) direcao_y += 1;
        if(tecla.isHeld(Keys.ArrowDown)) direcao_y += 1;
    
        let dir = vec(direcao_x, direcao_y);

        // vai morrer, atirar, se mexer ou parar
        if (this.morrendo) {
            this.vel = vec(0, 0);
            this.graphics.use('morrendo');
        } else if (this.atirando){
            this.graphics.use('atirando');
            this.vel = vec(0, 0);
        } else if (dir.x !== 0 || dir.y !== 0) {
            this.direcao = dir.normalize();            
            this.vel = this.direcao.scale(VELOCIDADE_JOGADOR);  
            this.graphics.use('andando');   
        } else {
            this.vel = vec(0, 0);
            this.graphics.use('parado');
        }                 

        //==================Tiro==================
        
        const atirou = engine.input.keyboard.isHeld(Keys.Space);
        const podeAtirar = this.balaAtual === null || this.balaAtual.isKilled();

        if (atirou && this.esperar <= 0 && podeAtirar && !this.morrendo) {      
            this.atirar();
            this.esperar = RECARGA_BALA;  
            this.atirando = true;
            this.tempoTiro = TEMPO_TIRO * 4;   
            this.animAtirando.reset()
            this.graphics.use('atirando');       
        }
    }

    onCollisionStart(_self: Collider, other: Collider, _side: Side, _contact: CollisionContact): void {
        if (other.owner instanceof Bala) {
            this.morrer();
        }
    }

    //===========metodos==========
    
    morrer(): void {                 
        if (this.morrendo) return;   
        this.morrendo = true;
        this.balaAtual = null;  
        this.atirando = false;
        this.tempoMorte = TEMPO_MORTE * 8;
        this.animMorrendo.reset();
    }

    atirar(): void {
        const saida = this.pos.add(this.direcao.scale(DISTANCIA_BALA));
        const bala = new Bala(saida, 'Jogador', this.direcao);
        this.balaAtual = bala;
        this.scene?.add(bala);
    }

    reposicionarNaSala(): void {
        this.pos = vec(X0_JOGADOR, Y0_JOGADOR);
        this.esperar = 0;
        this.direcao = vec(1, 0);
        this.balaAtual = null;
        this.morrendo = false;
        this.atirando = false;
        this.tempoMorte = 0;
    }
   
}

