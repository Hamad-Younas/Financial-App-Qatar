
'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import TopHeader from '@/components/ui/topHeader'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface ReportData {
  payment_voucher_number: string
  voucher_date: string
  invoice_numbers: string[]
  descriptions: string[]
  usd_values: string[]
  pkr_values: string[]
  budget_item_number: string
  budget_item_name: string
  total_amount_pkr: number
  currency: string
  total_amount_usd: number
  exchange_rate: number
  budget_amount_usd: number
  remaining_budget_usd: number
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const urduMonth = [
  'جنوری',
  'فروری',
  'مارچ',
  'اپریل',
  'مئی',
  'جون',
  'جولائی',
  'اگست',
  'ستمبر',
  'اکتوبر',
  'نومبر',
  'دسمبر'
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export default function ReportPage () {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  )
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [isReportGenerated, setIsReportGenerated] = useState(false)
  const [rowsToShow, setRowsToShow] = useState(5)

  const fetchReportData = async () => {
    setIsLoading(true);
    setIsReportGenerated(false);
  
    try {
      const monthIndex = selectedMonth;
      const nextMonthIndex = (selectedMonth + 1) % 12;
      const currentYear = selectedYear;
      const nextMonthYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
  
      const startDate = new Date(currentYear, monthIndex, 27);
      const endDate = new Date(nextMonthYear, nextMonthIndex, 26);
  
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
  
      const query = `
        WITH LimitedRows AS (
            SELECT
                pvr.payment_voucher_id,
                pvr.invoice_no,
                pvr.description,
                pvr.usd,
                pvr.pkr,
                ROW_NUMBER() OVER (PARTITION BY pvr.payment_voucher_id ORDER BY pvr.id) AS row_num
            FROM payment_voucher_rows pvr
        )
        SELECT 
            pv.serial_no AS payment_voucher_number, 
            pv.date AS voucher_date, 
            GROUP_CONCAT(lr.invoice_no) AS invoice_numbers, 
            GROUP_CONCAT(lr.description) AS descriptions, 
            GROUP_CONCAT(lr.usd) AS usd_values,
            GROUP_CONCAT(lr.pkr) AS pkr_values,
            pv.budget_voto_no AS budget_item_number, 
            at.name AS budget_item_name, 
            SUM(lr.pkr) AS total_amount_pkr, 
            'USD' AS currency, 
            SUM(lr.usd) AS total_amount_usd, 
            pv.exchange_rate, 
            at.amount AS budget_amount_usd, 
            (at.amount - SUM(lr.usd)) AS remaining_budget_usd
        FROM payment_vouchers pv
        JOIN account_types at ON pv.budget_voto_no = at.id
        LEFT JOIN LimitedRows lr ON pv.id = lr.payment_voucher_id
        WHERE pv.status != 'Deleted'
          AND pv.date >= ?
          AND pv.date <= ?
          AND lr.row_num <= (SELECT rows FROM ReportRows WHERE id = 1)
        GROUP BY at.id, pv.id
        ORDER BY at.id, pv.date;
      `;
  
      const rowsToShowResponse = await window.electronAPI.dbQuery("SELECT rows FROM ReportRows WHERE id = 1");
    
      setRowsToShow(rowsToShowResponse?.data?.rows ?? 5);

      const response = await window.electronAPI.dbQuery(query, [
        formattedStartDate,
        formattedEndDate,
      ]);
      console.log("Response:", response);
      // Check if response contains the array
      const records = Array.isArray(response) ? response : response?.data;
  
      if (!Array.isArray(records)) {
        throw new Error("Unexpected response format.");
      }
  
      console.log("Report data:", records);
  
      setReportData(
        records.map((item) => ({
          payment_voucher_number: item.payment_voucher_number,
          voucher_date: item.voucher_date,
          invoice_numbers: item.invoice_numbers
            ? item.invoice_numbers.split(",")
            : [],
          descriptions: item.descriptions ? item.descriptions.split(",") : [],
          usd_values: item.usd_values ? item.usd_values.split(",") : [],
          pkr_values: item.pkr_values ? item.pkr_values.split(",") : [],
          budget_item_number: item.budget_item_number,
          budget_item_name: item.budget_item_name,
          total_amount_pkr: parseFloat(item.total_amount_pkr) || 0,
          currency: item.currency,
          total_amount_usd: parseFloat(item.total_amount_usd) || 0,
          exchange_rate: parseFloat(item.exchange_rate) || 0,
          budget_amount_usd: parseFloat(item.budget_amount_usd) || 0,
          remaining_budget_usd: parseFloat(item.remaining_budget_usd) || 0,
        }))
      );
  
      setIsReportGenerated(true);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to fetch report data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', [500, 400]);
    pdf.addFont('/fonts/Amiri/Amiri.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
  
    // Add logo
    pdf.addImage(
      '/report_logo.jpg',
      'JPEG',
      pdf.internal.pageSize.width / 2 - 12,
      10,
      24,
      24
    );
  
    // Add title with background color and border
    const pageWidth = pdf.internal.pageSize.width;
   
    pdf.setFontSize(18);

    pdf.setFillColor(216, 216, 216); // Light gray (#d8d8d8)
    pdf.rect(10, 40, pageWidth - 20, 15, 'F'); // Full-width background rectangle
    pdf.setDrawColor(0, 0, 0); // Black for border
    pdf.rect(10, 40, pageWidth - 20, 15, 'S'); // Border
    pdf.text('بسم الله الرحمن الرحيم', pageWidth / 2, 50, {
      align: 'center'
    });
    
    const gap = 5;

    // Title 2 - الملحقية العسكرية
    const yPosition2 = 55 + gap;
    pdf.setFillColor(216, 216, 216);
    pdf.rect(10, yPosition2, pageWidth - 20, 15, 'F'); // Full-width background rectangle
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(10, yPosition2, pageWidth - 20, 15, 'S'); // Border
    pdf.setFontSize(16);
    pdf.text('الملحقية العسكرية (إسلام أباد باکستان)', pageWidth / 2, yPosition2 + 10, {
      align: 'center'
    });
  
    
    // Title 3 - الموضوع
  const yPosition3 = yPosition2 + 15 + gap;
  pdf.setFillColor(216, 216, 216);
  pdf.rect(10, yPosition3, pageWidth - 20, 15, 'F'); // Full-width background rectangle
  pdf.setDrawColor(0, 0, 0);
  pdf.rect(10, yPosition3, pageWidth - 20, 15, 'S'); // Border
  pdf.setFontSize(14);
  pdf.text(
    `الموضوع: مصروفات الملحقية العسكرية القطرية - عن شهر )${urduMonth[selectedMonth]}( ${selectedYear}م`,
    pageWidth / 2,
    yPosition3 + 10,
    { align: 'center' }
  );
    
  
    // Group data by budget item
    const groupedData = reportData.reduce((acc, item) => {
      if (!acc[item.budget_item_name]) {
        acc[item.budget_item_name] = [];
      }
      acc[item.budget_item_name].push(item);
      return acc;
    }, {} as Record<string, ReportData[]>);
  
    // Prepare table data
    const tableData: any[] = [];
   
  
    Object.entries(groupedData).forEach(([budgetItemName, items]) => {
      const rowSpan = rowsToShow
      items.forEach((item, itemIndex) => {

       

        Array.from({ length: rowsToShow }).forEach((_, invoiceIndex) => {
          const row = [
            invoiceIndex === 0 && {
              content: item.remaining_budget_usd.toFixed(2),
              rowSpan: rowSpan,
              styles: { valign: 'middle' }
            },
            invoiceIndex === 0 && {
              content: item.budget_amount_usd.toFixed(2),
              rowSpan: rowSpan,
              styles: { valign: 'middle' }
            },
            {
              content: item.exchange_rate.toFixed(2),
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            {
              content: parseFloat(item?.usd_values[invoiceIndex] ?? 0)?.toFixed(2) || "",
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            {
              content: parseFloat(item?.pkr_values[invoiceIndex] ?? 0)?.toFixed(2) || "",
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            {
              content: 'PKR',
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            invoiceIndex === 0 && {
              content: item.budget_item_name,
              rowSpan: rowSpan,
              styles: { valign: 'middle' }
            },
            invoiceIndex === 0 && {
              content: item.budget_item_number,
              rowSpan: rowSpan,
              styles: { valign: 'middle' }
            },
            {
              content: item?.descriptions[invoiceIndex] || '',
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            {
              content: item?.invoice_numbers[invoiceIndex] || '',
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            {
              content: item.voucher_date,
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            {
              content: item.payment_voucher_number,
              rowSpan: 1,
              styles: { valign: 'middle' }
            },
            {
              content: invoiceIndex + 1,
              rowSpan: 1,
              styles: { valign: 'middle' }
            }
          ].filter(Boolean);
          tableData.push(row);
        });
  
        // Add subtotal row for each budget item
        if (itemIndex === items.length - 1) {
          const subtotalRow = [
            '',
            '',
            '',
            item.usd_values
              .reduce((sum, val) => sum + parseFloat(val), 0)
              .toFixed(2),
            item.pkr_values
              .reduce((sum, val) => sum + parseFloat(val), 0)
              .toFixed(2),
            '',
            { content: `الإجمالي لبند (${budgetItemName})`, colSpan: 7 }
          ];
          tableData.push(subtotalRow);
        }
      });
    });
  
    // Add table with background color for headers
    pdf.autoTable({
      head: [
        [
          'المتبقي من موازنة البند بعد الخصم',
          'موازنة البند بالدولار',
          'سعر الصرف',
          'المبلغ بالدولار الامريكي',
          'العملة',
          'المبلغ بالروبية',
          'اسم البند',
          'رقم البند',
          'بيان سند الصرف',
          'رقم الفاتورة',
          'تاريخ السند',
          'رقم سند الصرف',
          '#'
        ]
      ],
      body: tableData,
      startY:100,
      useCss: true,
      styles: {
        font: 'Amiri',
        halign: 'center',
        border: 1,
        borderColor: [0, 0, 0], 
        lineWidth: 0.5, 
      },
      headStyles: {
        fillColor: [216, 216, 216], // #d8d8d8
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.5, // Ensure consistent border thickness for headers
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 10,
        halign: 'center',
        border: 1, // Add borders to each cell in the body
        borderColor: [0, 0, 0],
        lineWidth: 0.5, // Ensure consistent border thickness
      },
      alternateRowStyles: {
        halign: 'center',
        fillColor: [255, 255, 255],
        border: 1, // Add borders to alternate rows
        borderColor: [0, 0, 0],
        lineWidth: 0.5,
      },
    });

  
    // Add footer
    const pageHeight = pdf.internal.pageSize.height;


    // show total amount usd Aljammali in arabic
    const totalAmountUsd = reportData.reduce((sum, item) => sum + item.total_amount_usd, 0);
    
    const totalAmountUsdArabicText = `المبلغ الإجمالي: ${totalAmountUsd.toFixed(2)} دولار أمريكي`;

    pdf.setFontSize(12);
    pdf.text(totalAmountUsdArabicText, 20, pageHeight - 40);
    



    pdf.setFontSize(12);
    pdf.text('المحاسب', 20, pageHeight - 20);
    pdf.text('المدقق', pageWidth / 2, pageHeight - 20, {
      align: 'center'
    });
    pdf.text(
      'الملحق العسكري',
      pageWidth - 20,
      pageHeight - 20,
      { align: 'right' }
    );
  
    // Save the PDF
    pdf.save(`report_${months[selectedMonth]}_${selectedYear}.pdf`);
  };
  
  return (
    <div className='container mx-auto p-4'>
      <TopHeader />
      <h1 className='text-2xl font-bold mb-4'>Payment Voucher Report</h1>

      <div className='flex flex-col sm:flex-row gap-4 mb-4'>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(parseInt(e.target.value))}
          className='w-full sm:w-1/3 p-2 border border-gray-300 rounded font-bold'
        >
          {urduMonth.map((month, i) => (
            <option key={month} value={i} className='font-bold'>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className='w-full sm:w-1/3 p-2 border border-gray-300 rounded'
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <Button
          onClick={fetchReportData}
          disabled={isLoading}
          className='bg-blue-500 text-white'
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {isReportGenerated && (
        <Button onClick={generatePDF} className='mt-4 bg-green-500 text-white'>
          Download Report
        </Button>
      )}
    </div>
  )
}