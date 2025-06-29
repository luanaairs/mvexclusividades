import { type Property } from "@/types";

function escapeCsvCell(cellData: string | number | undefined): string {
  const cellString = String(cellData ?? '');
  if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
    return `"${cellString.replace(/"/g, '""')}"`;
  }
  return cellString;
}

export function exportToCsv(properties: Property[]) {
  const headers = [
    "Corretor", "Imobiliária", "Empreendimento", "Número", "Tipo", "Categorias", "Status",
    "Quartos", "Banheiros", "Suítes", "Lavabos",
    "Área Privativa (m²)", "Área Total (m²)", "Preço", "Condições de Pagamento", 
    "Características Adicionais", "Tags", "Endereço", "Bairro", "Contato do Corretor",
    "Link de Fotos", "Link Material Extra"
  ];
  
  const rows = properties.map(p => [
    escapeCsvCell(p.brokerName),
    escapeCsvCell(p.agencyName),
    escapeCsvCell(p.propertyName),
    escapeCsvCell(p.houseNumber),
    escapeCsvCell(p.propertyType),
    escapeCsvCell(p.categories?.join(', ')),
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
    escapeCsvCell(p.address),
    escapeCsvCell(p.neighborhood),
    escapeCsvCell(p.brokerContact),
    escapeCsvCell(p.photoDriveLink),
    escapeCsvCell(p.extraMaterialLink),
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
            <th style="padding: 8px;">Corretor</th>
            <th style="padding: 8px;">Imobiliária</th>
            <th style="padding: 8px;">Empreendimento</th>
            <th style="padding: 8px;">Número</th>
            <th style="padding: 8px;">Tipo</th>
            <th style="padding: 8px;">Categorias</th>
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
            <th style="padding: 8px;">Endereço</th>
            <th style="padding: 8px;">Bairro</th>
            <th style="padding: 8px;">Contato do Corretor</th>
            <th style="padding: 8px;">Link de Fotos</th>
            <th style="padding: 8px;">Link Material Extra</th>
          </tr>
        </thead>
        <tbody>
          ${properties.map(p => `
            <tr>
              <td style="padding: 8px;">${p.brokerName || ''}</td>
              <td style="padding: 8px;">${p.agencyName || ''}</td>
              <td style="padding: 8px;">${p.propertyName || ''}</td>
              <td style="padding: 8px;">${p.houseNumber || ''}</td>
              <td style="padding: 8px;">${p.propertyType || ''}</td>
              <td style="padding: 8px;">${p.categories?.join(', ') || ''}</td>
              <td style="padding: 8px;">${p.status || ''}</td>
              <td style="padding: 8px;">${p.bedrooms}</td>
              <td style="padding: 8px;">${p.bathrooms}</td>
              <td style="padding: 8px;">${p.suites}</td>
              <td style="padding: 8px;">${p.lavabos}</td>
              <td style="padding: 8px;">${p.areaSize}</td>
              <td style="padding: 8px;">${p.totalAreaSize || ''}</td>
              <td style="padding: 8px;">${p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td style="padding: 8px;">${p.paymentTerms || ''}</td>
              <td style="padding: 8px;">${p.additionalFeatures || ''}</td>
              <td style="padding: 8px;">${p.tags.join(', ')}</td>
              <td style="padding: 8px;">${p.address || ''}</td>
              <td style="padding: 8px;">${p.neighborhood || ''}</td>
              <td style="padding: 8px;">${p.brokerContact || ''}</td>
              <td style="padding: 8px;">${p.photoDriveLink || ''}</td>
              <td style="padding: 8px;">${p.extraMaterialLink || ''}</td>
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


export function exportToJson(properties: Property[]) {
  const jsonString = JSON.stringify(properties, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "exclusividades_backup.json");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
