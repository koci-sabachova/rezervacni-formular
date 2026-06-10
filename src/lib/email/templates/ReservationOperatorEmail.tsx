import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { PricedCatering } from "@/lib/schemas/catering";
import {
  EVENT_TYPE_LABELS,
  VENUE_LABELS,
  type ReservationPayload,
} from "@/lib/schemas/reservation";
import { formatLongDate } from "@/lib/utils/dates";

const styles = {
  body: { backgroundColor: "#faf8f5", fontFamily: "Inter, Arial, sans-serif" },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: 12,
    margin: "24px auto",
    maxWidth: 600,
    padding: 32,
  },
  h1: { fontSize: 22, fontWeight: 600, margin: "0 0 8px" },
  small: { color: "#78716c", fontSize: 13, margin: 0 },
  label: {
    color: "#78716c",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    margin: "0 0 4px",
  },
  value: { color: "#1c1917", fontSize: 15, margin: "0 0 16px" },
  hr: { borderColor: "#e7e5e4", margin: "20px 0" },
  total: { fontSize: 18, fontWeight: 600, margin: "8px 0 0" },
  cateringRow: { fontSize: 14, margin: "4px 0" },
  cateringTotal: { color: "#78716c", fontSize: 13 },
};

export function ReservationOperatorEmail({
  data,
  pricedCatering,
}: {
  data: ReservationPayload;
  pricedCatering: PricedCatering;
}) {
  const eventTypeLabel = data.eventType ? EVENT_TYPE_LABELS[data.eventType] : "—";

  return (
    <Html lang="cs">
      <Head />
      <Preview>
        {`Nová rezervace · ${formatLongDate(data.date)} · ${data.partySize} lidí`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Nová rezervace</Heading>
          <Text style={styles.small}>
            Cobra &amp; Informace · vyplněno přes web
          </Text>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>Kontakt</Text>
            <Text style={styles.value}>
              <strong>{data.name}</strong>
              <br />
              {data.phone} · {data.email}
            </Text>

            <Text style={styles.label}>Datum &amp; čas</Text>
            <Text style={styles.value}>
              {formatLongDate(data.date)}
              <br />
              od {data.time}
            </Text>

            <Text style={styles.label}>Počet lidí</Text>
            <Text style={styles.value}>{String(data.partySize)}</Text>

            <Text style={styles.label}>Podnik</Text>
            <Text style={styles.value}>{VENUE_LABELS[data.venue]}</Text>

            <Text style={styles.label}>Typ akce</Text>
            <Text style={styles.value}>
              {eventTypeLabel}
              {data.eventType === "jine" && data.eventTypeOther
                ? ` — ${data.eventTypeOther}`
                : ""}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>Catering</Text>
            {pricedCatering.lines.length === 0 ? (
              <Text style={styles.value}>Bez cateringu</Text>
            ) : (
              <>
                {pricedCatering.lines.map((line, i) => (
                  <Text key={i} style={styles.cateringRow}>
                    • {line.label}{" "}
                    <span style={styles.cateringTotal}>
                      ({line.lineTotal.toLocaleString("cs-CZ")} Kč
                      {line.isEstimate ? ", odhad" : ""})
                    </span>
                  </Text>
                ))}
                <Text style={styles.total}>
                  Celkem:{" "}
                  {pricedCatering.total.toLocaleString("cs-CZ")} Kč
                  {pricedCatering.hasEstimates && " (vč. odhadů)"}
                </Text>
              </>
            )}
          </Section>

          {data.note && data.note.length > 0 && (
            <>
              <Hr style={styles.hr} />
              <Section>
                <Text style={styles.label}>Poznámka od hosta</Text>
                <Text style={{ ...styles.value, whiteSpace: "pre-wrap" }}>
                  {data.note}
                </Text>
              </Section>
            </>
          )}

          <Hr style={styles.hr} />
          <Text style={styles.small}>
            Host očekává odpověď do 48 hodin (text auto-replyu mu to slibuje).
            Odpovídej z této schránky nebo přepošli na vlastní e-mail.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
