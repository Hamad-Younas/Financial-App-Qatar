'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import TopHeader from '@/components/ui/topHeader'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface ExpenseStatementData {
  voucher_serial: string
  voucher_date: string
  statement: string
  amount_usd: number
  amount_pkr: number
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

export default function ExpenseStatementPage () {
  const [reportData, setReportData] = useState<ExpenseStatementData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  )
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [isReportGenerated, setIsReportGenerated] = useState(false)

  const fetchReportData = async () => {
    setIsLoading(true)
    setIsReportGenerated(false)

    try {
      const monthIndex = selectedMonth + 1

      const query = `
      SELECT 
       serial_no AS voucher_serial,
       date AS voucher_date,
      
         statement,
          total_usd AS  amount_usd,
         total_pkr AS   amount_pkr
         FROM payment_vouchers
          WHERE status != 'Deleted'  AND strftime('%m', date) = ? 
          AND strftime('%Y', date) = ?
            ORDER BY serial_no ASC
    `

      const response = await window.electronAPI.dbQuery(query, [
        monthIndex.toString().padStart(2, '0'),
        selectedYear.toString()
      ])

      const records = Array.isArray(response) ? response : response?.data
      console.log(records)
      if (!Array.isArray(records)) {
        throw new Error('Unexpected response format.')
      }

      setReportData(records)
      setIsReportGenerated(true)
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to fetch report data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', [500, 400])
    pdf.addFont('/fonts/Amiri/Amiri.ttf', 'Amiri', 'normal')
    pdf.setFont('Amiri')

    // Add logo
    pdf.addImage(
      '/logo.png',
      'JPEG',
      pdf.internal.pageSize.width / 2 - 25, // Centered with larger width
      0,
      50, // Increased width
      50 // Increased height
    )

    const pageWidth = pdf.internal.pageSize.width

    // Title with background color and border
    pdf.setFontSize(18)
    pdf.setFillColor(216, 216, 216)
    pdf.rect(10, 40, pageWidth - 20, 15, 'F')
    pdf.setDrawColor(0, 0, 0)
    pdf.rect(10, 40, pageWidth - 20, 15, 'S')
    pdf.text('بسم الله الرحمن الرحيم', pageWidth / 2, 50, {
      align: 'center'
    })

    const gap = 5

    // Title 2 - Military Attaché
    const yPosition2 = 55 + gap
    pdf.setFillColor(216, 216, 216)
    pdf.rect(10, yPosition2, pageWidth - 20, 15, 'F')
    pdf.setDrawColor(0, 0, 0)
    pdf.rect(10, yPosition2, pageWidth - 20, 15, 'S')
    pdf.setFontSize(16)
    pdf.text(
      'الملحقية العسكرية دولــة قطــر / إسلام أباد باکستان',
      pageWidth / 2,
      yPosition2 + 10,
      {
        align: 'center'
      }
    )
    // Title 3 - Bank Statement
    const yPosition3 = yPosition2 + 15 + gap
    pdf.setFillColor(216, 216, 216)
    pdf.rect(10, yPosition3, pageWidth - 20, 15, 'F')
    pdf.setDrawColor(0, 0, 0)
    pdf.rect(10, yPosition3, pageWidth - 20, 15, 'S')
    pdf.setFontSize(14)
    pdf.text(
      `الكشف التفريغي المصروفات مكتب الملحقية العسكرية عن شهر )${urduMonth[selectedMonth]}( ${selectedYear}م `,
      pageWidth / 2,
      yPosition3 + 10,
      { align: 'center' }
    )
    const yPosition4 = yPosition3 + 15 + gap
    pdf.setFillColor(216, 216, 216)
    pdf.rect(10, yPosition4, pageWidth - 20, 15, 'F')
    pdf.setDrawColor(0, 0, 0)
    pdf.rect(10, yPosition4, pageWidth - 20, 15, 'S')
    pdf.setFontSize(14)
    pdf.text(
      `من مستند صرف رقم من ${reportData[0]?.voucher_serial} إلى مستند صرف رقم ${reportData[reportData.length - 1]?.voucher_serial} `,
      pageWidth / 2,
      yPosition4 + 10,
      { align: 'center' }
    )
    // Add table
    const tableData = [
      ...reportData.map(item => [
       "$   " + `${item.amount_usd?.toFixed(2)}` ,
       "RS   " + `${ item.amount_pkr?.toFixed(2)}` ,
        item.statement,
        item.voucher_date,
        item.voucher_serial
      ]),
      [
        reportData.reduce((acc, curr) => acc + curr.amount_usd, 0).toFixed(2),
        "",
       {
        content: 'الإجمالي',
        colSpan: 3,
        styles: { fontStyle: 'bold', halign: 'center' }
       },
        
           
       
      ]
    ]

    pdf.autoTable({
      head: [
        [
          'المبلغ / دولار',
          'المبلغ / روبية',
          'البيان',
          'تاريخ مستند الصرف',
          'رقم مستند الصرف'
        ]
      ],
      body: tableData,
      startY: 120,
      styles: {
        font: 'Amiri',
        halign: 'center',
        border: 1,
        borderColor: [0, 0, 0],
        lineWidth: 0.5,
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [216, 216, 216],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.5,
        valign: 'middle'
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 10,
        halign: 'center',
        border: 1,
        borderColor: [0, 0, 0],
        lineWidth: 0.5
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 50 }, // الرصيد
        1: { cellWidth: 50 }, // دائن
        2: { cellWidth: 'auto' }, // البيان
        3: { cellWidth:45 }, // تاريخ السند
        4: { cellWidth:40 } // رقم السند
      }
    })
    // Add footer
    const pageHeight = pdf.internal.pageSize.height

    pdf.setFontSize(12)
    pdf.text('المحاسب', 20, pageHeight - 20)
    pdf.text('المدقق', pageWidth / 2, pageHeight - 20, {
      align: 'center'
    })
    pdf.text('الملحق العسكري', pageWidth - 20, pageHeight - 20, {
      align: 'right'
    })

    // Save the PDF
    pdf.save(`expense_statement_${months[selectedMonth]}_${selectedYear}.pdf`)
  }

  return (
    <div className='container mx-auto p-4'>
      <TopHeader />
      <h1 className='text-2xl font-bold mb-4'>Bank Statement Report</h1>

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
          className='bg-blue-500 text-white whitespace-nowrap'
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {isReportGenerated && (
        <div className='mt-4'>
          <Button
            onClick={generatePDF}
            className='bg-green-500 text-white mb-4'
          >
            Download Report
          </Button>
        </div>
      )}
    </div>
  )
}
