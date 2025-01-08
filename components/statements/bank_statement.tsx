'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import TopHeader from '@/components/ui/topHeader'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface BankStatementData {
  voucher_serial: string
  voucher_date: string
  cheque_number: string
  check_serial: string
  check_date: string
  statement: string
  debit: number
  amount_usd: number
  amount_pkr: number
  balance: number
  currency: string
  exchange_rate: number
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

export default function BankStatementPage () {
  const [reportData, setReportData] = useState<BankStatementData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [banks, setBanks] = useState<
    { bank_name: string; account_no: string }[]
  >([])
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  )
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [isReportGenerated, setIsReportGenerated] = useState(false)
  const fetchBanks = async () => {
    try {
      const query = 'SELECT DISTINCT bank_name , account_no FROM banks'
      const response = await window.electronAPI.dbQuery(query)
      const bankList = Array.isArray(response) ? response : response?.data
      setBanks(bankList)
    } catch (error) {
      console.error('Error fetching banks data:', error)
      toast.error('Failed to fetch banks data. Please try again.')
    }
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchReportData = async () => {
    setIsLoading(true)
    setIsReportGenerated(false)
    if (!selectedBank) {
      toast.error('Please select a bank.')
      setIsLoading(false)
      return
    }

    try {
      const monthIndex = selectedMonth
      const nextMonthIndex = (selectedMonth + 1) % 12
      const currentYear = selectedYear
      const nextMonthYear =
        selectedMonth === 11 ? selectedYear + 1 : selectedYear

      const startDate = new Date(currentYear, monthIndex, 27)
      const endDate = new Date(nextMonthYear, nextMonthIndex, 26)

      const formattedStartDate = startDate.toISOString().split('T')[0]
      const formattedEndDate = endDate.toISOString().split('T')[0]

      const query = `
      SELECT 
        rs.serial_number AS check_serial,
        rs.date AS check_date,
        rs.currency,
        pv.exchange_rate,
        pv.cheque_no AS cheque_number,
        rs.amount_usd,
        rs.amount_pkr,
        pv.total_usd AS debit,
        b.account_no,
        b.bank_name,
        pv.statement,
        pv.serial_no AS voucher_serial,
        pv.date AS voucher_date,
        pv.current_balance AS balance
      FROM receipts rs 
      JOIN payment_vouchers pv ON rs.against = pv.bank_account 
      JOIN banks b ON b.bank_name = pv.bank_account
      WHERE pv.date >= ? AND pv.date <= ? AND b.bank_name = ?
      ORDER BY pv.date ASC
    `

      const response = await window.electronAPI.dbQuery(query, [
        formattedStartDate,
        formattedEndDate,
        selectedBank
      ])

      const records = Array.isArray(response) ? response : response?.data

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
      `كشف حركة البنك لحساب رقم ${
        banks.find(item => item.bank_name == selectedBank)?.account_no
      }  بالدولار- شهر )${urduMonth[selectedMonth]}( ${selectedYear}م `,
      pageWidth / 2,
      yPosition3 + 10,
      { align: 'center' }
    )

    // Title 4 - Bank Name and start date and end date
    const yPosition4 = yPosition3 + 20 + gap
    pdf.setFontSize(12)
    pdf.text(
      `رصيد حساب البنك بتاريخ : 26/${selectedMonth}/${selectedYear} `,
      10,
      yPosition4
    )
    pdf.text(`البنك: ${selectedBank}`, pageWidth / 2, yPosition4, {
      align: 'center'
    })
    pdf.text(
      `الرصيد التدفتري لحساب الروبية بتاريخ : 25/${
        selectedMonth + 1
      }/${selectedYear} `,
      pageWidth - 90,
      yPosition4
    )

    // Add table
    const tableData =[...reportData.map(item => [
      item.balance.toFixed(2),
      item.currency === 'USD'
        ? item.amount_usd.toFixed(2)
        : item.amount_pkr * item.exchange_rate, // دائن
      item.debit?.toFixed(2) ?? 0, // مدين
      item.statement,
      item.check_date,
      item.cheque_number,
      item.voucher_date,
      item.voucher_serial
    ]),
    [
        reportData.reduce((acc, item) => acc + item.balance, 0).toFixed(2),
        , '', '', '', '', '', ''],
]
   
    

    pdf.autoTable({
      head: [
        [
          { content: 'الرصيد', rowSpan: 2 },
          { content: 'الحركة', colSpan: 2 },
          { content: 'البيان', rowSpan: 2 },
          { content: 'شيك', colSpan: 2 },
          { content: 'مستند الصرف', colSpan: 2 }
        ],
        ['دائن', 'مدين', 'تاريخ', 'رقم', 'تاريخ', 'رقم']
      ],
      body: tableData,
      startY: 115,
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
        0: { cellWidth: 30 }, // الرصيد
        1: { cellWidth: 30 }, // دائن
        2: { cellWidth: 30 }, // مدين
        3: { cellWidth: 'auto' }, // البيان
        4: { cellWidth: 25 }, // تاريخ الشيك
        5: { cellWidth: 25 }, // رقم الشيك
        6: { cellWidth: 25 }, // تاريخ السند
        7: { cellWidth: 25 } // رقم السند
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
    pdf.save(`bank_statement_${months[selectedMonth]}_${selectedYear}.pdf`)
  }

  return (
    <div className='container mx-auto p-4'>
      <TopHeader />
      <h1 className='text-2xl font-bold mb-4'>Bank Statement Report</h1>

      <div className='flex flex-col sm:flex-row gap-4 mb-4'>
        <select
          value={selectedBank}
          onChange={e => setSelectedBank(e.target.value)}
          className='w-full sm:w-1/3 p-2 border border-gray-300 rounded font-bold'
        >
          <option value=''>Select Bank</option>
          {banks.map(bank => (
            <option key={bank.bank_name} value={bank.bank_name}>
              {bank.bank_name}
            </option>
          ))}
        </select>
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
