import { Actor, CollisionType, Engine, vec, Keys, Vector } from 'excalibur';
import { GruposDeColisao, CORES, VELOCIDADE_JOGADOR, DISTANCIA_BALA } from '../config';
import { Bala } from './Bala';

export class Jogador extends Actor {
    // pra onde ta virado
    private direcao: Vector = vec(1, 0);

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

    //===============Movimento do jogador=================
    onPreUpdate(engine: Engine, _delta: number): void {
        const tecla = engine.input.keyboard;
        this.vel = vec(0,0);

        //--------Movimento no eixo x---------
        let direcao_x = 0;  

        if(tecla.isHeld(Keys.A)) direcao_x -= 1;
        if(tecla.isHeld(Keys.ArrowLeft)) direcao_x -= 1;

        if(tecla.isHeld(Keys.D)) direcao_x += 1;
        if(tecla.isHeld(Keys.ArrowRight)) direcao_x += 1;

        //--------Movimento no eixo y---------
        let direcao_y = 0;
        if(tecla.isHeld(Keys.W)) direcao_y -= 1;
        if(tecla.isHeld(Keys.ArrowUp)) direcao_y -= 1;

        if(tecla.isHeld(Keys.S)) direcao_y += 1;
        if(tecla.isHeld(Keys.ArrowDown)) direcao_y += 1;
    
        let dir = vec(direcao_x, direcao_y);

        // vai se mexer ou nao
        if (dir.x !== 0 || dir.y !== 0) {
            this.direcao = dir.normalize();            
            this.vel = this.direcao.scale(VELOCIDADE_JOGADOR);     
        } else {
            this.vel = vec(0, 0);
        }                 

        
        if(tecla.isHeld(Keys.Space)) this.atirar();
        
    }

    atirar(): void {
        const saida = this.pos.add(this.direcao.scale(DISTANCIA_BALA));
        const bala = new Bala(saida, 'Jogador', this.direcao);
        this.scene?.add(bala);
    }
   
}

