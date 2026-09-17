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
import type { CateringOrderPayload } from "@/lib/schemas/catering-order";
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

export function CateringOrderOperatorEmail({
  data,
  pricedCatering,
  locale = "en",
}: {
  data: CateringOrderPayload;
  pricedCatering: PricedCatering;
  locale?: string;
}) {
  const t = (path: string, vars?: Record<string, string | number>) =>
    emailMsg(locale, path, vars);

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {t("emailCateringOperator.preview", {
          amount: pricedCatering.total.toLocaleString("en-US"),
        })}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>{t("emailCateringOperator.heading")}</Heading>
          <Text style={styles.small}>{t("emailCateringOperator.submittedVia")}</Text>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>{t("emailCateringOperator.contact")}</Text>
            <Text style={styles.value}>
              <strong>{data.name}</strong>
              <br />
              {data.phone} · {data.email}
            </Text>

            <Text style={styles.label}>{t("emailCateringOperator.eventDate")}</Text>
            <Text style={styles.value}>{data.eventDate || "—"}</Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>{t("emailCateringOperator.order")}</Text>
            {pricedCatering.lines.map((line, i) => (
              <Text key={i} style={styles.cateringRow}>
                • {line.label}{" "}
                <span style={styles.cateringTotal}>
                  ({line.lineTotal.toLocaleString("en-US")} Kč
                  {line.isEstimate ? `, ${t("emailCateringOperator.estimate")}` : ""})
                </span>
              </Text>
            ))}
            <Text style={styles.total}>
              {t("emailCateringOperator.total", {
                amount: pricedCatering.total.toLocaleString("en-US"),
              })}
              {pricedCatering.hasEstimates && ` (${t("emailCateringOperator.inclEstimates")})`}
            </Text>
          </Section>

          {data.note && data.note.length > 0 && (
            <>
              <Hr style={styles.hr} />
              <Section>
                <Text style={styles.label}>{t("emailCateringOperator.note")}</Text>
                <Text style={{ ...styles.value, whiteSpace: "pre-wrap" }}>{data.note}</Text>
              </Section>
            </>
          )}

          <Hr style={styles.hr} />
          <Text style={styles.small}>{t("emailCateringOperator.footer")}</Text>
        </Container>
      </Body>
    </Html>
  );
}
