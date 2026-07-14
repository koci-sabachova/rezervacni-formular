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
  const firstName = firstNameOf(data.name);

  const bodyTemplate = t("emailReservationCustomer.body", { email: data.email });
  const bodyStrong = t("emailReservationCustomer.bodyStrong");
  const bodyParts = bodyTemplate.split("{strong}");

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{t("emailReservationCustomer.preview")}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>{t("emailReservationCustomer.heading", { name: firstName })}</Heading>
          <Text style={styles.body1}>
            {bodyParts[0]}<strong>{bodyStrong}</strong>{bodyParts[1] ?? ""}
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.label}>{t("emailReservationCustomer.summaryLabel")}</Text>

          <Text style={styles.value}>
            <strong>{longDate}</strong> {t("emailReservationOperator.from", { time: data.time })}
            <br />
            {data.partySize} guests · {venueLabel}
            <br />
            {eventTypeLabel}
            {data.eventType === "jine" && data.eventTypeOther
              ? ` (${data.eventTypeOther})`
              : ""}
          </Text>

          {pricedCatering.lines.length > 0 && (
            <>
              <Text style={styles.label}>{t("emailReservationCustomer.cateringLabel")}</Text>
              {pricedCatering.lines.map((line, i) => (
                <Text key={i} style={styles.cateringRow}>
                  • {line.label}
                </Text>
              ))}
              <Text style={styles.total}>
                {t("emailReservationCustomer.preliminary", {
                  amount: pricedCatering.total.toLocaleString("en-US"),
                })}
                {pricedCatering.hasEstimates
                  ? ` (${t("emailReservationCustomer.inclEstimates")})`
                  : ""}
              </Text>
            </>
          )}

          {data.note && (
            <Section>
              <Text style={styles.label}>{t("emailReservationCustomer.noteLabel")}</Text>
              <Text style={{ ...styles.value, whiteSpace: "pre-wrap" }}>{data.note}</Text>
            </Section>
          )}

          <Hr style={styles.hr} />

          <Text style={styles.small}>{t("emailReservationCustomer.footerCopy")}</Text>
          <Text style={styles.small}>{t("emailReservationCustomer.footerContact")}</Text>
        </Container>
      </Body>
    </Html>
  );
}

function firstNameOf(full: string): string {
  const trimmed = full.trim();
  const space = trimmed.indexOf(" ");
  return space > 0 ? trimmed.slice(0, space) : trimmed;
}
