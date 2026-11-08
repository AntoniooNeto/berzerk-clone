import {
  ALTURA_JOGO,
  ESPESSURA_PAREDE,
  ESPESSURA_PAREDE_INTERNA,
  LARGURA_JOGO,
} from '../config';

export interface RetanguloParede {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface Posicao {
  x: number;
  y: number;
}

export interface Sala {
  paredes: RetanguloParede[]; // paredes internas
  posicoesLivres: Posicao[];  // lugares seguros para colocar robôs
}

interface Celula {
  c: number; // coluna
  l: number; // linha
}

// ---------- Ajustes do labirinto ----------
const COLUNAS = 5; // use número ÍMPAR: a porta fica na célula do meio
const LINHAS = 3;  // use número ÍMPAR
const CHANCE_ABRIR_EXTRA = 0.35; // maior = sala mais aberta, menor = mais fechada

// Área jogável (dentro das paredes externas)
const X0 = ESPESSURA_PAREDE;
const Y0 = ESPESSURA_PAREDE;
const LARGURA_CELULA = (LARGURA_JOGO - 2 * ESPESSURA_PAREDE) / COLUNAS;
const ALTURA_CELULA = (ALTURA_JOGO - 2 * ESPESSURA_PAREDE) / LINHAS;
const MINIMO_PAREDES = 5; // nunca deixa a sala com menos paredes internas que isso

function inteiro(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function matriz(linhas: number, colunas: number, valor: boolean): boolean[][] {
  return Array.from({ length: linhas }, () => Array<boolean>(colunas).fill(valor));
}

function vizinhasDe({ c, l }: Celula): Celula[] {
  return [
    { c: c + 1, l },
    { c: c - 1, l },
    { c, l: l + 1 },
    { c, l: l - 1 },
  ].filter((v) => v.c >= 0 && v.c < COLUNAS && v.l >= 0 && v.l < LINHAS);
}


export function gerarSala(): Sala {
  // paredeV[l][c] = parede entre a célula (c, l) e a (c + 1, l)
  // paredeH[l][c] = parede entre a célula (c, l) e a (c, l + 1)
  const paredeV = matriz(LINHAS, COLUNAS - 1, true);
  const paredeH = matriz(LINHAS - 1, COLUNAS, true);

  const derrubar = (a: Celula, b: Celula) => {
    if (a.c !== b.c) paredeV[a.l][Math.min(a.c, b.c)] = false;
    else paredeH[Math.min(a.l, b.l)][a.c] = false;
  };

  // 1) Labirinto: derruba paredes até todas as células ficarem conectadas
  const visitada = matriz(LINHAS, COLUNAS, false);
  const inicio: Celula = { c: inteiro(0, COLUNAS - 1), l: inteiro(0, LINHAS - 1) };
  visitada[inicio.l][inicio.c] = true;
  const pilha: Celula[] = [inicio];

  while (pilha.length > 0) {
    const atual = pilha[pilha.length - 1];
    const opcoes = vizinhasDe(atual).filter((v) => !visitada[v.l][v.c]);
    if (opcoes.length === 0) {
      pilha.pop();
      continue;
    }
    const proxima = embaralhar(opcoes)[0];
    derrubar(atual, proxima);
    visitada[proxima.l][proxima.c] = true;
    pilha.push(proxima);
  } 
  // 2) Derruba algumas paredes extras, para criar voltas,
  //    mas nunca deixa menos que MINIMO_PAREDES
  const fechadas: { vertical: boolean; l: number; c: number }[] = [];
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS - 1; c++) {
      if (paredeV[l][c]) fechadas.push({ vertical: true, l, c });
    }
  }
  for (let l = 0; l < LINHAS - 1; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      if (paredeH[l][c]) fechadas.push({ vertical: false, l, c });
    }
  }

  let restantes = fechadas.length;
  for (const p of embaralhar(fechadas)) {
    if (restantes <= MINIMO_PAREDES) break; // chegou no mínimo: para de derrubar
    if (Math.random() >= CHANCE_ABRIR_EXTRA) continue;
    if (p.vertical) paredeV[p.l][p.c] = false;
    else paredeH[p.l][p.c] = false;
    restantes--;
  }

  // 3) Transforma as paredes que sobraram em retângulos
  const meio = ESPESSURA_PAREDE_INTERNA / 2;
  const paredes: RetanguloParede[] = [];

  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS - 1; c++) {
      if (!paredeV[l][c]) continue;
      const x = X0 + (c + 1) * LARGURA_CELULA;
      const y = Y0 + l * ALTURA_CELULA;
      paredes.push({
        x: Math.round(x - meio),
        y: Math.round(y - meio),
        largura: ESPESSURA_PAREDE_INTERNA,
        altura: Math.round(ALTURA_CELULA + ESPESSURA_PAREDE_INTERNA),
      });
    }
  }

  for (let l = 0; l < LINHAS - 1; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      if (!paredeH[l][c]) continue;
      const x = X0 + c * LARGURA_CELULA;
      const y = Y0 + (l + 1) * ALTURA_CELULA;
      paredes.push({
        x: Math.round(x - meio),
        y: Math.round(y - meio),
        largura: Math.round(LARGURA_CELULA + ESPESSURA_PAREDE_INTERNA),
        altura: ESPESSURA_PAREDE_INTERNA,
      });
    }
  }

  // 4) Posições para robôs: centro das células, menos as das portas e a do meio
  const meioC = Math.floor(COLUNAS / 2);
  const meioL = Math.floor(LINHAS / 2);
  const reservadas: Celula[] = [
    { c: meioC, l: 0 },
    { c: meioC, l: LINHAS - 1 },
    { c: 0, l: meioL },
    { c: COLUNAS - 1, l: meioL },
    { c: meioC, l: meioL }, // onde o jogador nasce na primeira sala
  ];

  const posicoesLivres: Posicao[] = [];
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      if (reservadas.some((r) => r.c === c && r.l === l)) continue;
      posicoesLivres.push({
        x: X0 + (c + 0.5) * LARGURA_CELULA,
        y: Y0 + (l + 0.5) * ALTURA_CELULA,
      });
    }
  }

  return { paredes, posicoesLivres };
}
// Sorteia 'quantidade' posições diferentes
export function sortearPosicoes(sala: Sala, quantidade: number): Posicao[] {
  const copia = [...sala.posicoesLivres];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, quantidade);
}