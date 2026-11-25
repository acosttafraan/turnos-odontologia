export type Intervalo = { inicio: number; fin: number };

export function seSuperponen(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fin && b.inicio < a.fin;
}

export function contiene(franja: Intervalo, turno: Intervalo): boolean {
  return franja.inicio <= turno.inicio && turno.fin <= franja.fin;
}

export function intervaloDe(periodo: { inicio: string; fin: string }): Intervalo {
  return { inicio: Date.parse(periodo.inicio), fin: Date.parse(periodo.fin) };
}
