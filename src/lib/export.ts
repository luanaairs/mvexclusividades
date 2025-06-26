import { type Property } from "@/types";

function escapeCsvCell(cellData: string): string {
  if (!cellData) return '""';
  if (cellData.includes(',')) {
    return `"${cellData.replace(/"/g, '""')}"`;
  }
  return cellData;
}

export function exportToCsv(properties: Property[]) {
  const headers = [
    "Corretor/Empresa", "Empreendimento", "Número", "Tipo", "Categoria", "Status",
    "Quartos", "Banheiros", "Suítes", "Lavabos",
    "Área Privativa (m²)", "Área Total (m²)", "Preço", "Condições de Pagamento", 
    "Características Adicionais", "Tags"
  ];
  
  const rows = properties.map(p => [
    escapeCsvCell(p.agentName),
    escapeCsvCell(p.propertyName),
    escapeCsvCell(p.houseNumber),
    escapeCsvCell(p.propertyType),
    escapeCsvCell(p.category || ''),
    escapeCsvCell(p.status),
    p.bedrooms.toString(),
    p.bathrooms.toString(),
    p.suites.toString(),
    p.lavabos.toString(),
    p.areaSize.toString(),
    p.totalAreaSize?.toString() || '',
    p.price.toString(),
    escapeCsvCell(p.paymentTerms),
    escapeCsvCell(p.additionalFeatures),
    escapeCsvCell(p.tags.join(', ')),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "tabela_exclusividades.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToWord(properties: Property[]) {
  const tableHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Tabela de Exclusividades</title></head>
    <body>
      <h1>Tabela de Exclusividades</h1>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px;">Corretor/Empresa</th>
            <th style="padding: 8px;">Empreendimento</th>
            <th style="padding: 8px;">Número</th>
            <th style="padding: 8px;">Tipo</th>
            <th style="padding: 8px;">Categoria</th>
            <th style="padding: 8px;">Status</th>
            <th style="padding: 8px;">Quartos</th>
            <th style="padding: 8px;">Banheiros</th>
            <th style="padding: 8px;">Suítes</th>
            <th style="padding: 8px;">Lavabos</th>
            <th style="padding: 8px;">Área Privativa (m²)</th>
            <th style="padding: 8px;">Área Total (m²)</th>
            <th style="padding: 8px;">Preço</th>
            <th style="padding: 8px;">Condições de Pagamento</th>
            <th style="padding: 8px;">Características Adicionais</th>
            <th style="padding: 8px;">Tags</th>
          </tr>
        </thead>
        <tbody>
          ${properties.map(p => `
            <tr>
              <td style="padding: 8px;">${p.agentName}</td>
              <td style="padding: 8px;">${p.propertyName}</td>
              <td style="padding: 8px;">${p.houseNumber}</td>
              <td style="padding: 8px;">${p.propertyType}</td>
              <td style="padding: 8px;">${p.category || ''}</td>
              <td style="padding: 8px;">${p.status}</td>
              <td style="padding: 8px;">${p.bedrooms}</td>
              <td style="padding: 8px;">${p.bathrooms}</td>
              <td style="padding: 8px;">${p.suites}</td>
              <td style="padding: 8px;">${p.lavabos}</td>
              <td style="padding: 8px;">${p.areaSize}</td>
              <td style="padding: 8px;">${p.totalAreaSize || ''}</td>
              <td style="padding: 8px;">${p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td style="padding: 8px;">${p.paymentTerms}</td>
              <td style="padding: 8px;">${p.additionalFeatures}</td>
              <td style="padding: 8px;">${p.tags.join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', tableHtml], {
    type: 'application/msword'
  });
  
  const link = document.createElement("a");
  const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(tableHtml);
  link.href = url;
  link.download = `tabela_exclusividades.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
