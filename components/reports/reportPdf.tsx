// // components/ReportPDF.tsx
// import React from 'react'
// import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
// import { ReportData } from './report'

// // Register Taybah font
// Font.register({
//   family: 'Taybah',
//   src: '/fonts/Taybah.ttf' // You need to provide an Taybah font file
// })

// const styles = StyleSheet.create({
//   page: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     padding: 30
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     flexGrow: 1
//   },
//   title: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginBottom: 20,
//     fontFamily: 'Taybah'
//   },
//   table: {
//     display: 'table',
//     width: 'auto',
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderRightWidth: 0,
//     borderBottomWidth: 0
//   },
//   tableRow: {
//     margin: 'auto',
//     flexDirection: 'row'
//   },
//   tableCol: {
//     width: '9%',
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderLeftWidth: 0,
//     borderTopWidth: 0
//   },
//   tableCell: {
//     margin: 'auto',
//     marginTop: 5,
//     fontSize: 8,
//     padding: 5,
//     textAlign: 'right',
//     fontFamily: 'Taybah'
//   },
//   groupHeader: {
//     backgroundColor: '#f0f0f0',
//     fontWeight: 'bold'
//   },
//   groupFooter: {
//     backgroundColor: '#e0e0e0',
//     fontWeight: 'bold'
//   },
//   headerCell: {
//     fontWeight: 'bold'
//   }
// })

// const ReportPDF = ({ data }: { data: ReportData[] }) => {
//   // Group data by account type
//   const groupedData = data.reduce((acc, item) => {
//     if (!acc[item.account_type_name]) {
//       acc[item.account_type_name] = []
//     }
//     acc[item.account_type_name].push(item)
//     return acc
//   }, {} as Record<string, ReportData[]>)
//   return (
//     <Document>
//       <Page size='A4' style={styles.page} orientation='landscape'>
//         <View style={styles.section}>
//           <Text style={styles.title}>بسم الله الرحمن الرحيم</Text>
//           <Text style={styles.title}>
//             الملحقية العسكرية (إسلام اباد باكستان)
//           </Text>
//           <Text style={styles.title}>
//             الموضوع : مصروفات الملحقية العسكرية القطرية - عن شهر (اكتوبر) 2024م
//           </Text>

//           <View style={styles.table}>
//             <View style={[styles.tableRow, styles.headerCell]}>
//               <View style={[styles.tableCol, { width: '5%' }]}>
//                 <Text style={styles.tableCell}>رقم سند الصرف</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '8%' }]}>
//                 <Text style={styles.tableCell}>تاريخ السند</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '8%' }]}>
//                 <Text style={styles.tableCell}>رقم الفاتورة</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '15%' }]}>
//                 <Text style={styles.tableCell}>بيان سند الصرف</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '8%' }]}>
//                 <Text style={styles.tableCell}>رقم البند</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '15%' }]}>
//                 <Text style={styles.tableCell}>اسم البند</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>المبلغ بالروبية</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>العملة</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>المبلغ بالدولار الامريكي</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>سعر الصرف</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>موازنة البند بالدولار</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>
//                   المتبقي من موازنة البند بعد الخصم
//                 </Text>
//               </View>
//             </View>

//             {Object.entries(groupedData).map(([accountType, items]) => {
//               const totalPKR = items.reduce(
//                 (sum, item) => sum + item.total_pkr,
//                 0
//               )
//               const totalUSD = items.reduce(
//                 (sum, item) => sum + item.total_usd,
//                 0
//               )
//               const budgetUSD = items[0].budget_usd
//               const remainingBudget = budgetUSD - totalUSD

