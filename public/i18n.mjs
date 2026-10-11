// Decode Botwise: tradução da camada de exibição (pt-BR).
// As instruções enviadas ao Jev continuam em inglês (o modelo classifica melhor assim);
// aqui só traduzimos o que aparece na tela.
export const LOCALE='pt-BR';

// Nomes das dimensões classificadas pelo Jev e o significado de cada categoria.
export const DIMENSOES={
 topic:{titulo:'Tema',criterios:{business:'Construção de negócio, empreendedorismo, operação',money:'Finanças pessoais, renda, investimentos',marketing:'Marketing, vendas, construção de audiência, conteúdo',mindset:'Crenças, motivação, resiliência, confiança',habits:'Produtividade, disciplina, rotina',relationships:'Relacionamentos, comunicação, vida social',health:'Saúde, exercício, nutrição, bem-estar',technology:'Tecnologia, IA, software, ferramentas',other:'Tema claro fora das outras opções',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}},
 opening:{titulo:'Forma de abertura',criterios:{question:'Abre fazendo uma pergunta',instruction:'Abre com uma ordem direta para quem assiste',claim:'Abre com uma afirmação ou observação',story:'Abre narrando um acontecimento ou experiência pessoal',dialogue:'Abre com um diálogo ou fala citada',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}},
 mechanism:{titulo:'Mecanismo do gancho',criterios:{contradiction:'Contraria uma crença ou expectativa comum',curiosity:'Segura uma resposta ou abre uma lacuna de informação',result:'Promete ou mostra um resultado concreto e desejável',mistake:'Alerta sobre um erro, custo, risco ou perda',recognition:'Descreve uma situação ou frustração em que a pessoa se reconhece',story:'Apresenta um acontecimento cujo desfecho ainda não foi contado',direct:'Diz o assunto ou o conselho direto, sem outro mecanismo claro',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}},
 structure:{titulo:'Estrutura do roteiro',criterios:{story:'Os acontecimentos se desenrolam e levam a uma lição',steps:'Sequência, checklist ou lista de dicas',problem_solution:'Apresenta um problema e depois a solução',explanation:'Explica como ou por que algo funciona',comparison:'Compara duas ou mais abordagens ou alternativas',opinion:'Defende um ponto de vista',qa:'Pergunta e resposta',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}},
 evidence:{titulo:'Prova apresentada',criterios:{example:'Exemplo concreto ou cenário ilustrativo',personal:'História pessoal ou experiência própria',numbers:'Resultado numérico ou afirmação com números',source:'Pessoa, publicação ou estudo citado',reasoning:'Raciocínio explícito, sem prova concreta',none:'Nenhuma sustentação explícita',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}},
 emotion:{titulo:'Apelo emocional',criterios:{aspiration:'Desejo de conquista ou de um futuro melhor',concern:'Medo, risco, preocupação ou possível perda',relief:'Tranquilidade, validação ou alívio',surprise:'Revelação inesperada ou contraste',amusement:'Humor ou entretenimento',neutral:'Mais informativo, sem apelo emocional claro',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}},
 specificity:{titulo:'Nível de detalhe do conselho',criterios:{none:'Não dá conselho',principle:'Princípio geral, sem ação concreta',action:'Uma ação específica que a pessoa pode fazer',sequence:'Várias ações concretas e em ordem',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}},
 cta:{titulo:'CTA falado',criterios:{none:'Nenhum pedido explícito de ação',follow:'Seguir ou se inscrever',engage:'Curtir, salvar ou compartilhar',comment:'Comentar ou responder',visit:'Acessar link, site ou material',buy:'Comprar ou agendar',multiple:'Vários pedidos de ação diferentes',unclear:'Fala insuficiente, ambígua ou sem categoria adequada'}}
};

