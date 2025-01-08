'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import TopHeader from './ui/topHeader'
import { convertToWords } from './numberToWords'
import { toast } from 'sonner'
import { FileUpload } from './file-upload'
import { useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation"
import { Paperclip, X } from 'lucide-react'

interface PettyCashFormProps extends React.ComponentPropsWithoutRef<'div'> {
  onSubmit: (data: FormData) => Promise<void>
}

interface RowData {
  id: number
  description: string
  usdAmount: string
  pkrAmount: string
  beneficiary?: string
}

export function PettyCashForm ({
  className,
  onSubmit,
  ...props
}: PettyCashFormProps) {
  const [autoNumber, setAutoNumber] = useState(0);
  const router = useRouter()
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const [FormId,setFormId]=useState(0);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  )
  const [attachments, setAttachments] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<{
    id: number
    name: string
  } | null>(null)
  const [totalUsd, setTotalUsd] = useState('0.00')
  const [totalPkr, setTotalPkr] = useState('0.00')
  const [amountInWords, setAmountInWords] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(1)
  const [receiverSignature,setRecieverSignature]=useState("");
  const [statement,setStatement]=useState("");
  const [accountantSign,setAccountSign]=useState("");
  const [addedFiles,setAddedFiles]=useState([]);
  
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, description: '', usdAmount: '', pkrAmount: '', beneficiary: '' },
    { id: 2, description: '', usdAmount: '', pkrAmount: '', beneficiary: '' },
    { id: 3, description: '', usdAmount: '', pkrAmount: '', beneficiary: '' },
    { id: 4, description: '', usdAmount: '', pkrAmount: '', beneficiary: '' },
    { id: 5, description: '', usdAmount: '', pkrAmount: '', beneficiary: '' }
  ])

  const convertPkrToUsd = (pkr: number) => (pkr / exchangeRate).toFixed(2)

  const calculateTotals = (rows: any[]) => {
    let usdTotal = 0;
    let pkrTotal = 0;
  
    // Iterate through the updated rows
    rows.forEach(row => {
      usdTotal += parseFloat(row.usdAmount) || 0;
      pkrTotal += parseFloat(row.pkrAmount) || 0;
    });
  
    // Update the totals state
    setTotalUsd(usdTotal.toFixed(2));
    setTotalPkr(pkrTotal.toFixed(2));
    console.log(usdTotal);
    setAmountInWords(convertToWords(parseInt(usdTotal)));
  };

  const getAllLookups = async () => {
    const query = `SELECT * FROM account_types`

    const response = await window.electronAPI.dbQuery(query, [])
    return response
  }

  useEffect(()=>{
    setFormId(parseInt(editId));
  },[editId])

  useEffect(() => {
    getAllLookups()
      .then(response => {
        console.log('response', response)
        setCategories(response.map(item => ({ id: item.id, name: item.name })))
    })
    .catch(error => {
      console.error('Error:', error)
    })

    const getLastPettyCashId = async () => {
      const query = 'SELECT id FROM petty_cash ORDER BY id DESC LIMIT 1';
      
      try {
        const response = await window.electronAPI.dbQuery(query, []);
        if (response.length > 0) {
          setAutoNumber(response[0].id+1);  
        } else {
          setAutoNumber(1);  
        }
      } catch (error) {
        console.error('Error fetching last petty_cash id:', error);
      }
    };

    const getExchangeRate = async () => {
      const query = 'SELECT * FROM exchange_rate LIMIT 1';  
      try {
        const response = await window.electronAPI.dbQuery(query, []);
        if (response.length > 0) {
          setExchangeRate(response[0].amount); 
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };
  
    getLastPettyCashId();
    getExchangeRate();
  }, [])

  useEffect(() => {
    const getPaymentDetails = async () => {
      if (!FormId) return; // Check if voucherId is available
  
      try {
        // Fetch payment voucher details
        const voucherQuery = `SELECT * FROM petty_cash WHERE id = ? LIMIT 1`;
        const voucherResponse = await window.electronAPI.dbQuery(voucherQuery, [FormId]);
        console.log("response",voucherResponse);

        setAmountInWords(voucherResponse[0].amount_in_words);
        setAutoNumber(voucherResponse[0].id);
        setTotalPkr(voucherResponse[0].total_pkr);
        setTotalUsd(voucherResponse[0].total_usd);
        setRecieverSignature(voucherResponse[0].receiver_signature);
        setAccountSign(voucherResponse[0].accountant_name);
        setStatement(voucherResponse[0].statement);
        const dateInput = document.querySelector('[name="date"]') as HTMLInputElement;
        const militaryAttacheName = document.querySelector('[name="militaryAttacheName"]') as HTMLInputElement;
        dateInput.value = voucherResponse[0].date;
        militaryAttacheName.value = voucherResponse[0].military_attache_name;

        // Fetch payment voucher rows
        const rowsQuery = `SELECT * FROM petty_cash_rows WHERE petty_cash_id = ?`;
        const rowsResponse = await window.electronAPI.dbQuery(rowsQuery, [FormId]);
        console.log("rows",rowsResponse);
        setRows(rowsResponse.map(row => ({
          id: row.id,
          description: row.description,  
          usdAmount: row.usd_amount,
          pkrAmount: row.pkr_amount,
          beneficiary: row.beneficiary, 
        })));
  
        // Fetch payment voucher attachments
        const attachmentsQuery = `SELECT * FROM petty_cash_attachments WHERE petty_cash_id = ?`;
        const attachmentsResponse = await window.electronAPI.dbQuery(attachmentsQuery, [FormId]);
        console.log('dff',attachmentsResponse);
        setAddedFiles(attachmentsResponse);

        getAllLookups()
        .then(response => {
          const mappedCategories = response.map(item => ({ id: item.id, name: item.name }));
          
          const selectedCategory = mappedCategories.find(
            (cat) => cat.id == voucherResponse[0].item_number
          );
          
          setCategories(mappedCategories);
          if (selectedCategory) {
            setSelectedCategory(selectedCategory); 
          }
        })
        .catch(error => {
          console.error("Error fetching lookups:", error);
        });
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    };

    getPaymentDetails();
  }, [FormId]);


  const handleInputChange = (id: number, field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
  
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        console.log(field);
        if (field === 'usdAmount') {
          // const pkrAmount = convertUsdToPkr(numericValue);
          // return { ...row, [field]: value, pkrAmount };
        } else if (field === 'pkrAmount') {
          const usdAmount = convertPkrToUsd(numericValue);
          console.log(usdAmount);
          return { ...row, [field]: value, usdAmount };
        }
        return { ...row, [field]: value };
      }
      return row;
    });
  
    setRows(updatedRows);
    calculateTotals(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { id: rows.length + 1, description: '', usdAmount: '', pkrAmount: '' }
    ])
  }

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    console.log(formData.get('accountantName'),formData.get('receiverSignature'))
    const data = {
      date: formData.get('date') as string,
      itemName: formData.get('itemName') as string,
      itemNumber: selectedCategory.id,
      exchangeApproval: formData.get('exchangeApproval') as string,
      militaryAttacheName: formData.get('militaryAttacheName') as string,
      accountantName: formData.get('accountantName'),
      receiverSignature: formData.get('receiverSignature'),
      statement: statement,
      rows: rows.map(row => ({
        description: formData.get(`description_${row.id}`) as string,
        usdAmount: parseFloat(formData.get(`usd_${row.id}`) as string) || 0,
        pkrAmount: parseFloat(formData.get(`pkr_${row.id}`) as string) || 0,
        beneficiary: formData.get(`beneficiary_${row.id}`) as string
      })),
      totalUsd,
      totalPkr,
      amountInWords
    }

    try {
      await saveFormData(data)
      router.push('/dashboard/cash-main')
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Error saving form data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveFormData = async data => {
    const {
      date,
      itemName,
      itemNumber,
      exchangeApproval,
      militaryAttacheName,
      accountantName,
      receiverSignature,
      rows,
      totalUsd,
      totalPkr,
      amountInWords,
      statement
    } = data

    try {
      // Insert the main petty cash record
      let signaturePath = ''
      let accountSignPath = ''
      console.log(receiverSignature, accountantName);
      if(receiverSignature) {
        const fileName = `${Date.now()}-${receiverSignature.name}`
        const filePath = `/uploads/Signatures/${fileName}`
        await window.electronAPI.saveFile({
          path: filePath,
          content: await receiverSignature.arrayBuffer()
        })
        signaturePath = filePath

      }
      if(accountantName) {
        const fileName = `${Date.now()}-${accountantName.name}`
        const filePath = `/uploads/Signatures/${fileName}`
        await window.electronAPI.saveFile({
          path: filePath,
          content: await accountantName.arrayBuffer()
        })
        accountSignPath = filePath

      }
      const pettyCashQuery = `
        INSERT INTO petty_cash (id,date, item_name, statement, item_number, exchange_approval, military_attache_name, accountant_name, receiver_signature, total_usd, total_pkr, amount_in_words)
        VALUES (?,?, ?, ?, ?, ? , ?, ?, ?, ?, ?, ?)
      `
      const pettyCashValues = [
        autoNumber,
        date,
        itemName,
        statement,
        itemNumber,
        exchangeApproval,
        militaryAttacheName,
        accountSignPath,
        signaturePath,
        totalUsd,
        totalPkr,
        amountInWords
      ]

      const pettyCashResult = await window.electronAPI.dbQuery(
        pettyCashQuery,
        pettyCashValues
      )
      console.log(pettyCashResult)

      if (pettyCashResult.success && pettyCashResult.insertId) {
        const rowQueries = rows.map(row => {
          const rowQuery = `
            INSERT INTO petty_cash_rows (id,petty_cash_id, description, usd_amount, pkr_amount, beneficiary)
            VALUES (?,?, ?, ?, ?, ?)
          `
          const rowValues = [
            Math.floor(Math.random() * 1000000),
            autoNumber,
            row.description,
            row.usdAmount,
            row.pkrAmount,
            row.beneficiary
          ]
          return window.electronAPI.dbQuery(rowQuery, rowValues)
        })

        // Execute all row queries
        await Promise.all(rowQueries)
        for (const file of attachments) {
          const fileName = `${Date.now()}-${file.name}`
          const filePath = `/uploads/Petty_cash/${fileName}`

          // Save file to local filesystem using electron
          await window.electronAPI.saveFile({
            path: filePath,
            content: await file.arrayBuffer()
          })

          // Save file reference in database
          await window.electronAPI.dbQuery(
            `INSERT INTO petty_cash_attachments (petty_cash_id, file_name, file_path, file_type)
             VALUES (?, ?, ?, ?)`,
            [autoNumber, file.name, filePath, file.type]
          )
        }
        toast.success('تم حفظ البيانات بنجاح')

        console.log('Data saved successfully!')
      } else {
        console.error(
          'Failed to retrieve insertId:',
          pettyCashResult.error || 'Unknown error'
        )
      }

      // Insert rows associated with the petty cash record
    } catch (error) {
      console.error('Error saving data:', error)
      throw new Error('Failed to save data.')
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      date: formData.get('date') as string,
      itemName: formData.get('itemName') as string,
      itemNumber: selectedCategory.id,
      exchangeApproval: formData.get('exchangeApproval') as string,
      militaryAttacheName: formData.get('militaryAttacheName') as string,
      receiverSignature: formData.get('receiverSignature') ,
      statement: statement,
      rows: rows.map(row => ({
        description: formData.get(`description_${row.id}`) as string,
        usdAmount: parseFloat(formData.get(`usd_${row.id}`) as string) || 0,
        pkrAmount: parseFloat(formData.get(`pkr_${row.id}`) as string) || 0,
        beneficiary: formData.get(`beneficiary_${row.id}`) as string
      })),
      totalUsd,
      totalPkr,
      amountInWords,
      attachments
    }

    try {
      await updatePettyCashRecordAndDetails(data)
      router.push('/dashboard/cash-main')
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Error saving form data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updatePettyCashRecordAndDetails = async (data: any) => {
    const {
      date,
      itemName,
      itemNumber,
      exchangeApproval,
      militaryAttacheName,
      receiverSignature,
      statement,
      totalUsd,
      totalPkr,
      amountInWords,
      rows,
      attachments,
    } = data;
  
    try {
      // Update main petty cash record
      const updatePettyCashQuery = `
        UPDATE petty_cash 
        SET date = ?, item_name = ?, item_number = ?, exchange_approval = ?, 
            military_attache_name = ?, statement=?,
            total_usd = ?, total_pkr = ?, amount_in_words = ?
        WHERE id = ?
      `;
      const updatePettyCashValues = [
        date,
        itemName,
        itemNumber,
        exchangeApproval,
        militaryAttacheName,
        statement,
        totalUsd,
        totalPkr,
        amountInWords,
        FormId,
      ];
      await window.electronAPI.dbQuery(updatePettyCashQuery, updatePettyCashValues);
  
      // Delete all rows associated with the petty_cash_id
      const deleteRowQuery = `
        DELETE FROM petty_cash_rows 
        WHERE petty_cash_id = ?
      `;
      await window.electronAPI.dbQuery(deleteRowQuery, [FormId]);
      // Insert updated rows
      const rowQueries = rows.map((row) => {
        const insertRowQuery = `
          INSERT INTO petty_cash_rows (id, petty_cash_id, description, usd_amount, pkr_amount, beneficiary) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const rowValues = [
          Math.floor(Math.random() * 1000000),
          FormId,
          row.description,
          row.usdAmount,
          row.pkrAmount,
          row.beneficiary,
        ];
        return window.electronAPI.dbQuery(insertRowQuery, rowValues);
      });
      await Promise.all(rowQueries);
      // Handle attachments
      for (const file of attachments) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `/uploads/Petty_cash/${fileName}`;
  
        // Save file to local filesystem using Electron
        await window.electronAPI.saveFile({
          path: filePath,
          content: await file.arrayBuffer(),
        });
  
        // Insert or update file reference in the database
        const upsertAttachmentQuery = `
          INSERT INTO petty_cash_attachments (id, petty_cash_id, file_name, file_path, file_type)
          VALUES (?, ?, ?, ?,?)
        `;
        await window.electronAPI.dbQuery(upsertAttachmentQuery, [
          Math.floor(Math.random() * 1000000),
          FormId,
          file.name,
          filePath,
          file.type,
        ]);
      }
      toast.success('Petty Cash Updated');
      console.log('Petty cash record and details updated successfully.');
    } catch (error) {
      console.error('Error updating petty cash record and details:', error);
      throw new Error('Failed to update petty cash record and details.');
    }
  };

  const removeFile= async (id: number)=>{
    const confirm = window.confirm(
      'Are you sure you want to delete this file?'
    );
    if (!confirm) return;

    const query = 'DELETE FROM petty_cash_attachments WHERE id = ?';
    await window.electronAPI.dbQuery(query, [id]);
    const updatedFiles = addedFiles.filter((file) => file.id !== id);
    setAddedFiles(updatedFiles);
    toast.success('File Deleted');
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log(reader.result);
        setRecieverSignature(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAccountImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAccountSign(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div
      className={cn(
        'flex w-full max-w-7xl flex-col font-taybah  bg-white',
        className
      )}
      dir='rtl'
      {...props}
    >
      <div className='shadow-none rounded-none '>
        <CardContent className='p-0'>
          <form onSubmit={FormId ? handleUpdate : handleSubmit} className='relative flex flex-col'>
            <TopHeader />

            <div className='grid grid-cols-3 gap-3 w-full pb-6'>
              <div className='cols-span-1'></div>
              <div className='col-span-1  flex items-center flex-col underline underline-offset-2 text-destructive justify-center text-center'>
                <h2 className='text-2xl font-bold ' dir='rtl'>
                  إذن صرف نثرية
                </h2>
                <h3 className='text-xl font-bold font-geist uppercase'>
                  PETTY CASH ORDER
                </h3>
              </div>
              <div className='col-span-1 flex items-center gap-2 justify-end'>
                <Label className='text-lg font-bold'>رقم إذن الصرف :</Label>
                <Label className='text-lg font-geist'>{autoNumber}</Label>
              </div>
            </div>

            <div className='grid grid-cols-2 border-b border-gray-400'>
              <div className='p-4 flex items-center gap-2'>
                <Label
                  htmlFor='itemName'
                  className='whitespace-nowrap font-bold text-lg'
                >
                  إسم البند :
                </Label>
                <select
                  id='itemName'
                  name='itemName'
                  className='w-full rounded-lg border border-gray-400 text-black p-2 text-lg font-bold'
                  value={selectedCategory?.name}
                  onChange={e => {
                    setSelectedCategory(
                      categories.find(
                        category => category.name === e.target.value
                      )
                    )
                  }}
                >
                  <option selected value="" disabled>
                  اختر الحساب
                 </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='p-4 flex items-center gap-2'>
                <Label
                  htmlFor='itemNumber'
                  className='whitespace-nowrap font-bold text-lg'
                >
                  رقم البند :
                </Label>

                <Label className='w-full rounded-lg  border border-gray-400 text-black p-2 min-h-11 text-lg font-bold'>
                  {selectedCategory?.id}
                </Label>
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

            <div
              className='grid grid-cols-12 w-full border border-t-0 border-t-transparent border-black divide-y divide-black'
            >
              <div className='col-span-4 border-l flex items-center gap-2 border-t border-black p-6 text-center'>
                <Label className='whitespace-nowrap font-medium text-xl'>
                  التاريخ :
                </Label>
                <Input
                  name='date'
                  type='date'
                  required
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                  className='border-gray-400 '
                />
              </div>
              <div className='col-span-2 border-l flex items-center flex-col w-full justify-center border-black text-center'>
                <div className='flex items-center justify-center w-full border-b border-black p-4'>
                  <Label className='font-medium text-xl'>المبلغ</Label>
                </div>
                <div className='flex items-center justify-between font-geist  w-full'>
                  <div className='border-l flex-1 border-black p-2 text-center'>
                    <Label>USD</Label>
                  </div>
                  <div className=' p-2 flex-1 text-center '>
                    <Label>PKR</Label>
                  </div>
                </div>
              </div>
              <div className='col-span-3  border-l flex items-center justify-center border-black p-2 text-center'>
                <Label className='text-xl font-medium'>
                  البيــــــــــــــــان
                </Label>
              </div>
              <div className='col-span-3  flex items-center justify-center  p-2 text-center'>
                <Label className='text-xl font-medium'>
                  إسم المدفوع له / المستفيد{' '}
                </Label>
              </div>
              <div
                className='col-span-4  border-l flex flex-col items-center justify-center h-full border-black p-2'
                style={{
                  gridRow: `span ${rows.length + 1}`
                }}
              >
                <div className='flex flex-col '>
                  <Label className=' block text-xl font-medium'>
                    يعتمد الصرف
                  </Label>
                  {/* <Input
                    name='exchangeApproval'
                    type='text'
                    dir='rtl'
                    value={exchangeRate}
                    onChange={e => setExchangeRate(parseFloat(e.target.value))}
                    className='w-48 !border-b-2 border-transparent rounded-none border-b-black  outline-none focus-visible:ring-0 focus-visible:border-b'
                  /> */}

                  <p className='text-xl mt-4 mb-1 font-medium'>
                    الملحق العسكري
                  </p>
                  <Input
                    name='militaryAttacheName'
                    type='text'
                    dir='rtl'
                    className=' !border-b-2 border-transparent rounded-none border-b-white  outline-none focus-visible:ring-0 focus-visible:border-b-black pr-0 !font-medium !text-xl'
                    defaultValue='العميد/ سالم حمد الشرقي المري'
                  />
                </div>
              </div>
              {rows.map((row, index) => (
                <>
                  <div
                    key={index + 0}
                    className='col-span-2 grid grid-cols-2 place-items-stretch border-l border-black'
                  >
                    <div className='col-span-1 border-l border-black '>
                      <Input
                        name={`usd_${row.id}`}
                        type='number'
                        dir='rtl'
                        step='0.01'
                        value={row.usdAmount}
                        onChange={e =>
                          handleInputChange(row.id, 'usdAmount', e.target.value)
                        }
                        className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                      /> 
                    </div>
                    <div className='col-span-1 relative '>
                      <Input
                        name={`pkr_${row.id}`}
                        type='number'
                        step='0.01'
                        dir='rtl'
                        value={row.pkrAmount}
                        onChange={e =>
                          handleInputChange(row.id, 'pkrAmount', e.target.value)
                        }
                        className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                      />
                    </div>
                  </div>
                  <div key={index + 1} className='col-span-3'>
                    <Input
                      name={`description_${row.id}`}
                      type='text'
                      dir='rtl'
                      value={row.description}
                      onChange={e =>
                        handleInputChange(row.id, 'description', e.target.value)
                      }
                      className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                    />
                  </div>
                  <div
                    key={index + 2}
                    className='col-span-3 border-r flex items-center gap-2 border-black  relative'
                  >
                    <Input
                      name={`beneficiary_${row.id}`}
                      type='text'
                      dir='rtl'
                      value={row.beneficiary}
                      onChange={e =>
                        handleInputChange(row.id, 'beneficiary', e.target.value)
                      }
                      className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                    />
                    {index > 0 && (
                      <Button
                        key={index + 3}
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    )}
                  </div>
                </>
              ))}

              <div className='col-span-2 grid grid-cols-2 border-l border-black   font-bold'>
                <Label className='whitespace-nowrap col-span-1  font-geist border-l  border-black text-xl w-full h-full grid place-items-center text-center'>
                  {totalUsd}
                </Label>
                <Label className='whitespace-nowrap col-span-1 w-full h-full grid place-items-center text-center  font-geist  text-xl'>
                  {totalPkr}
                </Label>
              </div>

              <div className='col-span-3   p-2 '>
                <Label className='font-medium text-xl'>
                  الإجمالـــــــــــــــــــــــــــي
                </Label>
              </div>
              <div className='col-span-3 border-r border-black text-left'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={addRow}
                >
                  <Plus className='h-4 w-4 text-destructive' />
                </Button>
              </div>
              <div className='col-span-12 px-4 py-2'>
                <Label className='text-xl font-medium'>
                  إستلمت مبلغ وقدرة :
                </Label>
                <Label className='text-xl font-medium font-geist capitalize'>
                  {amountInWords}
                </Label>
              </div>
            </div>

            {/* Signature Section */}
            <div className='grid grid-cols-1 gap-3 p-2 py-6 w-full'>
              <div className='grid grid-cols-2 place-items-end w-full  space-y-4'>
                <div className='w-full'>
                  <Label className=' block text-xl font-medium'>المحاسب</Label>
                  {!FormId ? (
                    <>
                      {accountantSign ? (
                        <img 
                          src={`${accountantSign}`} 
                          alt="Signature" 
                          className="w-20 mt-3 h-auto" 
                        />
                      ) : (
                        ''
                      )}
                      <div>
                        <Input
                          name="accountantName"
                          type="file"
                          multiple={false}
                          accept="image/*"
                          dir="rtl"
                          onChange={handleAccountImageChange}
                          className="w-48 !border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <img 
                        src={`${accountantSign}`} 
                        alt="Signature" 
                        className="w-20 mt-3 h-auto" 
                      />
                      <hr className="mt-3" style={{ width: '15%', color: 'black' }} />
                    </div>
                  )}                  
                </div>
                <div>
                  <Label className=' block text-xl font-medium'>
                    إمضاء المستلم
                  </Label>
                  {!FormId ? (
                    <div>
                        <div>
                          {receiverSignature?(
                            <img 
                              src={`${receiverSignature}`} 
                              alt="Signature" 
                              className="w-20 h-auto" 
                            />
                          ):(
                            ''
                          )}
                          <Input
                            name="receiverSignature"
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
                        src={`${receiverSignature}`} 
                        alt="Signature" 
                        className="w-20 h-auto" 
                      />
                      <hr className="mt-3" style={{ width: '100%',color:"black" }} />
                    </div>
                  )}
                </div>
              </div>
              <div className='mt-4'>
                <FileUpload onFilesChange={setAttachments} />

                {addedFiles.length > 0 && (
                <div className='space-y-2'>
                  {addedFiles.map((file, index) => (
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
                  {isSubmitting ? 'جاري الحفظ...' : FormId ? 'تحديث النموذج' : 'حفظ'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  )
}

export default PettyCashForm