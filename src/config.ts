import { CollisionGroupManager, Color } from 'excalibur';

// ---------- Tela e grade ----------
export const LARGURA_JOGO = 320;
export const ALTURA_JOGO = 240;
export const TAMANHO_TILE = 16;

// ---------- Regras ----------
export const VIDAS_INICIAIS = 3;
export const PONTOS_ROBO = 50;
export const X0_JOGADOR = LARGURA_JOGO/10;
export const Y0_JOGADOR = ALTURA_JOGO/2;

// ---------- Sala ----------
export const ESPESSURA_PAREDE = TAMANHO_TILE;
export const TAMANHO_PORTA = TAMANHO_TILE * 2; // largura das aberturas

// ---------- Tamanhos das entidades ----------
export const TAMANHO_JOGADOR = 12;
export const TAMANHO_ROBO = 12;
export const TAMANHO_BALA = 4;
export const DISTANCIA_BALA = 6;
export const RECARGA_BALA = 500;

// ---------- Velocidades (pixels por segundo) ----------
export const VELOCIDADE_JOGADOR = 80;
export const VELOCIDADE_ROBO = 30;
export const VELOCIDADE_BALA = 200;

// ---------- Cores do protótipo ----------
export const CORES = {
  jogador: Color.Green,
  robo: Color.Red,
  robo2: Color.Orange,
  balaJogador: Color.White,
  balaInimigo: Color.Yellow,
  parede: Color.Gray,
  otto: Color.Magenta,
  fundo: Color.fromHex('#111111'),
  hud: Color.Black,    // texto sobre a parede cinza
  texto: Color.White,  // texto sobre o fundo escuro
};

// ---------- Grupos de colisão ----------
// ATENÇÃO: criar sempre nesta ordem. Cada grupo recebe um bit na ordem
// de criação (jogador = 1, inimigo = 2, parede = 4, ...), e a máscara usa esses bits.
const JOGADOR = 0b00001;
const INIMIGO = 0b00010;
const PAREDE = 0b00100;
const BALA_JOGADOR = 0b01000;
const BALA_INIMIGO = 0b10000;

export const GruposDeColisao = {
  Jogador: CollisionGroupManager.create('jogador', INIMIGO | PAREDE | BALA_INIMIGO),
  Inimigo: CollisionGroupManager.create('inimigo', JOGADOR | PAREDE | BALA_JOGADOR | INIMIGO),
  Parede: CollisionGroupManager.create('parede', JOGADOR | INIMIGO | BALA_JOGADOR | BALA_INIMIGO),
  BalaJogador: CollisionGroupManager.create('balaJogador', INIMIGO | PAREDE),
  BalaInimigo: CollisionGroupManager.create('balaInimigo', JOGADOR | PAREDE),
};