// Rótulos curtos de cada categoria, papel de trecho, métrica e estado.
export const ROTULOS={
 // tema
 business:'Negócios',money:'Dinheiro',marketing:'Marketing',mindset:'Mentalidade',habits:'Hábitos',relationships:'Relacionamentos',health:'Saúde',technology:'Tecnologia',other:'Outro',unclear:'Indefinido',
 // abertura
 question:'Pergunta',instruction:'Instrução',claim:'Afirmação',dialogue:'Diálogo',
 // mecanismo do gancho
 contradiction:'Contradição',curiosity:'Curiosidade',result:'Resultado',mistake:'Erro',recognition:'Identificação',story:'História',direct:'Direto',
 // estrutura
 steps:'Passos',problem_solution:'Problema → solução',explanation:'Explicação',comparison:'Comparação',opinion:'Opinião',qa:'Perguntas e respostas',
 // prova
 example:'Exemplo',personal:'Experiência pessoal',numbers:'Números',source:'Fonte citada',reasoning:'Raciocínio',none:'Nenhum',
 // emoção
 aspiration:'Aspiração',concern:'Preocupação',relief:'Alívio',surprise:'Surpresa',amusement:'Humor',neutral:'Neutro',
 // nível do conselho
 principle:'Princípio',action:'Ação',sequence:'Sequência',
 // CTA
 follow:'Seguir',engage:'Curtir / salvar',comment:'Comentar',visit:'Acessar link',buy:'Comprar',multiple:'Vários',
 // papéis dos trechos do roteiro
 hook:'Gancho',setup:'Contexto',problem:'Problema',advice:'Conselho',payoff:'Desfecho',cta:'CTA',
 // estados de cada Reel
 no_audio:'Sem áudio',too_little_speech:'Pouca fala',needs_retry:'Tentar de novo',unclassified:'Não classificado',
 // métricas
 views:'Visualizações',plays:'Reproduções',
 // provedores
 groq:'Groq',fireworks:'Fireworks',apify:'Apify',jev:'Jev'
};
// "story" e "example" aparecem em mais de uma dimensão; o rótulo vale para todas.

// O que cada papel de trecho do roteiro significa (barra colorida da "Anatomia do roteiro").
export const PAPEIS={hook:'Cria o motivo inicial para continuar assistindo',setup:'Dá o contexto necessário para entender a ideia principal',problem:'Aponta um obstáculo, erro, custo ou conflito',example:'Traz uma ilustração, história, prova ou caso concreto',advice:'Entrega a recomendação principal ou explica o que fazer',payoff:'Responde a pergunta da abertura ou entrega a conclusão',cta:'Pede para seguir, comentar, compartilhar, acessar ou comprar',other:'Transição ou trecho sem outro papel claro'};

export const ESTADOS={ready:'pronta',scraping:'coletando',running:'processando',paused:'pausada',complete:'concluída',partial:'parcial',failed:'com falha',interrupted:'interrompida',rehearsal:'demonstração',transcribing:'transcrevendo',transcribed:'transcrito',classifying:'classificando',no_audio:'sem áudio',no_speech:'sem fala'};

export const rotulo=s=>{const k=String(s??'unclear');return ROTULOS[k]||k.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());};
export const estado=s=>ESTADOS[s]||s||'';

// Substitui títulos e descrições das dimensões vindos do servidor pelas versões em português.
export function traduzBoot(boot){
 for(const [k,d] of Object.entries(boot.dimensions||{})){const pt=DIMENSOES[k];if(!pt)continue;d.title=pt.titulo;d.criteria=Object.fromEntries(Object.keys(d.criteria).map(c=>[c,pt.criterios[c]||d.criteria[c]]));}
 return boot;
}

