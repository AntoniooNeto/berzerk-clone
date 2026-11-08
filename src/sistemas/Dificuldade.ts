import { DIFICULDADE as D } from '../config';

export interface Dificuldade {
    quantidadeRobos: number;
    multiplicadorVelocidade: number;
    multiplicadorRecarga: number;
    chanceRapido: number;
}

export function dificuldadeDaSala(sala: number): Dificuldade {
    const nivel = sala -1;

    const minimo = D.robosBase + Math.floor(nivel / D.salasPorRoboExtra);
    const sorteio = Math.floor(Math.random() * 3); 

    return {
        quantidadeRobos: Math.min(minimo + sorteio, D.robosMaximo),
        multiplicadorVelocidade: Math.min(1 + nivel * D.velocidadePorSala, D.velocidadeMaxima),
        multiplicadorRecarga: Math.max(1 - nivel * D.recargaPorSala, D.recargaMinima),
        chanceRapido: Math.min(D.chanceRapidoInicial + nivel * D.chanceRapidoPorSala, D.chanceRapidoMaxima),
    };
}