//               return (
//                 <React.Fragment key={accountType}>
//                   <View style={[styles.tableRow, styles.groupHeader]}>
//                     <View style={[styles.tableCol, { width: '44%' }]}>
//                       <Text style={styles.tableCell}>{accountType}</Text>
//                     </View>
//                     <View style={[styles.tableCol, { width: '56%' }]}>
//                       <Text style={styles.tableCell}></Text>
//                     </View>
//                   </View>
//                   {items.map((item, index) => (
//                     <View key={index} style={styles.tableRow}>
//                       <View style={styles.tableRow} key={index}>
//                         <View style={[styles.tableCol, { width: '5%' }]}>
//                           <Text style={styles.tableCell}>{item.serial_no}</Text>
//                         </View>
//                         <View style={[styles.tableCol, { width: '8%' }]}>
//                           <Text style={styles.tableCell}>{item.date}</Text>
//                         </View>
//                         <View style={[styles.tableCol, { width: '8%' }]}>
//                           <Text style={styles.tableCell}>
//                             {item.invoice_no}
//                           </Text>
//                         </View>
//                         <View style={[styles.tableCol, { width: '15%' }]}>
//                           <Text style={styles.tableCell}>
//                             {item.statement}
//                           </Text>
//                         </View>
//                         <View style={[styles.tableCol, { width: '8%' }]}>
//                           <Text style={styles.tableCell}>
//                             {item.budget_voto_no}
//                           </Text>
//                         </View>
//                         <View style={[styles.tableCol, { width: '15%' }]}>
//                           <Text style={styles.tableCell}>
//                             {item.account_type_name}
//                           </Text>
//                         </View>
//                         <View style={styles.tableCol}>
//                           <Text style={styles.tableCell}>
//                             {item.total_pkr}
//                           </Text>
//                         </View>
//                         <View style={styles.tableCol}>
//                           <Text style={styles.tableCell}>PKR</Text>
//                         </View>
//                         <View style={styles.tableCol}>
//                           <Text style={styles.tableCell}>
//                             {item.total_usd}
//                           </Text>
//                         </View>
//                         <View style={styles.tableCol}>
//                           <Text style={styles.tableCell}>
//                             {item.exchange_rate}
//                           </Text>
//                         </View>
//                         <View style={styles.tableCol}>
//                           <Text style={styles.tableCell}>
//                             {budgetUSD}
//                           </Text>
//                         </View>
//                         <View style={styles.tableCol}>
//                           <Text style={styles.tableCell}>
//                             {remainingBudget}
//                           </Text>
//                         </View>
//                       </View>
//                       <View style={styles.attachments}>
//                         <Text style={styles.attachmentTitle}>Attachments:</Text>
//                         {item.attachments.map((attachment, i) => (
//                           <Text key={i} style={styles.attachment}>
//                             {`http://localhost:3000${attachment}`}
//                           </Text>
//                         ))}
//                       </View>
//                     </View>
//                   ))}
//                   <View style={[styles.tableRow, styles.groupFooter]}>
//                     <View style={[styles.tableCol, { width: '59%' }]}>
//                       <Text style={styles.tableCell}>
//                         الإجمالي لبند ({accountType})
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {totalPKR}
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}></Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {totalUSD}
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}></Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {budgetUSD}
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {remainingBudget}
//                       </Text>
//                     </View>
//                   </View>
//                 </React.Fragment>
//               )
//             })}

//             <View style={[styles.tableRow, styles.groupFooter]}>
//               <View style={[styles.tableCol, { width: '59%' }]}>
//                 <Text style={styles.tableCell}>الاجمالي</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>
//                   {data
//                     .reduce((sum, item) => sum + item.total_pkr, 0)
//                     }
//                 </Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>
//                   {data
//                     .reduce((sum, item) => sum + item.total_usd, 0)
//                     }
//                 </Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//             </View>
//           </View>

//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               marginTop: 20
//             }}
//           >
//             <Text style={styles.tableCell}>المحاسب</Text>
//             <Text style={styles.tableCell}>المدقق</Text>
//             <Text style={styles.tableCell}>الملحق العسكري</Text>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   )
// }
// export default ReportPDF
import React from 'react'

import { ReportData } from './report'
import Image from 'next/image';

// Register Taybah font
// Font.register({
//   family: 'Taybah',
//   src: '/fonts/Taybah.ttf' // You need to provide an Taybah font file
// })

// const styles = StyleSheet.create({
//   page: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     padding: 30
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     flexGrow: 1
//   },
//   title: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginBottom: 20,
//     fontFamily: 'Taybah',
    
