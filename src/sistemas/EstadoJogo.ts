import { VIDAS_INICIAIS } from '../config';

export class EstadoJogo {
  pontos = 0;
  vidas = VIDAS_INICIAIS;
  fimDeJogo = false;
  sala = 1;

  adicionarPontos(quantidade: number) {
    this.pontos += quantidade;
  }

  perderVida() {
    if (this.fimDeJogo) return; // evita perder vida depois do game over
    this.vidas -= 1;
    if (this.vidas <= 0) {
      this.vidas = 0;
      this.fimDeJogo = true;
    }
  }

  reiniciar() {
    this.pontos = 0;
    this.vidas = VIDAS_INICIAIS;
    this.sala = 1;
    this.fimDeJogo = false;
  }
}

// Uma única instância compartilhada por todo o jogo
export const estadoJogo = new EstadoJogo();