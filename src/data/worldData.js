// Estrutura mundial de competições do BRFutebol World Manager.
// Cada continente contém países, cada país contém ligas (divisões).
// Os clubes de cada liga ficam em clubsData.js, referenciados por ligaId.

export const CONTINENTES = [
  {
    id: 'america-sul',
    nome: 'América do Sul',
    paises: ['brasil', 'argentina', 'uruguai', 'paraguai', 'chile', 'colombia'],
  },
  {
    id: 'america-norte',
    nome: 'América do Norte',
    paises: ['mexico', 'eua', 'canada'],
  },
  {
    id: 'europa',
    nome: 'Europa',
    paises: ['portugal', 'espanha', 'franca', 'inglaterra', 'alemanha', 'italia', 'paises-baixos'],
  },
  {
    id: 'asia',
    nome: 'Ásia',
    paises: ['japao', 'arabia-saudita'],
  },
];

export const PAISES = {
  brasil:          { id: 'brasil',          nome: 'Brasil',          bandeira: '🇧🇷', flagCode: 'br', continente: 'america-sul',   ligas: ['br-serie-a', 'br-serie-b', 'br-serie-c', 'br-serie-d'] },
  argentina:       { id: 'argentina',       nome: 'Argentina',       bandeira: '🇦🇷', flagCode: 'ar', continente: 'america-sul',   ligas: ['arg-primera', 'arg-nacional'] },
  uruguai:         { id: 'uruguai',         nome: 'Uruguai',         bandeira: '🇺🇾', flagCode: 'uy', continente: 'america-sul',   ligas: ['uru-primera'] },
  paraguai:        { id: 'paraguai',        nome: 'Paraguai',        bandeira: '🇵🇾', flagCode: 'py', continente: 'america-sul',   ligas: ['par-primera'] },
  chile:           { id: 'chile',           nome: 'Chile',           bandeira: '🇨🇱', flagCode: 'cl', continente: 'america-sul',   ligas: ['chi-primera'] },
  colombia:        { id: 'colombia',        nome: 'Colômbia',        bandeira: '🇨🇴', flagCode: 'co', continente: 'america-sul',   ligas: ['col-primera-a'] },
  mexico:          { id: 'mexico',          nome: 'México',          bandeira: '🇲🇽', flagCode: 'mx', continente: 'america-norte', ligas: ['mex-liga-mx'] },
  eua:             { id: 'eua',             nome: 'Estados Unidos',  bandeira: '🇺🇸', flagCode: 'us', continente: 'america-norte', ligas: ['eua-mls'] },
  canada:          { id: 'canada',          nome: 'Canadá',          bandeira: '🇨🇦', flagCode: 'ca', continente: 'america-norte', ligas: ['can-premier'] },
  portugal:        { id: 'portugal',        nome: 'Portugal',        bandeira: '🇵🇹', flagCode: 'pt', continente: 'europa',        ligas: ['por-primeira', 'por-liga2'] },
  espanha:         { id: 'espanha',         nome: 'Espanha',         bandeira: '🇪🇸', flagCode: 'es', continente: 'europa',        ligas: ['esp-laliga', 'esp-laliga2'] },
  franca:          { id: 'franca',          nome: 'França',          bandeira: '🇫🇷', flagCode: 'fr', continente: 'europa',        ligas: ['fra-ligue1'] },
  inglaterra:      { id: 'inglaterra',      nome: 'Inglaterra',      bandeira: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flagCode: 'gb-eng', continente: 'europa',  ligas: ['ing-premier', 'ing-championship'] },
  alemanha:        { id: 'alemanha',        nome: 'Alemanha',        bandeira: '🇩🇪', flagCode: 'de', continente: 'europa',        ligas: ['ale-bundesliga', 'ale-bundesliga2'] },
  italia:          { id: 'italia',          nome: 'Itália',          bandeira: '🇮🇹', flagCode: 'it', continente: 'europa',        ligas: ['ita-seriea', 'ita-serieb'] },
  'paises-baixos': { id: 'paises-baixos',  nome: 'Países Baixos',   bandeira: '🇳🇱', flagCode: 'nl', continente: 'europa',        ligas: ['hol-eredivisie'] },
  japao:           { id: 'japao',           nome: 'Japão',           bandeira: '🇯🇵', flagCode: 'jp', continente: 'asia',          ligas: ['jap-j1'] },
  'arabia-saudita':{ id: 'arabia-saudita', nome: 'Arábia Saudita',  bandeira: '🇸🇦', flagCode: 'sa', continente: 'asia',          ligas: ['ksa-pro-league'] },
};