//   },
//   table: {
//     display: 'table',
//     width: 'auto',
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderRightWidth: 0,
//     borderBottomWidth: 0
//   },
//   tableRow: {
//     margin: 'auto',
//     flexDirection: 'row'
//   },
//   tableCol: {
//     width: '9%',
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderLeftWidth: 0,
//     borderTopWidth: 0
//   },
//   tableCell: {
//     margin: 'auto',
//     marginTop: 5,
//     fontSize: 8,
//     padding: 5,
//     textAlign: 'right',
//     fontFamily: 'Taybah'
//   },
//   groupHeader: {
//     backgroundColor: '#f0f0f0',
//     fontWeight: 'bold'
//   },
//   groupFooter: {
//     backgroundColor: '#e0e0e0',
//     fontWeight: 'bold'
//   },
//   headerCell: {
//     fontWeight: 'bold'
//   }
// })

// const ReportPDF = ({
//   data,
//   month,
//   year
// }: {
//   data: ReportData[]
//   month: string
//   year: number
// }) => {
//   // Group data by account type
//   console.log('Data:', data)

//   const groupedData = data.reduce((acc, item) => {
//     if (!acc[item.account_type_name]) {
//       acc[item.account_type_name] = []
//     }
//     acc[item.account_type_name].push(item)
//     return acc
//   }, {} as Record<string, ReportData[]>)
//   console.log('Grouped data:', Object.entries(groupedData))
//   return (
//     <Document>
//       <Page size='A4' style={styles.page} orientation='landscape'>
//         <View style={styles.section}>
//           <Text style={styles.title} >بسم الله الرحمن الرحيم</Text>
//           <Text style={styles.title}>
//             الملحقية العسكرية (إسلام اباد باكستان)
//           </Text>
//           <Text style={styles.title}>
//             الموضوع : مصروفات الملحقية العسكرية القطرية - عن شهر ({month}){' '}
//             {year}م
//           </Text>

//           <View style={styles.table}>
//             {/* Table header */}
//             <View style={[styles.tableRow, styles.headerCell]}>
//               <View style={[styles.tableCol, { width: '5%' }]}>
//                 <Text style={styles.tableCell}>رقم سند الصرف</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '8%' }]}>
//                 <Text style={styles.tableCell}>تاريخ السند</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '8%' }]}>
//                 <Text style={styles.tableCell}>رقم الفاتورة</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '15%' }]}>
//                 <Text style={styles.tableCell}>بيان سند الصرف</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '8%' }]}>
//                 <Text style={styles.tableCell}>رقم البند</Text>
//               </View>
//               <View style={[styles.tableCol, { width: '15%' }]}>
//                 <Text style={styles.tableCell}>اسم البند</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>المبلغ بالروبية</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>العملة</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>المبلغ بالدولار الامريكي</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>سعر الصرف</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>موازنة البند بالدولار</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>
//                   المتبقي من موازنة البند بعد الخصم
//                 </Text>
//               </View>
//             </View>

//             {Object.entries(groupedData).map(([accountType, items]) => {
//               const totalPKR = items.reduce(
//                 (sum, item) => sum + item.total_pkr,
//                 0
//               )
//               const totalUSD = items.reduce(
//                 (sum, item) => sum + item.total_usd,
//                 0
//               )
//               const budgetUSD = items[0].remaining_budget + totalUSD // Assuming remaining_budget is after deduction
//               const remainingBudget = items[0].remaining_budget

