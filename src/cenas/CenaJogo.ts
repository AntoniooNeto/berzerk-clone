import { Engine, Label, Scene, Color, vec, Actor, CollisionType } from 'excalibur';
import { Parede } from '../atores/Parede';
import { Jogador } from '../atores/Jogador';
import { Robo } from '../atores/Robo';
import { Porta } from '../atores/Porta';
import { gerarSala, sortearPosicoes, type Sala } from '../sistemas/GeradorSala';
import { estadoJogo } from '../sistemas/EstadoJogo';
import { dificuldadeDaSala, type Dificuldade } from '../sistemas/Dificuldade';
import { Placar, Vidas, NumeroSala, MensagemBonus } from '../atores/Hud';
import {
  LARGURA_JOGO as L,
  ALTURA_JOGO as A,
  ESPESSURA_PAREDE as E,
  TAMANHO_PORTA as P,
  TAMANHO_JOGADOR,
  X0_JOGADOR,
  Y0_JOGADOR,
  type TipoRobo,
  BONUS_SALA_LIMPA,
  TILES,
  DURACAO_FADE,
  ESPESSURA_PORTA,
  TAMANHO_PORTA as PL,
} from '../config';

export const jogador = new Jogador(X0_JOGADOR, Y0_JOGADOR, TAMANHO_JOGADOR, TAMANHO_JOGADOR);
type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita'
type Fase = 'jogando' | 'escurecendo' | 'clareando';

export class CenaJogo extends Scene {
  private salaLimpa = false;
  private chao!: Actor;
  private portas: Porta[] = [];
  private cortina!: Actor;
  private fase: Fase = 'jogando';
  private alfa = 0;
  private saidaPendente: Direcao | null = null;

  onInitialize() {
    this.add(jogador);
    jogador.reposicionarNaSala();
    this.add(new Placar());
    this.add(new Vidas());
    this.add(new NumeroSala())
    //this.criarChao(); 
    this.criarCortina(); 
    this.carregarSala();
  }

  onPostUpdate() {
    this.verificarSaida();
    this.verificarSalaLimpa();
  }

  onPreUpdate(_engine: Engine, delta: number): void {
    this.atualizarTransicao(delta);  
    if (estadoJogo.vidas < estadoJogo.vidasAntes) {
      jogador.reposicionarNaSala();
      estadoJogo.vidasAntes = estadoJogo.vidas;
    }
  }

  private verificarSalaLimpa() {
    if (this.salaLimpa || estadoJogo.robosRestantes > 0) return;
    this.salaLimpa = true;
    this.abrirPortas(); 
    estadoJogo.adicionarPontos(BONUS_SALA_LIMPA);
    this.add(new MensagemBonus(`SALA LIMPA! +${BONUS_SALA_LIMPA}`));
    console.log('Sala Limpa! Bonus:', BONUS_SALA_LIMPA);
  }

  // Jogador passou da borda da tela = saiu por uma porta
  private verificarSaida() {
    if (this.fase !== 'jogando' || !this.salaLimpa) return;

    const m = E / 2; // metade da espessura da parede

    if (jogador.pos.x < m) this.iniciarTransicao('esquerda');
    else if (jogador.pos.x > L - m) this.iniciarTransicao('direita');
    else if (jogador.pos.y < m) this.iniciarTransicao('cima');
    else if (jogador.pos.y > A - m) this.iniciarTransicao('baixo');
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
    this.fecharPortas();
    const dificuldade = dificuldadeDaSala(estadoJogo.sala);
    const posicoes = sortearPosicoes(sala, dificuldade.quantidadeRobos);
    this.spawnarRobos(posicoes, dificuldade);
    estadoJogo.robosRestantes = posicoes.length;
    this.salaLimpa = false;
  }

  // Remove paredes, robôs, tiros etc., menos o jogador e os textos do HUD
  private limparSala() {
    for (const ator of this.actors) {
      if (ator === jogador|| ator == this.chao || ator instanceof Label || ator === this.cortina) continue;
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
     const portaY = (A - PL) / 2; // aberturas da esquerda e da direita

    // Paredes externas, todas com o tile de parede
    const externa = (x: number, y: number, largura: number, altura: number) =>
    this.add(new Parede(x, y, largura, altura, undefined, TILES.parede));

    // Cima
    externa(0, 0, portaX, E);
    externa(portaX + P, 0, L - portaX - P, E);
    // Baixo
    externa(0, A - E, portaX, E);
    externa(portaX + P, A - E, L - portaX - P, E);
    // Esquerda
    externa(0, 0, E, portaY);
    externa(0, portaY + PL, E, A - portaY - PL);
    // Direita
    externa(L - E, 0, E, portaY);
    externa(L - E, portaY + PL, E, A - portaY - PL);

    // Paredes internas sorteadas pelo gerador
    for (const p of sala.paredes) {
      this.add(new Parede(p.x, p.y, p.largura, p.altura, undefined, TILES.parede));
    }
  }
    // Retângulo preto sobre a tela inteira; a opacidade dele faz o fade
  private criarCortina() {
    this.cortina = new Actor({
      pos: vec(0, 0),
      anchor: vec(0, 0),
      width: L,
      height: A,
      color: Color.Black,
      z: 100, // por cima de tudo, inclusive do HUD
      collisionType: CollisionType.PreventCollision,
    });
    this.cortina.graphics.opacity = 0;
    this.add(this.cortina);
  }
  private iniciarTransicao(saida: Direcao) {
    this.fase = 'escurecendo';
    this.saidaPendente = saida;
    jogador.bloqueado = true;
  }

  private atualizarTransicao(delta: number) {
    if (this.fase === 'escurecendo') {
      this.alfa = Math.min(1, this.alfa + delta / DURACAO_FADE);

      // Tela toda preta: troca a sala sem ninguém ver
      if (this.alfa >= 1 && this.saidaPendente) {
        this.carregarSala(this.saidaPendente);
        this.saidaPendente = null;
        this.fase = 'clareando';
        jogador.bloqueado = false; // pode andar enquanto a tela clareia
      }
    } else if (this.fase === 'clareando') {
      this.alfa = Math.max(0, this.alfa - delta / DURACAO_FADE);
      if (this.alfa <= 0) this.fase = 'jogando';
    }

    this.cortina.graphics.opacity = this.alfa;
  }

  private fecharPortas() {
    const portaX = (L - P) / 2;
    const portaY = (A - P) / 2;
    const f = (E - ESPESSURA_PORTA) / 2;

    this.portas = [
      new Porta(portaX, f, P, ESPESSURA_PORTA),             // cima
      new Porta(portaX, A - E + f, P, ESPESSURA_PORTA),     // baixo
      new Porta(f, portaY, ESPESSURA_PORTA, P),             // esquerda
      new Porta(L - E + f, portaY, ESPESSURA_PORTA, P),     // direita
    ];
    for (const porta of this.portas) this.add(porta);
  }

  private abrirPortas() {
    for (const porta of this.portas) porta.kill();
    this.portas = [];
  }
}

