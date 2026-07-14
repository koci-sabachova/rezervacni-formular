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
import type { ReservationPayload } from "@/lib/schemas/reservation";
import { formatLongDate } from "@/lib/utils/dates";
import { emailMsg } from "../messages";

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
  locale = "en",
}: {
  data: ReservationPayload;
  pricedCatering: PricedCatering;
  locale?: string;
}) {
  const t = (path: string, vars?: Record<string, string | number>) =>
    emailMsg(locale, path, vars);

  const venueLabel = t(`schemas.venues.${data.venue}`);
  const eventTypeLabel = data.eventType ? t(`schemas.eventTypes.${data.eventType}`) : "—";
  const longDate = formatLongDate(data.date, locale);

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{t("emailReservationOperator.preview", { date: longDate, count: data.partySize })}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>{t("emailReservationOperator.heading")}</Heading>
          <Text style={styles.small}>{t("emailReservationOperator.submittedVia")}</Text>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>{t("emailReservationOperator.contact")}</Text>
            <Text style={styles.value}>
              <strong>{data.name}</strong>
              <br />
              {data.phone} · {data.email}
            </Text>

            <Text style={styles.label}>{t("emailReservationOperator.dateTime")}</Text>
            <Text style={styles.value}>
              {longDate}
              <br />
              {t("emailReservationOperator.from", { time: data.time })}
            </Text>

            <Text style={styles.label}>{t("emailReservationOperator.guests")}</Text>
            <Text style={styles.value}>{String(data.partySize)}</Text>

            <Text style={styles.label}>{t("emailReservationOperator.venue")}</Text>
            <Text style={styles.value}>{venueLabel}</Text>

            <Text style={styles.label}>{t("emailReservationOperator.eventType")}</Text>
            <Text style={styles.value}>
              {eventTypeLabel}
              {data.eventType === "jine" && data.eventTypeOther
                ? ` — ${data.eventTypeOther}`
                : ""}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>{t("emailReservationOperator.catering")}</Text>
            {pricedCatering.lines.length === 0 ? (
              <Text style={styles.value}>{t("emailReservationOperator.noCatering")}</Text>
            ) : (
              <>
                {pricedCatering.lines.map((line, i) => (
                  <Text key={i} style={styles.cateringRow}>
                    • {line.label}{" "}
                    <span style={styles.cateringTotal}>
                      ({line.lineTotal.toLocaleString("en-US")} Kč
                      {line.isEstimate ? `, ${t("emailReservationOperator.estimate")}` : ""})
                    </span>
                  </Text>
                ))}
                <Text style={styles.total}>
                  {t("emailReservationOperator.total", {
                    amount: pricedCatering.total.toLocaleString("en-US"),
                  })}
                  {pricedCatering.hasEstimates && ` (${t("emailReservationOperator.inclEstimates")})`}
                </Text>
              </>
            )}
          </Section>

          {data.note && data.note.length > 0 && (
            <>
              <Hr style={styles.hr} />
              <Section>
                <Text style={styles.label}>{t("emailReservationOperator.note")}</Text>
                <Text style={{ ...styles.value, whiteSpace: "pre-wrap" }}>
                  {data.note}
                </Text>
              </Section>
            </>
          )}

          <Hr style={styles.hr} />
          <Text style={styles.small}>{t("emailReservationOperator.footer")}</Text>
        </Container>
      </Body>
    </Html>
  );
}