//               return (
//                 <React.Fragment key={accountType}>
//                   <View style={[styles.tableRow, styles.groupHeader]}>
//                     <View style={[styles.tableCol, { width: '44%' }]}>
//                       <Text style={styles.tableCell}>{accountType}</Text>
//                     </View>
//                     <View style={[styles.tableCol, { width: '56%' }]}>
//                       <Text style={styles.tableCell}></Text>
//                     </View>
//                   </View>
//                   {items.map((item, index) => (
//                     <React.Fragment key={index}>
//                       {item.invoice_nos.map((invoice, idx) => (
//                         <View style={styles.tableRow} key={`${index}-${idx}`}>
//                           <View style={[styles.tableCol, { width: '5%' }]}>
//                             <Text style={styles.tableCell}>
//                               {item.serial_no}
//                             </Text>
//                           </View>
//                           <View style={[styles.tableCol, { width: '8%' }]}>
//                             <Text style={styles.tableCell}>{item.date}</Text>
//                           </View>
//                           <View style={[styles.tableCol, { width: '8%' }]}>
//                             <Text style={styles.tableCell}>{invoice}</Text>
//                           </View>
//                           <View style={[styles.tableCol, { width: '15%' }]}>
//                             <Text style={styles.tableCell}>
//                               {item.descriptions[idx]}
//                             </Text>
//                           </View>
//                           <View style={[styles.tableCol, { width: '8%' }]}>
//                             <Text style={styles.tableCell}>
//                               {item.budget_voto_no}
//                             </Text>
//                           </View>
//                           <View style={[styles.tableCol, { width: '15%' }]}>
//                             <Text style={styles.tableCell}>
//                               {item.account_type_name}
//                             </Text>
//                           </View>
//                           <View style={styles.tableCol}>
//                             <Text style={styles.tableCell}>
//                               {item.pkr_values[idx].toFixed(2)}
//                             </Text>
//                           </View>
//                           <View style={styles.tableCol}>
//                             <Text style={styles.tableCell}>PKR</Text>
//                           </View>
//                           <View style={styles.tableCol}>
//                             <Text style={styles.tableCell}>
//                               {item.usd_values[idx].toFixed(2)}
//                             </Text>
//                           </View>
//                           <View style={styles.tableCol}>
//                             <Text style={styles.tableCell}>
//                               {item.exchange_rate.toFixed(2)}
//                             </Text>
//                           </View>
//                           <View style={styles.tableCol}>
//                             <Text style={styles.tableCell}>
//                               {idx === 0 ? budgetUSD.toFixed(2) : ''}
//                             </Text>
//                           </View>
//                           <View style={styles.tableCol}>
//                             <Text style={styles.tableCell}>
//                               {idx === 0 ? remainingBudget.toFixed(2) : ''}
//                             </Text>
//                           </View>
//                         </View>
//                       ))}
//                     </React.Fragment>
//                   ))}
//                   <View style={[styles.tableRow, styles.groupFooter]}>
//                     <View style={[styles.tableCol, { width: '59%' }]}>
//                       <Text style={styles.tableCell}>
//                         الإجمالي لبند ({accountType})
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {totalPKR.toFixed(2)}
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}></Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {totalUSD.toFixed(2)}
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}></Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {budgetUSD.toFixed(2)}
//                       </Text>
//                     </View>
//                     <View style={styles.tableCol}>
//                       <Text style={styles.tableCell}>
//                         {remainingBudget.toFixed(2)}
//                       </Text>
//                     </View>
//                   </View>
//                 </React.Fragment>
//               )
//             })}

//             <View style={[styles.tableRow, styles.groupFooter]}>
//               <View style={[styles.tableCol, { width: '59%' }]}>
//                 <Text style={styles.tableCell}>الاجمالي</Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>
//                   {data
//                     .reduce((sum, item) => sum + item.total_pkr, 0)
//                     .toFixed(2)}
//                 </Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}>
//                   {data
//                     .reduce((sum, item) => sum + item.total_usd, 0)
//                     .toFixed(2)}
//                 </Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//               <View style={styles.tableCol}>
//                 <Text style={styles.tableCell}></Text>
//               </View>
//             </View>
//           </View>

