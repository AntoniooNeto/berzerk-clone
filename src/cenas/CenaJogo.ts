import { Engine, Label, Scene, vec } from 'excalibur';
import { Parede } from '../atores/Parede';
import { Jogador } from '../atores/Jogador';
import { Robo } from '../atores/Robo';
import { gerarSala, sortearPosicoes, type Sala } from '../sistemas/GeradorSala';
import { estadoJogo } from '../sistemas/EstadoJogo';
import { dificuldadeDaSala, type Dificuldade } from '../sistemas/Dificuldade';
import { Placar, Vidas, NumeroSala } from '../atores/Hud';
import {
  LARGURA_JOGO as L,
  ALTURA_JOGO as A,
  ESPESSURA_PAREDE as E,
  TAMANHO_PORTA as P,
  TAMANHO_JOGADOR,
  X0_JOGADOR,
  Y0_JOGADOR,
  type TipoRobo,
} from '../config';

export const jogador = new Jogador(X0_JOGADOR, Y0_JOGADOR, TAMANHO_JOGADOR, TAMANHO_JOGADOR);
type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita'

export class CenaJogo extends Scene {
  onInitialize() {
    this.add(jogador);
    this.add(new Placar());
    this.add(new Vidas());
    this.add(new NumeroSala())
    this.carregarSala();
  }

  onPostUpdate() {
    this.verificarSaida();
  }

  onPreUpdate(_engine: Engine, _elapsed: number): void {
    if (estadoJogo.vidas < estadoJogo.vidasAntes) {
      jogador.reposicionarNaSala();
      estadoJogo.vidasAntes = estadoJogo.vidas;
    }
  }

  // Jogador passou da borda da tela = saiu por uma porta
  private verificarSaida() {
    if (jogador.pos.x < 0) this.carregarSala('esquerda');
    else if (jogador.pos.x > L) this.carregarSala('direita');
    else if (jogador.pos.y < 0) this.carregarSala('cima');
    else if (jogador.pos.y > A) this.carregarSala('baixo');
  }

  // saida = por onde o jogador saiu. Sem argumento = primeira sala.
  private carregarSala(saida?: Direcao) {
    this.limparSala();

    if (saida) {
      estadoJogo.sala += 1;
      this.reposicionarJogador(saida);
    }

    const sala = gerarSala();
    this.montarSala(sala);

    const dificuldade = dificuldadeDaSala(estadoJogo.sala);
    const posicoes = sortearPosicoes(sala, dificuldade.quantidadeRobos);
    this.spawnarRobos(posicoes, dificuldade);
  }

  // Remove paredes, robôs, tiros etc., menos o jogador e os textos do HUD
  private limparSala() {
    for (const ator of this.actors) {
      if (ator === jogador || ator instanceof Label) continue;
      ator.kill();
    }
  }

  // Saiu pela direita, aparece na esquerda, e assim por diante
  private reposicionarJogador(saida: Direcao) {
    const margem = E + TAMANHO_JOGADOR; // logo depois da parede
    if (saida === 'direita') jogador.pos = vec(margem, jogador.pos.y);
    if (saida === 'esquerda') jogador.pos = vec(L - margem, jogador.pos.y);
    if (saida === 'baixo') jogador.pos = vec(jogador.pos.x, margem);
    if (saida === 'cima') jogador.pos = vec(jogador.pos.x, A - margem);
  }


  private spawnarRobos(posicoes: { x: number; y: number }[], dificuldade: Dificuldade) {
  for (const posicao of posicoes) {
    const tipo: TipoRobo = Math.random() < dificuldade.chanceRapido ? 'rapido' : 'comum';
    this.add(new Robo(posicao.x, posicao.y, jogador, tipo, dificuldade));
  }
}

  private montarSala(sala: Sala) {
    const portaX = (L - P) / 2; // aberturas de cima e de baixo
    const portaY = (A - P) / 2; // aberturas da esquerda e da direita

    // Cima
    this.add(new Parede(0, 0, portaX, E));
    this.add(new Parede(portaX + P, 0, L - portaX - P, E));
    // Baixo
    this.add(new Parede(0, A - E, portaX, E));
    this.add(new Parede(portaX + P, A - E, L - portaX - P, E));
    // Esquerda
    this.add(new Parede(0, 0, E, portaY));
    this.add(new Parede(0, portaY + P, E, A - portaY - P));
    // Direita
    this.add(new Parede(L - E, 0, E, portaY));
    this.add(new Parede(L - E, portaY + P, E, A - portaY - P));

    // Paredes internas sorteadas pelo gerador
    for (const p of sala.paredes) {
      this.add(new Parede(p.x, p.y, p.largura, p.altura));
    }
  }
}