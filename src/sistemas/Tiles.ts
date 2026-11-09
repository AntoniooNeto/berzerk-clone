import { Sprite, SpriteSheet } from 'excalibur';
import { TAMANHO_TILE, TILESET_COLUNAS, TILESET_LINHAS } from '../config';
import { Recursos } from './Recursos';

export interface RefTile {
    col: number;
    linha: number;
}

// A folha é criada uma vez só, na primeira vez que alguém pede um tile
let folha: SpriteSheet | null = null;

function obterFolha() {
    if (!folha) {
        folha = SpriteSheet.fromImageSource({
            image: Recursos.Parede,
            grid: {
                rows: TILESET_LINHAS,
                columns: TILESET_COLUNAS,
                spriteWidth: TAMANHO_TILE,
                spriteHeight: TAMANHO_TILE,
            },
        });
    }
    return folha;
}

// largura e altura menores que o tile servem para recortar a ponta das paredes
export function pegarTile(ref: RefTile, largura = TAMANHO_TILE, altura = TAMANHO_TILE): Sprite {
    const base = obterFolha().getSprite(ref.col, ref.linha);
    if (!base) {
        throw new Error(`Tile fora da folha: ${ref.col},${ref.linha}. Confira TILESET_COLUNAS e TILESET_LINHAS.`);
    }
    if (largura === TAMANHO_TILE && altura === TAMANHO_TILE) return base;

    const corte = base.clone();
    corte.sourceView.width = largura;
    corte.sourceView.height = altura;
    corte.destSize.width = largura;
    corte.destSize.height = altura;
    return corte;
}