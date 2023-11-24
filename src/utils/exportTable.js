import { ExportToCsv } from 'export-to-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';

export const handleExportCsv = (headers, datas) => {
  try {
    const csvExporter = new ExportToCsv({
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useBom: true,
      useKeysAsHeaders: false,
      headers: headers,
    });
    csvExporter.generateCsv(datas);
    toast.success('Exported as CSV');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast.error('Error exporting CSV');
  }
};

export const handleExportExcel = async (headers, datas) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Define the header row
    const header = headers;

    // Add the header row to the worksheet
    worksheet.addRow(header);
    datas.map((data) => {
      worksheet.addRow(data);
    });

    // Generate a buffer for the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated.xlsx';
    a.click();
    toast.success('Exported as Excel');
  } catch (error) {
    console.error('Error exporting Excel:', error);
    toast.error('Error exporting Excel');
  }
};

export const handleExportPdf = (headers, datas) => {
  try {
    const doc = new jsPDF();

    // Define the content of the PDF using jsPDF-AutoTable
    doc.autoTable({
      head: [headers],
      body: datas,
    });

    // Save the PDF with a specific file name
    doc.save('table.pdf');
    toast.success('Exported as PDF');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error('Error exporting PDF');
  }
};
