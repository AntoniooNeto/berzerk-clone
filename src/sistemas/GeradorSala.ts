import { TAMANHO_TILE as T } from '../config';

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

// ---------- Grade do labirinto (medidas em TILES) ----------
// Sala de 20 x 15 tiles; sem a parede externa sobram 18 x 13.
// Largura: 3+3+2+3+3 = 14 de células + 4 tiles de parede entre elas = 18
// Altura:  4+3+4     = 11 de células + 2 tiles de parede entre elas = 13
// Se o tamanho da sala mudar, estas duas listas precisam ser refeitas.
const LARGURAS_CELULA = [3, 2, 4, 2, 3];
const ALTURAS_CELULA = [3, 5, 3];
const COLUNAS = LARGURAS_CELULA.length;
const LINHAS = ALTURAS_CELULA.length;

const CHANCE_ABRIR_EXTRA = 0.35; // maior = sala mais aberta, menor = mais fechada
const MINIMO_PAREDES = 5;        // nunca deixa a sala com menos paredes internas que isso

// Tile onde cada célula começa (o tile 0 é a parede externa)
function inicios(tamanhos: number[]) {
  const lista: number[] = [];
  let t = 1;
  for (const n of tamanhos) {
    lista.push(t);
    t += n + 1; // +1 = o tile de parede entre as células
  }
  return lista;
}
const COLUNA_INICIO = inicios(LARGURAS_CELULA); // [1, 5, 9, 12, 16]
const LINHA_INICIO = inicios(ALTURAS_CELULA);   // [1, 6, 10]

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
    if (restantes <= MINIMO_PAREDES) break;
    if (Math.random() >= CHANCE_ABRIR_EXTRA) continue;
    if (p.vertical) paredeV[p.l][p.c] = false;
    else paredeH[p.l][p.c] = false;
    restantes--;
  }

  // 3) Transforma as paredes que sobraram em retângulos, sempre em tiles inteiros
  const paredes: RetanguloParede[] = [];
  const bloco = (col: number, linha: number, larguraTiles: number, alturaTiles: number) =>
    paredes.push({ x: col * T, y: linha * T, largura: larguraTiles * T, altura: alturaTiles * T });

  // Verticais: ocupam o tile logo à direita da célula c, na altura da célula
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS - 1; c++) {
      if (paredeV[l][c]) {
        bloco(COLUNA_INICIO[c] + LARGURAS_CELULA[c], LINHA_INICIO[l], 1, ALTURAS_CELULA[l]);
      }
    }
  }

  // Horizontais: ocupam o tile logo abaixo da célula l, na largura da célula
  for (let l = 0; l < LINHAS - 1; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      if (paredeH[l][c]) {
        bloco(COLUNA_INICIO[c], LINHA_INICIO[l] + ALTURAS_CELULA[l], LARGURAS_CELULA[c], 1);
      }
    }
  }

  // Pilares nos cruzamentos: só aparecem se alguma parede encosta neles,
  // assim as paredes sempre se emendam sem deixar buraco
  for (let j = 0; j < LINHAS - 1; j++) {
    for (let i = 0; i < COLUNAS - 1; i++) {
      const encosta = paredeV[j][i] || paredeV[j + 1][i] || paredeH[j][i] || paredeH[j][i + 1];
      if (encosta) {
        bloco(COLUNA_INICIO[i] + LARGURAS_CELULA[i], LINHA_INICIO[j] + ALTURAS_CELULA[j], 1, 1);
      }
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
    { c: meioC, l: meioL },
  ];

  const posicoesLivres: Posicao[] = [];
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      if (reservadas.some((r) => r.c === c && r.l === l)) continue;
      posicoesLivres.push({
        x: (COLUNA_INICIO[c] + LARGURAS_CELULA[c] / 2) * T,
        y: (LINHA_INICIO[l] + ALTURAS_CELULA[l] / 2) * T,
      });
    }
  }

  return { paredes, posicoesLivres };
}

// Sorteia 'quantidade' posições diferentes
export function sortearPosicoes(sala: Sala, quantidade: number): Posicao[] {
  return embaralhar(sala.posicoesLivres).slice(0, quantidade);
}