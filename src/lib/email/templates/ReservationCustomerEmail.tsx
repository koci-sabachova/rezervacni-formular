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
  h1: { fontSize: 22, fontWeight: 600, margin: "0 0 12px" },
  body1: { color: "#1c1917", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" },
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
  cateringRow: { fontSize: 14, margin: "4px 0" },
  total: { fontSize: 16, fontWeight: 600, margin: "8px 0 0" },
};

export function ReservationCustomerEmail({
  data,
  pricedCatering,
}: {
  data: ReservationPayload;
  pricedCatering: PricedCatering;
}) {
  return (
    <Html lang="cs">
      <Head />
      <Preview>
        Děkujeme za rezervaci, ozveme se do 48 hodin · Cobra &amp; Informace
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Děkujeme za rezervaci, {firstName(data.name)}!</Heading>
          <Text style={styles.body1}>
            Vaši žádost máme. Ozveme se Vám do <strong>48 hodin</strong> s potvrzením
            (nebo s upřesňujícím dotazem) na e-mail{" "}
            <strong>{data.email}</strong>. Pokud byste chtěl/a něco upravit dříve, napište
            nám zpátky na tuto adresu nebo zavolejte.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.label}>Vaše shrnutí</Text>

          <Text style={styles.value}>
            <strong>{formatLongDate(data.date)}</strong> od {data.time}
            <br />
            {data.partySize} lidí · {VENUE_LABELS[data.venue]}
            <br />
            {data.eventType ? EVENT_TYPE_LABELS[data.eventType] : "—"}
            {data.eventType === "jine" && data.eventTypeOther
              ? ` (${data.eventTypeOther})`
              : ""}
          </Text>

          {pricedCatering.lines.length > 0 && (
            <>
              <Text style={styles.label}>Catering</Text>
              {pricedCatering.lines.map((line, i) => (
                <Text key={i} style={styles.cateringRow}>
                  • {line.label}
                </Text>
              ))}
              <Text style={styles.total}>
                Předběžně:{" "}
                {pricedCatering.total.toLocaleString("cs-CZ")} Kč
                {pricedCatering.hasEstimates && " (vč. odhadů u mís)"}
              </Text>
            </>
          )}

          {data.note && (
            <>
              <Text style={styles.label}>Vaše poznámka</Text>
              <Text style={{ ...styles.value, whiteSpace: "pre-wrap" }}>
                {data.note}
              </Text>
            </>
          )}

          <Hr style={styles.hr} />

          <Text style={styles.small}>
            Tento e-mail je automatická kopie. Odpovědět nám můžete přímo na něj —
            chodí nám rovnou do schránky.
          </Text>
          <Text style={styles.small}>
            Cobra &amp; Informace · Praha · rezervace@barcobra.cz
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function firstName(full: string): string {
  const trimmed = full.trim();
  const space = trimmed.indexOf(" ");
  return space > 0 ? trimmed.slice(0, space) : trimmed;
}
