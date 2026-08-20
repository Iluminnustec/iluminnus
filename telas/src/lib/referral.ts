const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I, evita confusão ao ditar/digitar

export function gerarCodigoReferral(): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}