//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               marginTop: 20
//             }}
//           >
//             <Text style={styles.tableCell}>المحاسب</Text>
//             <Text style={styles.tableCell}>المدقق</Text>
//             <Text style={styles.tableCell}>الملحق العسكري</Text>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   )
// }
interface ReportPDFProps {
    data: ReportData[];
    month: string;
    year: number;
  }
  
  const ReportPDF: React.FC<ReportPDFProps> = ({ data, month, year }) => {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.budget_item_name]) {
        acc[item.budget_item_name] = [];
      }
      acc[item.budget_item_name].push(item);
      return acc;
    }, {} as Record<string, ReportData[]>);
  
    return (
      <div id="report-container" className="p-10" dir='rtl' style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
        <div className='flex items-center justify-center w-full'>
            <Image src="/report_logo.jpg" alt="logo" width={150} height={150} className="w-24 h-24" />

        </div>
        <h1 className="text-center text-2xl mb-4">بسم الله الرحمن الرحيم</h1>
        <h2 className="text-center text-xl mb-4">الملحقية العسكرية (إسلام أباد باكستان)</h2>
        <h3 className="text-center text-lg mb-6">
          الموضوع: مصروفات الملحقية العسكرية القطرية - عن شهر ({month}) {year}م
        </h3>
  
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {[
                "#",
                "رقم سند الصرف",
                "تاريخ السند",
                "رقم الفاتورة",
                "بيان سند الصرف",
                "رقم البند",
                "اسم البند",
                "المبلغ بالروبية",
                "العملة",
                "المبلغ بالدولار الامريكي",
                "سعر الصرف",
                "موازنة البند بالدولار",
                "المتبقي من موازنة البند بعد الخصم",
              ].map((header, index) => (
                <th key={index} className="border border-gray-300 p-2 text-sm font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([budgetItemName, items]) => {
              const rowSpan = items.reduce((sum, item) => sum + item.invoice_numbers.length, 0);
              
  
              return items.flatMap((item, itemIndex) => 
                item.invoice_numbers.map((invoice, invoiceIndex) => {
                  const isFirstInvoice = invoiceIndex === 0;
                  const isFirstItem = itemIndex === 0 && isFirstInvoice;
              
  
                  return (
                    <><tr key={`${item.payment_voucher_number}-${invoiceIndex}-${itemIndex}`} className="border-t border-gray-300">
                        <td className="border border-gray-300 p-2 text-sm">{invoiceIndex + 1}</td>
                      <td className="border border-gray-300 p-2 text-sm">{item.payment_voucher_number}</td>
                      <td className="border border-gray-300 p-2 text-sm">{item.voucher_date}</td>
                      <td className="border border-gray-300 p-2 text-sm">{invoice}</td>
                      <td className="border border-gray-300 p-2 text-sm">{item.descriptions[invoiceIndex]}</td>
                      {isFirstItem && (
                        <td rowSpan={rowSpan} className="border border-gray-300 p-2 text-sm">
                          {item.budget_item_number}
                        </td>
                      )}
                      {isFirstItem && (
                        <td rowSpan={rowSpan} className="border border-gray-300 p-2 text-sm">
                          {budgetItemName}
                        </td>
                      )}
                      <td className="border border-gray-300 p-2 text-sm">{parseFloat(item.pkr_values[invoiceIndex]).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-sm">PKR</td>
                      <td className="border border-gray-300 p-2 text-sm">{parseFloat(item.usd_values[invoiceIndex]).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-sm">{item.exchange_rate.toFixed(2)}</td>
                      {isFirstItem && (
                        <td rowSpan={rowSpan} className="border border-gray-300 p-2 text-sm">
                          {item.budget_amount_usd.toFixed(2)}
                        </td>
                      )}
                      {isFirstItem && (
                        <td rowSpan={rowSpan} className="border border-gray-300 p-2 text-sm">
                          {item.remaining_budget_usd.toFixed(2)}
                        </td>
                      )}
                      {/* show the total at last */}
                        

                    </tr>
                     {invoiceIndex == item.invoice_numbers.length-1 && (
                        <tr className="border-t border-gray-300">
                        <td colSpan={7} className="border border-gray-300 p-2 text-sm text-center">
                            الإجمالي لبند ({budgetItemName})
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">{item.pkr_values.reduce((sum, item) => sum + parseFloat(item), 0).toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-sm"></td>
                        <td className="border border-gray-300 p-2 text-sm">{item.usd_values.reduce((sum, item) => sum + parseFloat(item), 0).toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-sm"></td>
                        <td className="border border-gray-300 p-2 text-sm"></td>
                        <td className="border border-gray-300 p-2 text-sm"></td>
                        </tr>
                    )}
                    </>
                  );
                 
                })
              );
            })}
          </tbody>
         
        </table>
  
        <div className="flex justify-between mt-8">
          <span>المحاسب</span>
          <span>المدقق</span>
          <span>الملحق العسكري</span>
        </div>
      </div>
    );
  };
  
  export default ReportPDF;
  