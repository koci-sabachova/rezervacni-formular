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
  h1: { fontSize: 22, fontWeight: 600, margin: "0 0 12px" },
  body1: { color: "#1c1917", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" },
  small: { color: "#78716c", fontSize: 13, margin: 0 },
  hr: { borderColor: "#e7e5e4", margin: "20px 0" },
};

export function InquiryCustomerEmail({
  data,
  locale = "en",
}: {
  data: InquiryPayload;
  locale?: string;
}) {
  const t = (path: string, vars?: Record<string, string | number>) =>
    emailMsg(locale, path, vars);

  const firstName = data.name.trim().split(" ")[0];
  const body1Strong = t("emailInquiryCustomer.body1Strong", { count: data.estimatedPartySize });
  const body1Template = t("emailInquiryCustomer.body1");
  const body1Parts = body1Template.split("{strong}");

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{t("emailInquiryCustomer.preview")}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>{t("emailInquiryCustomer.heading", { name: firstName })}</Heading>
          <Text style={styles.body1}>
            {body1Parts[0]}<strong>{body1Strong}</strong>{body1Parts[1] ?? ""}
          </Text>
          <Text style={styles.body1}>{t("emailInquiryCustomer.body2")}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.small}>{t("emailInquiryCustomer.footer")}</Text>
        </Container>
      </Body>
    </Html>
  );
}
