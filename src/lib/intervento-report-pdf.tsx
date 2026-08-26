import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatDateIT } from "@/lib/format";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111111" },
  header: { marginBottom: 24 },
  headerLine: { marginBottom: 2 },
  section: { marginBottom: 14 },
  label: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  value: { lineHeight: 1.4 },
});

export interface InterventoReportData {
  dataGenerazione: Date;
  clienteNome: string | null;
  luogo: string | null;
  oggetto: string;
  verifiche: string;
  operatore: string;
}

function InterventoReportDocument({ data }: { data: InterventoReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerLine}>P.A.F. di Fagherazzi Marco</Text>
          <Text style={styles.headerLine}>P.iva 04570900276</Text>
          <Text style={styles.headerLine}>Cell. 345 162 8889</Text>
          <Text style={styles.headerLine}>E-mail info@cercaperdite.net</Text>
          <Text style={styles.headerLine}>Web site www.cercaperdite.net</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data:</Text>
          <Text style={styles.value}>{formatDateIT(data.dataGenerazione)}</Text>
        </View>

        {data.clienteNome && (
          <View style={styles.section}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{data.clienteNome}</Text>
          </View>
        )}

        {data.luogo && (
          <View style={styles.section}>
            <Text style={styles.label}>Luogo:</Text>
            <Text style={styles.value}>{data.luogo}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Oggetto:</Text>
          <Text style={styles.value}>{data.oggetto}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Verifiche eseguite:</Text>
          <Text style={styles.value}>{data.verifiche}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.value}>Intervento eseguito da {data.operatore}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderInterventoReportPdf(data: InterventoReportData): Promise<Buffer> {
  return renderToBuffer(<InterventoReportDocument data={data} />);
}