// divisaoNivel: 1 = primeira divisão, 2 = segunda, etc. Usado para regras de acesso a competições continentais.
export const LIGAS = {
  'br-serie-a': { id: 'br-serie-a', nome: 'Série A', pais: 'brasil', divisaoNivel: 1, numTimes: 20, numRodadas: 38 },
  'br-serie-b': { id: 'br-serie-b', nome: 'Série B', pais: 'brasil', divisaoNivel: 2, numTimes: 20, numRodadas: 38 },
  'br-serie-c': { id: 'br-serie-c', nome: 'Série C', pais: 'brasil', divisaoNivel: 3, numTimes: 20, numRodadas: 19 },
  'br-serie-d': { id: 'br-serie-d', nome: 'Série D', pais: 'brasil', divisaoNivel: 4, numTimes: 16, numRodadas: 15 },

  'arg-primera': { id: 'arg-primera', nome: 'Primera División', pais: 'argentina', divisaoNivel: 1, numTimes: 16, numRodadas: 30 },
  'arg-nacional': { id: 'arg-nacional', nome: 'Primera Nacional', pais: 'argentina', divisaoNivel: 2, numTimes: 16, numRodadas: 30 },
  'uru-primera': { id: 'uru-primera', nome: 'Primera División', pais: 'uruguai', divisaoNivel: 1, numTimes: 16, numRodadas: 30 },
  'par-primera': { id: 'par-primera', nome: 'Primera División', pais: 'paraguai', divisaoNivel: 1, numTimes: 12, numRodadas: 22 },
  'chi-primera': { id: 'chi-primera', nome: 'Primera División', pais: 'chile', divisaoNivel: 1, numTimes: 16, numRodadas: 30 },
  'col-primera-a': { id: 'col-primera-a', nome: 'Categoría Primera A', pais: 'colombia', divisaoNivel: 1, numTimes: 16, numRodadas: 30 },

  'mex-liga-mx': { id: 'mex-liga-mx', nome: 'Liga MX', pais: 'mexico', divisaoNivel: 1, numTimes: 18, numRodadas: 17 },
  'eua-mls': { id: 'eua-mls', nome: 'MLS', pais: 'eua', divisaoNivel: 1, numTimes: 16, numRodadas: 30 },
  'can-premier': { id: 'can-premier', nome: 'Canadian Premier League', pais: 'canada', divisaoNivel: 1, numTimes: 8, numRodadas: 14 },

  'por-primeira': { id: 'por-primeira', nome: 'Primeira Liga', pais: 'portugal', divisaoNivel: 1, numTimes: 18, numRodadas: 34 },
  'por-liga2': { id: 'por-liga2', nome: 'Liga Portugal 2', pais: 'portugal', divisaoNivel: 2, numTimes: 16, numRodadas: 30 },
  'esp-laliga': { id: 'esp-laliga', nome: 'LaLiga', pais: 'espanha', divisaoNivel: 1, numTimes: 20, numRodadas: 38 },
  'esp-laliga2': { id: 'esp-laliga2', nome: 'LaLiga 2', pais: 'espanha', divisaoNivel: 2, numTimes: 16, numRodadas: 30 },
  'fra-ligue1': { id: 'fra-ligue1', nome: 'Ligue 1', pais: 'franca', divisaoNivel: 1, numTimes: 18, numRodadas: 34 },
  'ing-premier': { id: 'ing-premier', nome: 'Premier League', pais: 'inglaterra', divisaoNivel: 1, numTimes: 20, numRodadas: 38 },
  'ing-championship': { id: 'ing-championship', nome: 'Championship', pais: 'inglaterra', divisaoNivel: 2, numTimes: 16, numRodadas: 30 },
  'ale-bundesliga': { id: 'ale-bundesliga', nome: 'Bundesliga', pais: 'alemanha', divisaoNivel: 1, numTimes: 18, numRodadas: 34 },
  'ale-bundesliga2': { id: 'ale-bundesliga2', nome: '2. Bundesliga', pais: 'alemanha', divisaoNivel: 2, numTimes: 16, numRodadas: 30 },
  'ita-seriea': { id: 'ita-seriea', nome: 'Serie A', pais: 'italia', divisaoNivel: 1, numTimes: 20, numRodadas: 38 },
  'ita-serieb': { id: 'ita-serieb', nome: 'Serie B', pais: 'italia', divisaoNivel: 2, numTimes: 16, numRodadas: 30 },
  'hol-eredivisie': { id: 'hol-eredivisie', nome: 'Eredivisie', pais: 'paises-baixos', divisaoNivel: 1, numTimes: 16, numRodadas: 30 },

  'jap-j1': { id: 'jap-j1', nome: 'J1 League', pais: 'japao', divisaoNivel: 1, numTimes: 18, numRodadas: 34 },
  'ksa-pro-league': { id: 'ksa-pro-league', nome: 'Saudi Pro League', pais: 'arabia-saudita', divisaoNivel: 1, numTimes: 16, numRodadas: 30 },
};

// Competições continentais e mundiais (estrutura inicial — elegibilidade calculada à parte)
export const COMPETICOES_CONTINENTAIS = [
  { id: 'libertadores', nome: 'Copa Libertadores', escopo: 'america-sul' },
  { id: 'sul-americana', nome: 'Copa Sul-Americana', escopo: 'america-sul' },
  { id: 'champions-league', nome: 'Champions League', escopo: 'europa' },
  { id: 'europa-league', nome: 'Europa League', escopo: 'europa' },
  { id: 'conference-league', nome: 'Conference League', escopo: 'europa' },
];

export const COMPETICOES_MUNDIAIS = [
  { id: 'mundial-clubes', nome: 'Mundial de Clubes' },
];

export function getPaisesPorContinente(continenteId) {
  const cont = CONTINENTES.find((c) => c.id === continenteId);
  if (!cont) return [];
  return cont.paises.map((pid) => PAISES[pid]);
}

export function getLigasPorPais(paisId) {
  const pais = PAISES[paisId];
  if (!pais) return [];
  return pais.ligas.map((lid) => LIGAS[lid]);
}
