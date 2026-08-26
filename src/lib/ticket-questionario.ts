export interface TicketDomanda {
  slug: string;
  domanda: string;
  opzioni: { value: string; label: string }[];
}

export const TICKET_QUESTIONARIO: TicketDomanda[] = [
  {
    slug: "problema",
    domanda: "Qual è il problema?",
    opzioni: [
      { value: "muri_soffitti_danneggiati", label: "Muri o soffitti danneggiati" },
      { value: "consumo_idrico_anomalo", label: "Consumo idrico anomalo" },
      { value: "posizione_sottoservizio", label: "Conoscere la posizione di un sottoservizio" },
      { value: "perdita_antincendio", label: "Perdita nell'impianto antincendio" },
      { value: "perdita_gas_metano", label: "Perdita di gas metano" },
      { value: "videoispezione_tubo", label: "Videoispezionare un tubo" },
    ],
  },
  {
    slug: "evoluzione_danno",
    domanda: "Da quanto tempo si vede il danno? In quanto tempo si è evoluta la situazione?",
    opzioni: [
      { value: "veloce_1_10_giorni", label: "Si è evoluto velocemente, in una settimana - 10 giorni" },
      {
        value: "lento_1_2_mesi",
        label: "Si è evoluto lentamente, nell'arco degli ultimi 1 - 2 mesi",
      },
      {
        value: "pregresso_mesi_anni",
        label: "La situazione ha un pregresso di vari mesi se non anni",
      },
    ],
  },
  {
    slug: "continuita_perdita",
    domanda: "La perdita risulta essere continua o intermittente?",
    opzioni: [
      { value: "continua", label: "La perdita è sempre della stessa intensità" },
      { value: "intermittente", label: "La perdita si manifesta a volte sì e a volte no" },
    ],
  },
  {
    slug: "danno_terzi",
    domanda: "Il danno sta danneggiando anche altre abitazioni?",
    opzioni: [
      { value: "danneggia_adiacenti", label: "Il danno danneggia altri inquilini adiacenti" },
      { value: "non_danneggia_terzi", label: "Il danno non danneggia terzi" },
    ],
  },
  // le prossime domande si aggiungono qui, stesso formato
];

function opzioneLabel(domanda: TicketDomanda, value: string): string {
  return domanda.opzioni.find((o) => o.value === value)?.label ?? value;
}

export function risposteLabel(slug: string, value: string): string {
  const domanda = TICKET_QUESTIONARIO.find((d) => d.slug === slug);
  return domanda ? opzioneLabel(domanda, value) : value;
}

export function generaTitoloDaRisposte(risposte: Record<string, string[]>): string {
  const prima = TICKET_QUESTIONARIO[0];
  if (!prima) return "";

  const valori = risposte[prima.slug] ?? [];
  return valori.map((v) => opzioneLabel(prima, v)).join(", ");
}

export function generaNoteDaRisposte(risposte: Record<string, string[]>): string {
  return TICKET_QUESTIONARIO.filter((d) => (risposte[d.slug] ?? []).length > 0)
    .map((d) => {
      const etichette = (risposte[d.slug] ?? []).map((v) => opzioneLabel(d, v));
      return `${d.domanda}\n${etichette.map((e) => `- ${e}`).join("\n")}`;
    })
    .join("\n\n");
}
