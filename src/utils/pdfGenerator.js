import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadInvoicePDF(domId, fileName = 'document') {
  const element = document.getElementById(domId);
  if (!element) {
    console.error(`Element #${domId} not found`);
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    letterRendering: true,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  const MIN_REMAINING = 50;
  while (heightLeft > MIN_REMAINING) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(`${fileName}.pdf`);
}