// Mensagens de erro e de atividade que o servidor manda em inglês.
const MENSAGENS=[
 [/^Apify collecting Reel metadata$/,'Apify coletando os dados dos Reels'],
 [/^Pause requested\. In-flight requests will finish\.$/,'Pausa solicitada. Os pedidos em andamento vão terminar.'],
 [/^(\d+) unique Reels collected$/,'$1 Reels únicos coletados'],
 [/^(\w+) retry queued: (.+)$/,'$1: nova tentativa na fila para $2'],
 [/^Classified (.+)$/,'Classificado $1'],
 [/^Transcribed (.+)$/,'Transcrito $1'],
 [/^Skipped media without audio: (.+)$/,'Ignorado por não ter áudio: $1'],
 [/^Skipped short speech: (.+)$/,'Ignorado por ter pouca fala: $1'],
 [/^(\w+) pacing: up to (\d+) requests\/minute; short rate limits retry automatically$/,'$1: até $2 pedidos por minuto; limites curtos são repetidos sozinhos'],
 [/^Apify cap must be \$0\.05 to \$30$/,'O teto do Apify deve ficar entre US$ 0,05 e US$ 30'],
 [/^Apify launch response was lost\. Import the run ID from Apify to avoid starting and charging twice\.$/,'A resposta do Apify se perdeu. Importe o ID da execução do Apify para não iniciar e cobrar duas vezes.'],
 [/^Audio exceeds upload limit$/,'O áudio passa do limite de envio'],
 [/^Choose 1 to 1,000 Reels$/,'Escolha de 1 a 1.000 Reels'],
 [/^Concurrency must be 1 to 12$/,'Pedidos paralelos devem ficar entre 1 e 12'],
 [/^Could not inspect source audio$/,'Não foi possível ler o áudio do vídeo'],
 [/^Enter a valid Instagram handle$/,'Digite um perfil do Instagram válido'],
 [/^Import must be an array of Apify Reel objects$/,'A importação precisa ser uma lista de Reels exportada do Apify'],
 [/^Invalid Apify dataset$/,'Conjunto de dados do Apify inválido'],
 [/^Invalid Apify run ID$/,'ID de execução do Apify inválido'],
 [/^Invalid metric$/,'Métrica inválida'],
 [/^Jev returned an invalid response$/,'O Jev devolveu uma resposta inválida'],
 [/^Media URL must come from Instagram or Apify CDN$/,'O link da mídia precisa vir do Instagram ou do Apify'],
 [/^Media exceeds download size limit$/,'A mídia passa do limite de download'],
 [/^Missing or invalid Reel ID$/,'ID do Reel ausente ou inválido'],
 [/^No matching creator Reels in this import$/,'Nenhum Reel desse perfil nessa importação'],
 [/^No speech detected in Reel$/,'Nenhuma fala detectada no Reel'],
 [/^No speech to classify$/,'Não há fala para classificar'],
 [/^No usable audio track\. Refresh the source audio URL or inspect the original Reel\.$/,'Sem trilha de áudio utilizável. Atualize o link do áudio ou confira o Reel original.'],
 [/^No usable media URL$/,'Sem link de mídia utilizável'],
 [/^One source has no audio; another source could not be verified\. Refresh the media URLs\.$/,'Uma fonte não tem áudio e a outra não pôde ser verificada. Atualize os links de mídia.'],
 [/^Pause the current run first$/,'Pause a análise atual primeiro'],
 [/^Pause the run before attaching an Apify run$/,'Pause a análise antes de anexar uma execução do Apify'],
 [/^Request exceeds 20 MB$/,'O pedido passa de 20 MB'],
 [/^Run not found$/,'Análise não encontrada'],
 [/^Too many media redirects$/,'Redirecionamentos demais no link da mídia'],
 [/^Transcript exceeds the supported Reel length; split it before classification$/,'A transcrição passa do tamanho suportado; divida antes de classificar'],
 [/^Unsupported thumbnail format$/,'Formato de miniatura não suportado'],
 [/^Use a two-letter language code$/,'Use um código de idioma de duas letras'],
 [/^Too little spoken content for script analysis$/,'Pouca fala para analisar o roteiro'],
 [/^(\w+): connection failed or timed out$/,'$1: a conexão falhou ou demorou demais'],
 [/^Apify returned no Reels \((.+)\)$/,'O Apify não devolveu nenhum Reel ($1)'],
 [/^Connect (.+) in Connections first$/,'Conecte $1 em Conexões primeiro'],
 [/^Invalid or missing Jev answer: (.+)$/,'Resposta do Jev ausente ou inválida: $1'],
 [/^Media download failed \((\d+)\); refresh the source URLs$/,'O download da mídia falhou ($1); atualize os links'],
 [/^Local requests only$/,'Acesso não permitido'],
 [/^Refresh the local app before changing data$/,'Recarregue a página antes de alterar dados'],
 [/^Request failed$/,'O pedido falhou'],
 [/^Failed to fetch$/,'Sem conexão com o servidor']
];
// Traduz uma mensagem (inteira ou após um prefixo "ID: ") se ela for conhecida.
export function traduz(msg){
 const s=String(msg??'');if(!s)return s;
 for(const [re,pt] of MENSAGENS)if(re.test(s))return s.replace(re,pt);
 const m=s.match(/^([\w-]+): (.+)$/);if(m){const t=traduz(m[2]);if(t!==m[2])return `${m[1]}: ${t}`;}
 return s;
}

export const numeroCompacto=n=>n===null||n===undefined?'Desconhecido':new Intl.NumberFormat(LOCALE,{notation:'compact',maximumFractionDigits:1}).format(n);
export const dinheiro=(n,d=4)=>n===null||n===undefined?'Desconhecido':`US$ ${n.toFixed(d).replace('.',',')}`;
export const decimal=(n,d=1)=>n===null||n===undefined?'Desconhecido':n.toFixed(d).replace('.',',');
