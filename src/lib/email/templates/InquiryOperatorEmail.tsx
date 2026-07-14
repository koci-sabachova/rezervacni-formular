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
import type { InquiryPayload } from "@/lib/schemas/inquiry";
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
};

export function InquiryOperatorEmail({
  data,
  locale = "en",
}: {
  data: InquiryPayload;
  locale?: string;
}) {
  const t = (path: string, vars?: Record<string, string | number>) =>
    emailMsg(locale, path, vars);

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{t("emailInquiryOperator.preview", { count: data.estimatedPartySize })}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>{t("emailInquiryOperator.heading")}</Heading>
          <Text style={styles.small}>{t("emailInquiryOperator.submittedVia")}</Text>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.label}>{t("emailInquiryOperator.contact")}</Text>
            <Text style={styles.value}>
              <strong>{data.name}</strong>
              <br />
              {data.phone} · {data.email}
            </Text>

            <Text style={styles.label}>{t("emailInquiryOperator.estimatedGuests")}</Text>
            <Text style={styles.value}>{String(data.estimatedPartySize)}</Text>

            <Text style={styles.label}>{t("emailInquiryOperator.estimatedDate")}</Text>
            <Text style={styles.value}>{data.estimatedDate || "—"}</Text>

            <Text style={styles.label}>{t("emailInquiryOperator.eventType")}</Text>
            <Text style={styles.value}>{data.eventType}</Text>

            <Text style={styles.label}>{t("emailInquiryOperator.vision")}</Text>
            <Text style={{ ...styles.value, whiteSpace: "pre-wrap" }}>{data.description}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
