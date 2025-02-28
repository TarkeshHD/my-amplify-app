import ExcelJS from 'exceljs';
import { ExportToCsv } from 'export-to-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import _ from 'lodash';
import moment from 'moment-timezone';

export const handleExportCsv = (source, datas) => {
  try {
    const csvExporter = new ExportToCsv({
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useBom: true,
      useKeysAsHeaders: false,
      headers: Object.keys(datas?.[0]).map((key) => _.startCase(key)),
      filename: `${source}-table-${moment().format('YYYY-MM-DD')}`,
    });
    csvExporter.generateCsv(datas);
    toast.success('Exported as CSV');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast.error('Error exporting CSV');
  }
};

export const handleExportExcel = async (source, datas) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Define the header row
    const header = Object.keys(datas?.[0]).map((key) => _.startCase(key));

    // Add the header row to the worksheet
    worksheet.addRow(header);
    datas.map((data) => {
      worksheet.addRow(Object.values(data));
    });

    // Generate a buffer for the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${source}-table-${moment().format('YYYY-MM-DD')}.xlsx`;
    a.click();
    toast.success('Exported as Excel');
  } catch (error) {
    console.error('Error exporting Excel:', error);
    toast.error('Error exporting Excel');
  }
};

export const handleExportPdf = (source, datas) => {
  try {
    const doc = new jsPDF();

    // Define the content of the PDF using jsPDF-AutoTable
    doc.autoTable({
      head: [Object.keys(datas?.[0]).map((key) => _.startCase(key))],
      body: datas.map((data) => Object.values(data)),
    });

    // Save the PDF with a specific file name
    doc.save(`${source}-table-${moment().format('YYYY-MM-DD')}.pdf`);
    toast.success('Exported as PDF');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error('Error exporting PDF');
  }
};
