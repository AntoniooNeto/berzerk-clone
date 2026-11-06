import { ALTURA_JOGO, LARGURA_JOGO, TAMANHO_TILE as T } from '../config';

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

const COLUNAS = LARGURA_JOGO / T; // 20
const LINHAS = ALTURA_JOGO / T;   // 15

// Os 4 cantos onde podem nascer paredes internas (colunas e linhas, inclusivas).
// Ficam fora da "cruz livre" (colunas 8-11 e linhas 6-9), que liga as 4 portas.
const QUADRANTES = [
  { c0: 1, c1: 7, l0: 1, l1: 5 },
  { c0: 12, c1: 18, l0: 1, l1: 5 },
  { c0: 1, c1: 7, l0: 10, l1: 13 },
  { c0: 12, c1: 18, l0: 10, l1: 13 },
];

function inteiro(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// A célula e as 8 vizinhas precisam estar vazias (paredes não se encostam)
function areaLivre(ocupado: boolean[][], coluna: number, linha: number) {
  for (let l = linha - 1; l <= linha + 1; l++) {
    for (let c = coluna - 1; c <= coluna + 1; c++) {
      if (ocupado[l]?.[c]) return false;
    }
  }
  return true;
}

export function gerarSala(): Sala {
  const ocupado: boolean[][] = Array.from({ length: LINHAS }, () =>
    Array<boolean>(COLUNAS).fill(false)
  );
  const paredes: RetanguloParede[] = [];

  for (const q of QUADRANTES) {
    const alvo = inteiro(1, 2); // 1 ou 2 paredes por canto
    let colocadas = 0;

    for (let tentativa = 0; tentativa < 15 && colocadas < alvo; tentativa++) {
      const horizontal = Math.random() < 0.5;
      const comprimento = inteiro(2, 4);
      const coluna = inteiro(q.c0, q.c1);
      const linha = inteiro(q.l0, q.l1);

      // monta a lista de células do segmento
      const celulas: { c: number; l: number }[] = [];
      for (let i = 0; i < comprimento; i++) {
        celulas.push({
          c: coluna + (horizontal ? i : 0),
          l: linha + (horizontal ? 0 : i),
        });
      }

      // tudo dentro do canto e sem encostar em outra parede?
      const cabe = celulas.every(
        ({ c, l }) =>
          c >= q.c0 && c <= q.c1 && l >= q.l0 && l <= q.l1 && areaLivre(ocupado, c, l)
      );
      if (!cabe) continue;

      for (const { c, l } of celulas) ocupado[l][c] = true;
      paredes.push({
        x: coluna * T,
        y: linha * T,
        largura: horizontal ? comprimento * T : T,
        altura: horizontal ? T : comprimento * T,
      });
      colocadas++;
    }
  }

  // Posições livres para robôs: células dos cantos que não viraram parede
  const posicoesLivres: Posicao[] = [];
  for (const q of QUADRANTES) {
    for (let l = q.l0; l <= q.l1; l++) {
      for (let c = q.c0; c <= q.c1; c++) {
        if (!ocupado[l][c]) {
          posicoesLivres.push({ x: c * T + T / 2, y: l * T + T / 2 });
        }
      }
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