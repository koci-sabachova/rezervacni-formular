import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
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
  h1: { fontSize: 22, fontWeight: 600, margin: "0 0 12px" },
  body1: { color: "#1c1917", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" },
  small: { color: "#78716c", fontSize: 13, margin: 0 },
  hr: { borderColor: "#e7e5e4", margin: "20px 0" },
  cateringRow: { fontSize: 14, margin: "4px 0", color: "#1c1917" },
  total: { fontSize: 16, fontWeight: 600, margin: "8px 0 16px" },
};

export function CateringOrderCustomerEmail({
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

  const firstName = data.name.trim().split(" ")[0];

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{t("emailCateringCustomer.preview")}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>{t("emailCateringCustomer.heading", { name: firstName })}</Heading>
          <Text style={styles.body1}>{t("emailCateringCustomer.body1")}</Text>

          <Hr style={styles.hr} />

          {pricedCatering.lines.map((line, i) => (
            <Text key={i} style={styles.cateringRow}>
              • {line.label} — {line.lineTotal.toLocaleString("en-US")} Kč
            </Text>
          ))}
          <Text style={styles.total}>
            {t("emailCateringCustomer.total", {
              amount: pricedCatering.total.toLocaleString("en-US"),
            })}
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.body1}>{t("emailCateringCustomer.body2")}</Text>
          <Text style={styles.small}>{t("emailCateringCustomer.footer")}</Text>
        </Container>
      </Body>
    </Html>
  );
}
