// INTEGRAÇÃO COM A FEIRA DE JOGOS (https://feira-de-jogos.dev.br)
// Ao encerrar o capítulo, o jogador entra com a conta Google e recebe
// créditos ("tijolinhos") na Feira de Jogos.
//
// ATENÇÃO (configuração do dono do jogo):
// - productId DEVE ser o id cadastrado para ESTE jogo no banco de dados da
//   Feira de Jogos. O valor 1 abaixo é só um marcador provisório.
// - creditValue é a quantidade de tijolinhos creditada por partida (provisório).
// - O cliente OAuth do Google (clientId) precisa autorizar a origem deste site
//   (ex.: https://seu-dominio.com e http://localhost:3000) em
//   "Origens JavaScript autorizadas"; caso contrário o login não aparece.
// - enabled: false desliga a integração por completo.
export const feiraConfig = Object.freeze({
    enabled: true,
    clientId: "331191695151-ku8mdhd76pc2k36itas8lm722krn0u64.apps.googleusercontent.com",
    apiUrl: "https://feira-de-jogos.dev.br/api/v2/credit",
    productId: 1,
    creditValue: 100
});
