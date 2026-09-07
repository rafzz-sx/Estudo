"use client";

/**
 * Evolução semanal da taxa de acerto.
 *
 * É o gráfico que sustenta um ano de preparação. "Sua taxa saiu de 42% para
 * 61% em três meses" faz o aluno continuar num dia ruim; o placar de hoje,
 * sozinho, não faz — num dia ruim ele só machuca.
 *
 * SVG na mão, sem biblioteca: são doze pontos e uma linha. Carregar um pacote
 * de gráficos para isso pesaria mais que a página inteira.
 */

export interface PontoEvolucao {
  semana: string; // 'YYYY-MM-DD' (segunda-feira)
  respondidas: number;
  acertos: number;
  taxa: number;
}

const L = 40; // margem esquerda, para os rótulos do eixo
const R = 12;
const T = 14;
const B = 26;
const LARGURA = 600;

export function GraficoEvolucao({
  pontos,
  compacto = false,
}: {
  pontos: PontoEvolucao[];
  compacto?: boolean;
}) {
  if (pontos.length < 2) return null;

  const altura = compacto ? 170 : 240;
  const areaW = LARGURA - L - R;
  const areaH = altura - T - B;

  const x = (i: number) => L + (i / (pontos.length - 1)) * areaW;
  const y = (taxa: number) => T + areaH - (taxa / 100) * areaH;

  const linha = pontos.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.taxa)}`).join(" ");
  const area =
    `M ${x(0)} ${T + areaH} ` +
    pontos.map((p, i) => `L ${x(i)} ${y(p.taxa)}`).join(" ") +
    ` L ${x(pontos.length - 1)} ${T + areaH} Z`;

  const primeira = pontos[0];
  const ultima = pontos[pontos.length - 1];
  const delta = ultima.taxa - primeira.taxa;

  const totalRespondidas = pontos.reduce((a, p) => a + p.respondidas, 0);

  const rotuloSemana = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Com muitas semanas os rótulos se sobrepõem; mostramos um a cada dois.
  const passo = pontos.length > 8 ? 2 : 1;

  return (
    <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="heading text-lg text-bat-text">Sua evolução</h2>
        <span className="text-xs text-bat-text-muted">
          {totalRespondidas.toLocaleString("pt-BR")} questões em{" "}
          {pontos.length} semanas
        </span>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-bat-text-secondary">
        Taxa de acerto por semana.{" "}
        {delta > 0 ? (
          <>
            Você subiu de{" "}
            <strong className="text-bat-text">{primeira.taxa}%</strong> para{" "}
            <strong className="text-bat-success">{ultima.taxa}%</strong> — são{" "}
            <strong className="text-bat-success">+{delta} pontos</strong>.
          </>
        ) : delta < 0 ? (
          <>
            Caiu de <strong className="text-bat-text">{primeira.taxa}%</strong>{" "}
            para <strong className="text-bat-warning">{ultima.taxa}%</strong>.
            Vale olhar se você trocou de assunto ou subiu a dificuldade — cair
            depois de atacar o que é difícil é sinal de que está no lugar certo.
          </>
        ) : (
          <>
            Estável em <strong className="text-bat-text">{ultima.taxa}%</strong>.
          </>
        )}
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${LARGURA} ${altura}`}
          className="h-auto w-full min-w-[380px]"
          role="img"
          aria-label={`Taxa de acerto por semana, de ${primeira.taxa}% a ${ultima.taxa}%`}
        >
          <defs>
            <linearGradient id="grad-evolucao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5C518" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F5C518" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grade e eixo Y */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={L}
                y1={y(v)}
                x2={LARGURA - R}
                y2={y(v)}
                stroke="currentColor"
                className="text-bat-border"
                strokeWidth="1"
                strokeDasharray={v === 0 ? undefined : "3 4"}
              />
              <text
                x={L - 8}
                y={y(v) + 3.5}
                textAnchor="end"
                className="fill-bat-text-muted"
                fontSize="10"
              >
                {v}%
              </text>
            </g>
          ))}

          <path d={area} fill="url(#grad-evolucao)" />
          <path
            d={linha}
            fill="none"
            stroke="#F5C518"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {pontos.map((p, i) => (
            <g key={p.semana}>
              <circle
                cx={x(i)}
                cy={y(p.taxa)}
                r={i === pontos.length - 1 ? 5 : 3.5}
                fill={i === pontos.length - 1 ? "#F5C518" : "#0B0B0F"}
                stroke="#F5C518"
                strokeWidth="2"
              />
              <title>
                {`Semana de ${rotuloSemana(p.semana)}: ${p.acertos}/${p.respondidas} (${p.taxa}%)`}
              </title>
              {i % passo === 0 && (
                <text
                  x={x(i)}
                  y={altura - 8}
                  textAnchor="middle"
                  className="fill-bat-text-muted"
                  fontSize="9"
                >
                  {rotuloSemana(p.semana)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Uma semana com 3 questões e 100% não é evolução, é acaso. Dizer o
          volume ao lado da taxa impede a leitura errada. */}
      <p className="mt-2 text-center text-[10px] text-bat-text-muted">
        Passe o cursor sobre um ponto para ver quantas questões daquela semana.
      </p>
    </section>
  );
}
