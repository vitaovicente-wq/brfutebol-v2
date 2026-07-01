import { criarData, adicionarDias, formatarData, diferencaEmDias, criarTemporada, janelaTransferenciasAberta } from './src/engine/calendarEngine.js';
import { gerarCalendarioLiga } from './src/engine/fixtureEngine.js';

const d1 = criarData(2026, 2, 1);
console.log('Data inicial:', formatarData(d1, {comDiaSemana:true}));
const d2 = adicionarDias(d1, 7);
console.log('Mais 7 dias:', formatarData(d2));
console.log('Diferenca em dias:', diferencaEmDias(d1, d2));

const temporada = criarTemporada(2026);
console.log('Janela aberta em 15/jan?', janelaTransferenciasAberta(criarData(2026,1,15), temporada));
console.log('Janela aberta em 1/mar?', janelaTransferenciasAberta(criarData(2026,3,1), temporada));

const times = Array.from({length: 20}, (_,i) => 'time'+i);
const cal = gerarCalendarioLiga(times, temporada);
console.log('Total rodadas geradas (esperado 38):', cal.length);
console.log('Jogos na rodada 1 (esperado 10):', cal[0].jogos.length);
console.log('Data da rodada 1:', formatarData(cal[0].data));
console.log('Data da rodada 38:', formatarData(cal[37].data));

// Confere se cada time joga exatamente 1 vez por rodada
let ok = true;
cal.forEach((r, idx) => {
  const ids = r.jogos.flatMap(j => [j.mandanteId, j.visitanteId]);
  const unicos = new Set(ids);
  if (unicos.size !== ids.length) { ok = false; console.log('ERRO na rodada', idx+1); }
});
console.log('Cada time joga só 1x por rodada?', ok);
