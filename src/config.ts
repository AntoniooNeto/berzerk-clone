import { CollisionGroupManager, Color } from 'excalibur';

// ---------- Tela e grade ----------
export const LARGURA_JOGO = 320;
export const ALTURA_JOGO = 240;
export const TAMANHO_TILE = 16;

// ---------- Sala ----------
export const ESPESSURA_PAREDE = TAMANHO_TILE;
export const TAMANHO_PORTA = TAMANHO_TILE * 2; // largura das aberturas

// ---------- Tamanhos das entidades ----------
export const TAMANHO_JOGADOR = 12;
export const TAMANHO_ROBO = 12;
export const TAMANHO_TIRO = 4;

// ---------- Velocidades (pixels por segundo) ----------
export const VELOCIDADE_JOGADOR = 80;
export const VELOCIDADE_ROBO = 30;
export const VELOCIDADE_TIRO = 200;

// ---------- Cores do protótipo ----------
export const CORES = {
  jogador: Color.Green,
  robo: Color.Red,
  robo2: Color.Orange,
  tiroJogador: Color.White,
  tiroInimigo: Color.Yellow,
  parede: Color.Gray,
  otto: Color.Magenta,
  fundo: Color.fromHex('#111111'),
};

// ---------- Grupos de colisão ----------
// ATENÇÃO: criar sempre nesta ordem. Cada grupo recebe um bit na ordem
// de criação (jogador = 1, inimigo = 2, parede = 4, ...), e a máscara usa esses bits.
const JOGADOR = 0b00001;
const INIMIGO = 0b00010;
const PAREDE = 0b00100;
const TIRO_JOGADOR = 0b01000;
const TIRO_INIMIGO = 0b10000;

export const GruposDeColisao = {
  Jogador: CollisionGroupManager.create('jogador', INIMIGO | PAREDE | TIRO_INIMIGO),
  Inimigo: CollisionGroupManager.create('inimigo', JOGADOR | PAREDE | TIRO_JOGADOR),
  Parede: CollisionGroupManager.create('parede', JOGADOR | INIMIGO | TIRO_JOGADOR | TIRO_INIMIGO),
  TiroJogador: CollisionGroupManager.create('tiroJogador', INIMIGO | PAREDE),
  TiroInimigo: CollisionGroupManager.create('tiroInimigo', JOGADOR | PAREDE),
};