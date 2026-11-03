import { Actor, CollisionType, Engine, vec, Keys } from 'excalibur';
import { GruposDeColisao, CORES, VELOCIDADE_JOGADOR } from '../config';

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
    //===============Movimento do jogador=================
    onPreUpdate(engine: Engine, _delta: number): void {
        const tecla = engine.input.keyboard;
        this.vel = vec(0,0);

        //--------Movimento no eixo x---------

        let direcao_x = 0;  

        //-----Esquerda-----
        if(tecla.isHeld(Keys.A)) direcao_x -= 1;
        if(tecla.isHeld(Keys.ArrowLeft)) direcao_x -= 1;

        //-----Direita-----
        if(tecla.isHeld(Keys.D)) direcao_x += 1;
        if(tecla.isHeld(Keys.ArrowRight)) direcao_x += 1;

        //--------Movimento no eixo y---------

        let direcao_y = 0;

        //-----Cima-----
        if(tecla.isHeld(Keys.W)) direcao_y -= 1;
        if(tecla.isHeld(Keys.ArrowUp)) direcao_y -= 1;

        //-----Baixo-----
        if(tecla.isHeld(Keys.S)) direcao_y += 1;
        if(tecla.isHeld(Keys.ArrowDown)) direcao_y += 1;
    
        // Vetor de velocidade do jogador
        this.vel = vec(direcao_x, direcao_y).normalize().scale(VELOCIDADE_JOGADOR);
    }
}

