import { Actor, Vector } from "excalibur";
import { GruposDeColisao, CORES, TAMANHO_BALA } from '../config';


export class Bala extends Actor {
    constructor(startingpos: Vector, ){
            super({
                
                pos: startingpos,
                width: TAMANHO_BALA,
                height:TAMANHO_BALA,

            });
        }
    
        
}

export class BalaJog extends Bala {

    constructor()
}