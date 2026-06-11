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

export function InquiryCustomerEmail({ data }: { data: InquiryPayload }) {
  const first = data.name.trim().split(" ")[0];
  return (
    <Html lang="cs">
      <Head />
      <Preview>Děkujeme za poptávku — ozveme se vám zpátky</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Díky za poptávku, {first}!</Heading>
          <Text style={styles.body1}>
            Vaši představu na akci pro <strong>{data.estimatedPartySize} lidí</strong>{" "}
            jsme přijali. Větší společnosti řešíme individuálně, takže vám během několika
            dní zavoláme nebo napíšeme — domluvíme termín, podnik a co s cateringem.
          </Text>
          <Text style={styles.body1}>
            Pokud máte mezitím doplnění nebo otázku, odpovězte nám rovnou na tento e-mail.
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.small}>
            Cobra &amp; Informace · Praha · rezervace@barcobra.cz
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
