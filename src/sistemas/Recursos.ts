import { ImageSource } from 'excalibur';

const base = import.meta.env.BASE_URL;

export const Recursos = {
  Arqueiro: new ImageSource(`${base}assets/images/arqueiro.png`),
  Rato: new ImageSource(`${base}assets/images/rato.png`),
  Mago: new ImageSource(`${base}assets/images/ogro_mago.png`),
  Parede: new ImageSource(`${base}assets/images/Tileset.png`),
};