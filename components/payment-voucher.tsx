'use client'

import { useEffect, useState, Suspense } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import TopHeader from './ui/topHeader'
import { convertToWords } from './numberToWords'
import { toast } from 'sonner'
import { FileUpload } from './file-upload'
import { useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation"
import { Paperclip, X } from 'lucide-react'

interface RowData {
  id: number
  invoiceNo: string
  description: string
  usd: string
  pkr: string
}

export function PaymentVoucherForm ({
  className
}: React.ComponentPropsWithoutRef<'div'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, invoiceNo: '', description: '', usd: '', pkr: '' }
  ])

  const [date, setDate] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [chequeNo, setChequeNo] = useState('')
  const [statement, setStatement] = useState('')
  const [attachments, setAttachments] = useState<File[]>([]);
  const [exchangeRate, setExchangeRate] = useState('')
  const [totalUsd, setTotalUsd] = useState(0)
  const [totalPkr, setTotalPkr] = useState(0)
  const [amountInWords, setAmountInWords] = useState('')
  const [auditorOfficer, setAuditorofficer]=useState('');
  const [currentBalance,setCurrentBalance]=useState(0);
  const searchParams = useSearchParams();
  const editId = searchParams.get('id')
  const [serialNo,setSerialNo]=useState(0);
  const [signature,setSignature]=useState("");
  const [banks,setBanks]=useState([]);
  const [files,setFiles]=useState([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  )

  const [selectedCategory, setSelectedCategory] = useState<{
    id: number
    name: string
  } | null>(null)
  const [isMustaaz, setIsMustaaz] = useState(false)
  const [isReimbursable, setIsReimbursable] = useState(false)

  const getAllLookups = async () => {
    const query = 'SELECT * FROM account_types';
    const response = await window.electronAPI.dbQuery(query, []);
    return response;
  };
  
  useEffect(() => {
    const getLastVoucherId = async () => {
      const query = 'SELECT id FROM payment_vouchers ORDER BY id DESC LIMIT 1';
      const response = await window.electronAPI.dbQuery(query, []);
    
      if (response.length > 0) {
        setSerialNo(response[0].id+1); 
      } else {
        setSerialNo(1); 
      }
    };

    const getBanks = async () => {
      const query = 'SELECT * FROM banks';
      const response = await window.electronAPI.dbQuery(query, []);
    
      if (response.length > 0) {
        setBanks(response); 
      }
    };

    getAllLookups()
      .then(response => {
        console.log('Categories response', response);
        setCategories(response.map(item => ({ id: item.id, name: item.name })));
      })
      .catch(error => {
        console.error('Error fetching account types:', error);
      });

    // Fetch last voucher ID
    getLastVoucherId();

      const getExchangeRate = async () => {
        const query = 'SELECT * FROM exchange_rate LIMIT 1';  
        try {
          const response = await window.electronAPI.dbQuery(query, []);
          if (response.length > 0) {
            console.log(response);
            setExchangeRate(response[0].amount); 
          }
        } catch (error) {
          console.error('Error fetching exchange rate:', error);
        }
      };

      getExchangeRate();
      getBanks();
  }, []);

  useEffect(() => {
    const getPaymentDetails = async () => {
      if (!editId) return; // Check if voucherId is available
  
      try {
        // Fetch payment voucher details
        const voucherQuery = `SELECT * FROM payment_vouchers WHERE id = ? LIMIT 1`;
        const voucherResponse = await window.electronAPI.dbQuery(voucherQuery, [editId]);
        console.log(voucherResponse);
        setDate(voucherResponse[0].date);
        setBeneficiary(voucherResponse[0].beneficiary);
        setStatement(voucherResponse[0].statement);
        setBankAccount(voucherResponse[0].bank_account);
        setChequeNo(voucherResponse[0].cheque_no);
        setExchangeRate(voucherResponse[0].exchange_rate);
        setTotalUsd(voucherResponse[0].total_usd);
        setTotalPkr(voucherResponse[0].total_pkr);
        setAmountInWords(voucherResponse[0].amount_in_words);
        setSerialNo(parseInt(voucherResponse[0].serial_no));  
        setCurrentBalance(parseInt(voucherResponse[0].current_balance));
        setIsMustaaz(voucherResponse[0].is_mustaaz === 1);
        setIsReimbursable(voucherResponse[0].IsReimbursable === 1);
        setSignature(voucherResponse[0].accountant_signature);
        setAuditorofficer(voucherResponse[0].auditor_signature);
        getAllLookups()
        .then(response => {
          const mappedCategories = response.map(item => ({ id: item.id, name: item.name }));
          
          const selectedCategory = mappedCategories.find(
            (cat) => cat.id == voucherResponse[0].budget_voto_no
          );
          
          setCategories(mappedCategories);
          if (selectedCategory) {
            setSelectedCategory(selectedCategory); 
          }
        })
        .catch(error => {
          console.error("Error fetching lookups:", error);
        });
  
        // Fetch payment voucher rows
        const rowsQuery = `SELECT * FROM payment_voucher_rows WHERE payment_voucher_id = ?`;
        const rowsResponse = await window.electronAPI.dbQuery(rowsQuery, [editId]);
        console.log("payment_voucher_rows",rowsResponse);
        setRows(rowsResponse.map(row => ({
          id: row.id,
          invoiceNo: row.invoice_no,  
          description: row.description,
          usd: row.usd,
          pkr: row.pkr, 
        })));
  
        // Fetch payment voucher attachments
        const attachmentsQuery = `SELECT * FROM payment_voucher_attachments WHERE payment_voucher_id = ?`;
        const attachmentsResponse = await window.electronAPI.dbQuery(attachmentsQuery, [editId]);
        console.log('dff',attachmentsResponse);
        setFiles(attachmentsResponse);
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    };

    
    getPaymentDetails();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        budgetVotoNo: selectedCategory?.id.toString() as string,
        serialNo: serialNo,
        isMustaaz: isMustaaz ? 1 : 0,
        IsReimbursable: isReimbursable  ? 1 : 0,
        date: date,
        beneficiary: beneficiary,
        bankAccount: bankAccount,
        chequeNo: chequeNo,
        exchangeRate: parseFloat(exchangeRate),
        totalUsd,
        totalPkr,
        amountInWords,
        currentBalance,
        status:'Active',
        accountantSignature: 
       formData.get('accountantSignature')
        ,
        auditorSignature: formData.get('auditorSignature'),
        rows: rows.map(row => ({
          invoiceNo: row.invoiceNo,
          description: row.description,
          usd: parseFloat(row.usd),
          pkr: parseFloat(row.pkr)
        }))
      }
      console.log(rows);
      await saveFormData(data)
      alert('Payment voucher saved successfully!')
      router.push('/dashboard/payment-main')
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Error saving payment voucher. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveFormData = async data => {
    const {
      budgetVotoNo,
      serialNo,
      isMustaaz,
      date,
      beneficiary,
      bankAccount,
      chequeNo,
      exchangeRate,
      totalUsd,
      totalPkr,
      amountInWords,
      currentBalance,
      accountantSignature,
      auditorSignature,
      IsReimbursable,
      rows
    } = data

    console.log(data)
    try {
      let signaturePath = ''
      let auditorSign = ''
      if(accountantSignature) {
        const fileName = `${Date.now()}-${accountantSignature.name}`
        const filePath = `/uploads/Signatures/${fileName}`
        await window.electronAPI.saveFile({
          path: filePath,
          content: await accountantSignature.arrayBuffer()
        })
        signaturePath = filePath
      }

      if(auditorSignature) {
        const fileName = `${Date.now()}-${auditorSignature.name}`
        const filePath = `/uploads/Signatures/${fileName}`
        await window.electronAPI.saveFile({
          path: filePath,
          content: await auditorSignature.arrayBuffer()
        })
        auditorSign = filePath

      }
      const paymentVoucherQuery = `
        INSERT INTO payment_vouchers 
        (budget_voto_no, serial_no, is_mustaaz, date, current_balance,beneficiary, IsReimbursable, bank_account, cheque_no, exchange_rate, total_usd, total_pkr, amount_in_words, accountant_signature, auditor_signature,statement)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?, ?, ?)
      `
      const paymentVoucherValues = [
        budgetVotoNo,
        serialNo,
        isMustaaz,
        date,
        currentBalance,
        beneficiary,
        IsReimbursable,
        bankAccount,
        chequeNo,
        exchangeRate,
        totalUsd,
        totalPkr,
        amountInWords,
        signaturePath,
        auditorSign,
        statement
      ]

      // Execute the query to insert the main payment voucher
      const paymentVoucherResult = await window.electronAPI.dbQuery(
        paymentVoucherQuery,
        paymentVoucherValues
      )
      
      console.log(paymentVoucherResult.insertId);
      console.log(paymentVoucherResult.success);
      // Check if the insertion was successful and retrieve the actual insertId
      if (paymentVoucherResult.success && paymentVoucherResult.insertId) {
        const paymentVoucherId = paymentVoucherResult.insertId // This is the actual ID of the inserted payment voucher

        // Insert rows associated with the payment voucher record
        const rowQueries = rows.map((row: any) => {
          const rowQuery = `
            INSERT INTO payment_voucher_rows (payment_voucher_id,invoice_no, description, usd, pkr)
            VALUES (?, ?, ?, ?, ?)
          `
          const rowValues = [
            paymentVoucherId, // Use the actual payment voucher ID here
            row.invoiceNo,
            row.description,
            row.usd,
            row.pkr
          ]
          return window.electronAPI.dbQuery(rowQuery, rowValues)
        })
        for (const file of attachments) {
          const fileName = `${Date.now()}-${file.name}`
          const filePath = `/uploads/Online_payment/${fileName}`
          
          // Save file to local filesystem using electron
          await window.electronAPI.saveFile({
            path: filePath,
            content: await file.arrayBuffer()
          })

          // Save file reference in database
          await window.electronAPI.dbQuery(
            `INSERT INTO payment_voucher_attachments (payment_voucher_id, file_name, file_path, file_type)
             VALUES (?, ?, ?, ?)`,
            [paymentVoucherId, file.name, filePath, file.type]
          )
        }
        console.log(rowQueries);
        // Execute all row queries
        await Promise.all(rowQueries)

        toast.success('تم حفظ البيانات بنجاح') // Data saved successfully message
        console.log('Data saved successfully!')
      } else {
        console.error('Failed to retrieve insertId:',paymentVoucherResult.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      throw new Error('Failed to save data.')
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        budgetVotoNo: selectedCategory?.id.toString() as string,
        serialNo: serialNo,
        isMustaaz: isMustaaz ? 1 : 0,
        IsReimbursable: isReimbursable ? 1 : 0,
        date: date,
        beneficiary: beneficiary,
        bankAccount: bankAccount,
        chequeNo: chequeNo,
        exchangeRate: parseFloat(exchangeRate),
        totalUsd,
        totalPkr,
        amountInWords,
        currentBalance,
        status:'Active',
        accountantSignature: 
       formData.get('accountantSignature')
        ,
        auditorSignature: auditorOfficer,
        rows: rows.map(row => ({
          invoiceNo: row.invoiceNo,
          description: row.description,
          usd: parseFloat(row.usd),
          pkr: parseFloat(row.pkr)
        }))
      }
      console.log(data);
      await updateFormData(data)
      alert('Payment voucher Updated successfully!')
      router.push('/dashboard/payment-main')
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Error saving payment voucher. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = async (data: any) => {
    const {
      id,
      budgetVotoNo,
      serialNo,
      isMustaaz,
      date,
      beneficiary,
      bankAccount,
      chequeNo,
      exchangeRate,
      totalUsd,
      totalPkr,
      amountInWords,
      currentBalance,
      IsReimbursable,
      rows
    } = data;
  
    try {
      const paymentVoucherQuery = `
        UPDATE payment_vouchers 
        SET 
          budget_voto_no = ?, 
          serial_no = ?, 
          is_mustaaz = ?, 
          date = ?, 
          beneficiary = ?, 
          IsReimbursable=?,
          bank_account = ?, 
          cheque_no = ?, 
          exchange_rate = ?, 
          current_balance=?,
          total_usd = ?, 
          total_pkr = ?, 
          amount_in_words = ?, 
          statement = ?
        WHERE id = ?
      `;
  
      const paymentVoucherValues = [
        budgetVotoNo,
        serialNo,
        isMustaaz,
        date,
        beneficiary,
        IsReimbursable,
        bankAccount,
        chequeNo,
        exchangeRate,
        currentBalance,
        totalUsd,
        totalPkr,
        amountInWords,
        statement,
        editId, 
      ];
  
      const paymentVoucherResult = await window.electronAPI.dbQuery(
        paymentVoucherQuery,
        paymentVoucherValues
      );
  
      if (paymentVoucherResult.success) {
        try {
          // Delete existing rows for the current payment voucher
          const deleteRowsQuery = `
            DELETE FROM payment_voucher_rows 
            WHERE payment_voucher_id = ?
          `;
          await window.electronAPI.dbQuery(deleteRowsQuery, [editId]);
      
          // Insert new rows into payment_voucher_rows
          const rowQueries = rows.map((row: any) => {
            const rowQuery = `
              INSERT INTO payment_voucher_rows (payment_voucher_id, invoice_no, description, usd, pkr)
              VALUES (?, ?, ?, ?, ?)
            `;
            const rowValues = [
              editId, // payment_voucher_id
              row.invoiceNo,
              row.description,
              row.usd,
              row.pkr,
            ];
            return window.electronAPI.dbQuery(rowQuery, rowValues);
          });
      
          // Execute all row insert queries
          await Promise.all(rowQueries);
      
          // Handle attachments if any exist
          if (attachments && attachments.length > 0) {
            for (const file of attachments) {
              const fileName = `${Date.now()}-${file.name}`;
              const filePath = `/uploads/Online_payment/${fileName}`;
      
              // Save file to local filesystem using electron
              await window.electronAPI.saveFile({
                path: filePath,
                content: await file.arrayBuffer()
              });
      
              // Insert the file information into the database
              await window.electronAPI.dbQuery(
                `INSERT INTO payment_voucher_attachments (payment_voucher_id, file_name, file_path, file_type)
                 VALUES (?, ?, ?, ?)`,
                [editId, file.name, filePath, file.type]
              );
            }
          }
      
          // Success message
          toast.success('تم تحديث البيانات بنجاح'); // Data updated successfully message
          console.log('Data updated successfully!');
        } catch (error) {
          console.error('Error updating rows and attachments:', error);
          throw new Error('Failed to update rows and attachments.');
        }
      } else {
        console.error('Failed to update payment voucher:', paymentVoucherResult.error || 'Unknown error');
      }                 
    } catch (error) {
      console.error('Error updating data:', error);
      throw new Error('Failed to update data.');
    }
  };

  const removeFile= async (id: number)=>{
      const confirm = window.confirm(
        'Are you sure you want to delete this file?'
      );
      if (!confirm) return;
  
      const query = 'DELETE FROM payment_voucher_attachments WHERE id = ?';
      await window.electronAPI.dbQuery(query, [id]);
      const updatedFiles = files.filter((file) => file.id !== id);
      setFiles(updatedFiles);
      toast.success('File Deleted');
  }

  const addRow = () => {
    setRows([
      ...rows,
      { id: rows.length + 1, invoiceNo: '', description: '', usd: '', pkr: '' }
    ])
  }

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id))
    }
  }

  const handleRowChange = (id: number, field: keyof RowData, value: string) => {
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value }
        if (field === 'usd') {
          // updatedRow.pkr = (
          //   parseFloat(value) * parseFloat(exchangeRate)
          // ).toFixed(2)
        } else if (field === 'pkr') {
          updatedRow.usd = (
            parseFloat(value) / parseFloat(exchangeRate)
          ).toFixed(2)
        }
        return updatedRow
      }
      return row
    })
    setRows(updatedRows)
  }

  useEffect(() => {
    const calculateTotals = () => {
      const usdTotal = rows.reduce(
        (sum, row) => sum + (parseFloat(row.usd) || 0),
        0
      )
      const pkrTotal = rows.reduce(
        (sum, row) => sum + (parseFloat(row.pkr) || 0),
        0
      )
      setTotalUsd(usdTotal)
      setTotalPkr(pkrTotal)
      setAmountInWords(convertToWords(usdTotal))
    }
    calculateTotals()
  }, [rows, exchangeRate])

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSignature(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuditorImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAuditorofficer(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div
      className={cn(
        'flex w-full max-w-7xl flex-col font-taybah  bg-white',
        className
      )}
      dir='rtl'
    >
      <TopHeader />

      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold '>مستند الصرف</h1>
        <h2 className='text-xl font-bold font-geist uppercase'>
          Payment Voucher
        </h2>
      </div>

      <form onSubmit={editId ? handleUpdate : handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-2 gap-16 '>
          <div className='flex items-center gap-2  justify-start w-full font-bold font-geist p-4 border border-black'>
            <Label className='font-bold text-lg'>رقم البند</Label>
            <Input
              name='budgetVotoNo'
              className='w-48 !border-b-2 text-center border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
              defaultValue={selectedCategory?.id.toString()}
              readOnly
            />
            <Label>Budget Voto No</Label>
          </div>
          <div className='flex items-center  gap-2 justify-end w-full font-bold font-geist p-4 border border-black'>
            <Label className='font-bold text-lg'>رقم المستند</Label>
            <Input
              name='serialNo'
              className='w-48 !border-b-2 text-center border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
              value={serialNo}
              readOnly
            />
            <Label>Serial No</Label>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-16 '>
          <div className='flex  flex-col gap-2  w-full font-bold font-geist  border divide-y divide-black border-black'>
            <div className='flex flex-col gap-3 p-4'>
              <div className='flex flex-col'>
                <Label className='font-bold text-lg'>
                  اسم البند / وقود وزيوت وقوى محركة
                </Label>
                <Label className='font-bold text-sm font-geist'>
                  Budget Voto No
                </Label>
              </div>
              <select
                id="itemName"
                name="itemName"
                className="!border-b-2 border-transparent rounded-none font-bold border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                value={selectedCategory?.name || ''}
                onChange={(e) => {
                  setSelectedCategory(
                    categories.find((category) => category.name == e.target.value) || null
                  );
                }}
              >
                <option value="" disabled>
                  اختر الحساب
                </option>
                {categories.map((category) => (
                  <option
                    key={category.id}
                    className="font-bold"
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col items-start gap-2 p-4'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='Mustaaz' className='font-bold text-lg'>
                  مستعاض
                </Label>
                <input
                  type='radio'
                  name='isMustaaz'
                  id='Mustaaz'
                  value='true'
                  checked={isMustaaz}
                  className='accent-black'
                  onChange={() => setIsMustaaz(true)}
                />
                <Label htmlFor='GairMustaaz' className='font-bold text-lg'>
                  غير مستعاض
                </Label>
                <input
                  type='radio'
                  id='GairMustaaz'
                  name='isMustaaz'
                  value='false'
                  className='accent-black'
                  checked={!isMustaaz}
                  onChange={() => setIsMustaaz(false)}
                />
              </div>
            </div>
            <div className='grid grid-cols-[max-content_1fr] gap-2 p-4'>
              <div className='flex flex-col'>
                <Label className='font-bold text-lg'>
                الرصيد الحالي :
                </Label>
                <Label className='font-bold text-sm font-geist'>
                  Current Balance
                </Label>
              </div>
              <Input
                name='currentBalance'
                className=' !border-b-2 border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
                value={currentBalance}
                dir='rtl'
                onChange={e => setCurrentBalance(e.target.value)}
              />
            </div>
          </div>
          <div className='flex  flex-col gap-2  w-full font-bold font-geist  border divide-y divide-black border-black'>
            <div className='grid grid-cols-[max-content_1fr] gap-2 p-4'>
              <div className='flex flex-col'>
                <Label className='font-bold text-lg'>
                  إسم المستفيد جهات مختلفة :
                </Label>
                <Label className='font-bold text-sm font-geist'>
                  Beneficiary Name
                </Label>
              </div>
              <Input
                name='beneficiary'
                className=' !border-b-2 border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
                value={beneficiary}
                dir='rtl'
                onChange={e => setBeneficiary(e.target.value)}
              />
            </div>
            {/* banks list */}
            <div className='grid gap-2'>
              <div className='grid grid-cols-2'>
               
                <div className='grid grid-cols-[max-content_1fr] gap-2 p-4 place-items-center'>
                  <div className='flex flex-col'>
                    <Label className='font-bold text-lg'>شيك تحويل رقم :</Label>
                    <Label className='font-bold text-sm font-geist'>
                      Cheque No
                    </Label>
                  </div>
                  <Input
                    name='chequeNo'
                    className='!border-b-2  border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
                    value={chequeNo}
                    dir='rtl'
                    onChange={e => setChequeNo(e.target.value)}
                  />
                </div>
                <div className='grid grid-cols-[max-content_1fr] gap-2 p-4'>
                  <div className='flex flex-col'>
                    <Label className='font-bold text-lg'>البنك :</Label>
                    <Label className='font-bold text-sm font-geist'>Bank</Label>
                  </div>
                  <select
                    name='bank'
                    className=' !border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b'
                    value={bankAccount}
                    dir='rtl'
                    onChange={e => setBankAccount(e.target.value)}
                  >
                    <option value="" disabled>
                      اختر الحساب
                    </option>
                    {banks.map((bank, index) => (
                      <option key={index} className='font-bold' value={bank.bank_name}>
                        {bank.bank_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='grid grid-cols-[max-content_1fr] gap-2 p-4'>
                <div className='flex flex-col'>
                  <Label className='font-bold text-lg'>التاريخ :</Label>
                  <Label className='font-bold text-sm font-geist'>Date</Label>
                </div>
                <Input
                  name='date'
                  type='date'
                  className=' !border-b-2 border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
                  value={date}
                  dir='rtl'
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2  justify-center w-full font-bold font-geist p-4 border border-black'>
            <Label className='font-bold text-lg whitespace-nowrap'>بيان</Label>
            <Input
              name='statement'
              className='w-full mb-5 !border-b-2 text-center border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
              value={statement}
              onChange={e => setStatement(e.target.value)}
            />
            <Label>Statement</Label>
          </div>        
        <div className='border-t border-l border-r  border-black '>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-black'>
              <th className='border-l border-black p-2'>
                رقم الفاتورة
                <br />
                <span className='font-geist'>Invoice No</span>
              </th>
              <th className='border-l border-black p-2 w-1/2'>
                البيان <br />
                <span className='font-geist'>Statement</span>
              </th>
              <th className='border-l border-black p-2 w-1/6'>
                دولار امريكي <br /> <span className='font-geist'>USD</span>
              </th>
              <th className='p-2 w-1/6'>
                روبية باكستانية <br /> <span className='font-geist'>PKR</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className='border-b border-black'>
                <td className='border-l border-black p-2'>
                  <Input
                    name={`invoiceNo_${row.id}`}
                    value={row.invoiceNo}
                    onChange={e =>
                      handleRowChange(row.id, 'invoiceNo', e.target.value)
                    }
                    dir='rtl'
                    className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                  />
                </td>
                <td className='border-l border-black p-2 w-1/2'>
                  <Input
                    name={`description_${row.id}`}
                    value={row.description}
                    onChange={e =>
                      handleRowChange(row.id, 'description', e.target.value)
                    }
                    dir='rtl'
                    className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                  />
                </td>
                <td className='border-l border-black p-2 w-1/6 relative'>
                  <span className='absolute top-1/2 -translate-y-1/2 left-2'>
                    $
                  </span>
                  <Input
                    name={`usd_${row.id}`}
                    type='number'
                    dir='rtl'
                    step='0.01'
                    className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                    value={row.usd}
                    onChange={e =>
                      handleRowChange(row.id, 'usd', e.target.value)
                    }
                  />
                </td>
                <td className='p-2 w-1/6 relative'>
                  <span className='absolute top-1/2 -translate-y-1/2 left-2 text-xs font-bold'>
                    RS
                  </span>
                  <Input
                    name={`pkr_${row.id}`}
                    type='number'
                    dir='rtl'
                    step='0.01'
                    className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                    value={row.pkr}
                    onChange={e =>
                      handleRowChange(row.id, 'pkr', e.target.value)
                    }
                  />
                  {index > 0 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute -left-12 top-1/2 -translate-y-1/2'
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            <tr className='border-b border-black'>
              <td colSpan={1} className='border-l border-black p-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='font-normal font-geist'
                  onClick={addRow}
                >
                  <Plus className='h-4 w-4 mr-2 ' />
                  Add Row
                </Button>
              </td>
              <td colSpan={1} className='border-l border-black p-2'>
                <Label className='font-bold text-xl'>المجموع</Label>
              </td>
              <td className='border-l border-black p-2 font-bold text-right relative font-geist w-1/6'>
                <span className='absolute top-1/2 -translate-y-1/2 left-2 font-bold'>
                  $
                </span>
                {totalUsd?.toFixed(2)}
              </td>
              <td className='p-2 font-bold text-right relative font-geist w-1/6'>
                <span className='absolute top-1/2 -translate-y-1/2 left-2 text-xs font-bold'>
                  RS
                </span>
                {totalPkr?.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <div className='grid grid-cols-2 font-bold font-geist divide-y border border-black divide-black  max-w-xl'>
          <div className='flex flex-col p-4 text-xl text-right gap-2  border-l border-l-black'>
            <Label className='font-bold text-xl'>سعر الصرف</Label>
            <Label dir='ltr'>Exchange Rate</Label>
          </div>

          <Input
            name='exchangeRate'
            value={exchangeRate}
            onChange={e => setExchangeRate(e.target.value)}
            readOnly
            className='w-48 m-4 !border-b-2 border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
          />
          <div className='flex flex-col p-4 text-right font-bold gap-2 border-l border-l-black'>
            <Label className='font-bold text-xl'>المبلغ المعادل ب</Label>
            <Label dir='ltr'>Total in</Label>
          </div>
          <div className='font-bold p-4'>{totalUsd?.toFixed(2)} USD</div>
        </div>

        <div
          className='grid font-bold font-geist divide-y border border-black divide-black  max-w-xl'
          dir='rtl'
        >
          <p className='p-4 w-full text-center'>{amountInWords}</p>
        </div>

        <div className='pt-4'>
          <p className='text-xl font-bold leading-relaxed text-center'>
            أشهد بأن هذا المبلغ يستحق الدفع وبأنه صحيح فيما يتعلق بالعمليات
            الحسابية وثبات الدفع والقيام بالخدمات المطلوبة على الوجه الأكمل
            وبأنه لم يتم دفعها من قبل وأنه لن تصرف للدفع مستقبلاً وعليه فإني
            أطلب دفع المبلغ المذكور أعلاه.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 pt-4'>
          <div>
            <Label className='text-xl font-bold'>المحاسب:</Label>
            {!editId ? (
              <div>
                  <div>
                    {signature?(
                      <img 
                        src={`${signature}`} 
                        alt="Signature" 
                        className="w-20 mt-3 h-auto" 
                      />
                    ):(
                      ''
                    )}
                    <Input
                      name="accountantSignature"
                      type="file"
                      multiple={false}
                      accept="image/*"
                      dir="rtl"
                      onChange={handleImageChange}
                      className="w-48 !border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                    />
                  </div>
              </div>
            ) : (
              <div>
                <img 
                  src={`${signature}`} 
                  alt="Signature" 
                  className="w-20 mt-3 h-auto" 
                />
                <hr className="mt-3" style={{ width: '22%',color:"black" }} />
              </div>
            )}
            <p className='text-sm mt-1 font-semibold'>Accountant Signature</p>
          </div>
          <div>
            <Label className='text-xl font-bold'>المدقق المالي:</Label>
            {!editId ? (
              <div>
                  <div>
                    {auditorOfficer?(
                      <img 
                        src={`${auditorOfficer}`} 
                        alt="Signature" 
                        className="w-20 mt-3 h-auto" 
                      />
                    ):(
                      ''
                    )}
                    <Input
                      name="auditorSignature"
                      type="file"
                      multiple={false}
                      accept="image/*"
                      dir="rtl"
                      onChange={handleAuditorImageChange}
                      className="w-48 !border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                    />
                  </div>
              </div>
            ) : (
              <div>
                <img 
                  src={`${auditorOfficer}`} 
                  alt="Signature" 
                  className="w-20 mt-3 h-auto" 
                />
                <hr className="mt-3" style={{ width: '22%',color:"black" }} />
              </div>
            )}
            <p className='text-sm mt-1 font-semibold'>Auditor Officer</p>
          </div>
        </div>

        <div className=' pt-4'>
          <h3 className='font-bold mb-2 text-destructive text-xl underline underline-offset-2'>
            مرفقات سند الصرف:
          </h3>
          <ol className='list-decimal list-inside font-medium text-xl'>
            <li>صورة الشيك</li>
            <li>أصل الفاتورة</li>
          </ol>
          <div className="mt-4">
            <FileUpload onFilesChange={setAttachments} />

            {files.length > 0 && (
              <div className='space-y-2'>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between gap-2 p-2 mt-5 border rounded'
                  >
                    <a href={file.file_path} target="_blank"><span className='text-sm'>{file.file_name}</span></a>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeFile(file.id)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </div>
        </div>

        <div className='text-center pt-4'>
          <h3 className='font-bold mb-2 text-xl'>إعتماد الملحق العسكري</h3>
          <p className='text-sm font-semibold'>Defense Attache Approval</p>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'fixed',
              bottom: '10px',
              left: '280px',
              right: '10px',
              zIndex: 1000,
              backgroundColor: 'white',
              boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Button
              style={{
                width: '100%',
                backgroundColor: '#800020',
                color: 'white'
              }}
              type='submit'
              className='font-medium text-xl'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : editId ? 'تحديث النموذج':'حفظ المستند'}
            </Button>
          </div>
        </div>
      </form>
    </div>
    </Suspense>
  )
}

export default PaymentVoucherForm;
