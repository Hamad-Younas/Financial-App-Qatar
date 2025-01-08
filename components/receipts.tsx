'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import TopHeader from '@/components/ui/topHeader'
import { FileUpload } from '@/components/file-upload'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

interface ReceiptFormProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string
}

export default function ReceiptForm ({ className }: ReceiptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voucherno, setVoucherNumber]=useState(0);
  const [attachments, setAttachments] = useState<File[]>([])
  const [sign,setSign]=useState('');
  const [addedFiles,setAddedFiles]=useState([]);
  const [approvedBy,setApprovedBy]=useState('');
  const [statement,setStatement]=useState("");
  const [date,setDate]=useState();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const [banks,setBanks]=useState([]);
  const router = useRouter()
  const [formData, setFormData] = useState({
    serialNumber: '',
    date: '',
    recipientName: '',
    amountCurrency:'',
    paymentMethod:'',
    fromName: '',
    amountUsd: '',
    amountPkr: '',
    chequeNumber: '',
    accountDetails: '',
    against: '',
    approvedBy: '',
    signature: null as File | null
  })

  useEffect(()=>{
    document.body.style.overflowX="hidden";
    setDate(new Date().toISOString().split('T')[0]);

    const getLastVoucherId = async () => {
      const query = 'SELECT id FROM receipts ORDER BY id DESC LIMIT 1';
      const response = await window.electronAPI.dbQuery(query, []);
    
      if (response.length > 0) {
        setVoucherNumber(response[0].id); 
      } else {
        setVoucherNumber(1); 
      }
    };

    const getBanks = async () => {
      const query = 'SELECT * FROM banks';
      const response = await window.electronAPI.dbQuery(query, []);
    
      if (response.length > 0) {
        setBanks(response); 
      }
    };

    getBanks();
    getLastVoucherId();
  },[])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const query = `
        INSERT INTO receipts (
          serial_number, date, recipient_name, from_name, amount_usd, 
          amount_pkr, cheque_number, account_details, against, 
          approved_by, signature, currency, receiptype, statement
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?, ?)
      `

      let signaturePath = ''
      let approvedSign = ''
      if(formData.signature) {
        const fileName = `${Date.now()}-${formData.signature.name}`
        const filePath = `/uploads/Receipts/${fileName}`
        await window.electronAPI.saveFile({
          path: filePath,
          content: await formData.signature.arrayBuffer()
        })
        signaturePath = filePath
      }
      if(formData.approvedBy) {
        const fileName = `${Date.now()}-${formData.approvedBy.name}`
        const filePath = `/uploads//Receipts/${fileName}`
        await window.electronAPI.saveFile({
          path: filePath,
          content: await formData.approvedBy.arrayBuffer()
        })
        approvedSign = filePath

      }

      const values = [
        voucherno,
        formData.date || new Date().toISOString().split('T')[0],
        formData.recipientName,
        formData.fromName,
        formData.amountUsd,
        formData.amountPkr,
        formData.chequeNumber,
        formData.accountDetails,
        formData.against,
        approvedSign,
        signaturePath,
        formData.amountCurrency,
        formData.paymentMethod,
        statement
      ];      

      const receiptResult = await window.electronAPI.dbQuery(query, values)
      if (receiptResult.success && receiptResult.insertId) {
        const receiptId = receiptResult.insertId
        for (const file of attachments) {
          const fileName = `${Date.now()}-${file.name}`
          const filePath = `/uploads/Signatures/${fileName}`

          // Save file to local filesystem using electron
          await window.electronAPI.saveFile({
            path: filePath,
            content: await file.arrayBuffer()
          })

          // Save file reference in database
          await window.electronAPI.dbQuery(
            `INSERT INTO receipt_attachments (receipt_id, file_name, file_path, file_type)
             VALUES (?, ?, ?, ?)`,
            [receiptId, file.name, filePath, file.type]
          )
        }

        toast.success('Receipt saved successfully!');
        router.push('/dashboard/receipts-main')

        // Reset form
        setFormData({
          serialNumber: '',
          date: '',
          recipientName: '',
          fromName: '',
          amountUsd: '',
          amountPkr: '',
          chequeNumber: '',
          accountDetails: '',
          against: '',
          approvedBy: '',
          signature: ''
        })
      }
    } catch (error) {
      console.error('Error saving receipt:', error)
      alert('Error saving receipt')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const query = `
        UPDATE receipts 
        SET 
          serial_number = ?, 
          date = ?, 
          recipient_name = ?, 
          from_name = ?, 
          amount_usd = ?, 
          amount_pkr = ?, 
          account_details = ?, 
          against = ?, 
          currency=?,
          receiptype=?,
          statement=?
        WHERE id = ?
      `;
  
      const values = [
        voucherno,
        formData.date,
        formData.recipientName,
        formData.fromName,
        formData.amountUsd,
        formData.amountPkr,
        formData.accountDetails,
        formData.against,
        formData.amountCurrency,
        formData.paymentMethod,
        statement,
        editId
      ];
  
      const updateResult = await window.electronAPI.dbQuery(query, values);
      console.log(updateResult);
  
      if (updateResult.success) {
        for (const file of attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `/uploads/Signatures/${fileName}`;
  
          // Save file to local filesystem using Electron
          await window.electronAPI.saveFile({
            path: filePath,
            content: await file.arrayBuffer(),
          });
  
          // Save file reference in database
          await window.electronAPI.dbQuery(
            `INSERT INTO receipt_attachments (receipt_id, file_name, file_path, file_type)
             VALUES (?, ?, ?, ?)`,
            [editId, file.name, filePath, file.type]
          );
        }
  
        toast.success('Receipt updated successfully!');
        router.push('/dashboard/receipts-main');
        setFormData({
          serialNumber: '',
          date: '',
          recipientName: '',
          fromName: '',
          amountUsd: '',
          amountPkr: '',
          chequeNumber: '',
          accountDetails: '',
          against: '',
          approvedBy: '',
          amountCurrency:'',
          paymentMethod:'',
          signature: null,
        });
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      alert('Error updating receipt');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSign(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprovedSign = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setApprovedBy(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const getPaymentDetails = async () => {
      if (!editId) return; // Check if voucherId is available
  
      try {
        const voucherQuery = `SELECT * FROM receipts WHERE id = ? LIMIT 1`;
        const voucherResponse = await window.electronAPI.dbQuery(voucherQuery, [editId]);
        console.log("response",voucherResponse);

        if (voucherResponse && voucherResponse[0]) {
          setFormData((prevData) => ({
            ...prevData,
            date: voucherResponse[0].date || '',
            recipientName: voucherResponse[0].recipient_name || '',
            fromName: voucherResponse[0].from_name || '',
            amountUsd: voucherResponse[0].amount_usd || '',
            amountPkr: voucherResponse[0].amount_pkr || '',
            chequeNumber: voucherResponse[0].cheque_number || '',
            accountDetails: voucherResponse[0].account_details || '',
            against: voucherResponse[0].against || '',
            paymentMethod:voucherResponse[0].receiptype || '',
            amountCurrency:voucherResponse[0].currency || '',
          }));
          setStatement(voucherResponse[0].statement);
          setApprovedBy(voucherResponse[0].approved_by);
          setSign(voucherResponse[0].signature);
          setVoucherNumber(parseInt(editId) || 0); 
        }

        const attachmentsQuery = `SELECT * FROM receipt_attachments WHERE receipt_id = ?`;
        const attachmentsResponse = await window.electronAPI.dbQuery(attachmentsQuery, [editId]);
        console.log('dff',attachmentsResponse);
        setAddedFiles(attachmentsResponse);
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    };

    getPaymentDetails();
  }, [editId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-calculate PKR when USD changes
    if (name === 'amountUsd') {
      const pkr = (parseFloat(value) * 278).toFixed(2)
      setFormData(prev => ({ ...prev, amountPkr: pkr }))
    }
  }

  const removeFile= async (id: number)=>{
    const confirm = window.confirm(
      'Are you sure you want to delete this file?'
    );
    if (!confirm) return;

    const query = 'DELETE FROM receipt_attachments WHERE id = ?';
    await window.electronAPI.dbQuery(query, [id]);
    const updatedFiles = addedFiles.filter((file) => file.id !== id);
    setAddedFiles(updatedFiles);
    toast.success('File Deleted');
}

  return (
    <div className='max-w-7xl mx-auto bg-white p-8' dir='rtl'>
      <TopHeader />

      <div className='flex flex-col gap-10 w-full  items-end mb-8'>
        <div className='flex items-center gap-2'>
          <Label className='text-xl font-bold'>رقم:</Label>
          <div className='border-b-2 border-black w-32'>{voucherno}</div>
        </div>
        <div className='flex items-center gap-2'>
          <Label className='text-xl font-bold'>التاريخ:</Label>
          <Input
            name="date"
            type="date"
            className="!border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
            value={date || new Date().toISOString().split('T')[0]} 
            dir="rtl"
            onChange={e => setDate(e.target.value)}
          />        
        </div>
        <div className='flex items-center gap-2'>
          <Label className='text-xl font-bold'>بيان:</Label>
          <Input
            name="statement"
            type="text"
            className="!border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
            value={statement}
            onChange={(e)=>setStatement(e.target.value)} 
            dir="rtl"
          />        
        </div>
      </div>

      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold border-b-2 border-black inline-block pb-1 font-[Arial]'>
          وصل إســـــتــــــــــــلام{' '}
        </h2>
        <h3 className='text-xl mt-2 font-bold'>Receipt of Payment</h3>
      </div>

      <form onSubmit={editId ? handleUpdate : handleSubmit} className='space-y-6' dir='ltr'>
        <div className='space-y-4 '>
          <p className=' whitespace-pre-line break-words h-full flex flex-wrap items-end gap-3 text-justify '>
            <span>I, </span>
            <span className='mb-1'>
              <Input
                name='recipientName'
                value={formData.recipientName}
                onChange={handleChange}
                className='border-b-2 border-t-0 border-x-0 rounded-none  focus:ring-0'
                required
              />
            </span>
            <span>,from</span>
            <span className='mb-1'>
              <Input
                name='fromName'
                value={formData.fromName}
                onChange={handleChange}
                className='border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0'
                required
              />
            </span>
            <span>acknowledge the receipt of payment</span>
            <span className="mb-1">
              <select
                name="amountCurrency"
                value={formData.amountCurrency}
                onChange={handleChange}
                className="border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0"
                required
              >
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
              </select>
            </span>
            <span>(USDollar/pak rupees</span>
            <span className='mb-1'>
              <Input
                name='amountPkr'
                type='number'
                step='0.01'
                value={formData.amountPkr}
                onChange={handleChange}
                className='border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0'
                required
              />
            </span>
            <span>)</span>

            <span>on date</span>
            <span className='mb-1'>
              <Input
                name='date'
                type='date'
                value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className='border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0'
                required
              />
            </span>
            <span>through Cash / Cheque No</span>
            <span className="mb-1">
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0"
              required
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </span>
            <span>with thanks, on account of</span>
            <span className='mb-1'>
              <Input
                name='accountDetails'
                value={formData.accountDetails}
                onChange={handleChange}
                className='border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0'
                required
              />
            </span>

            <span>against</span>
            <span className='mb-1'>
              <select
                name="against"
                className="!border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                value={formData.against || ""}
                dir="rtl"
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    against: e.target.value, 
                  }));
                }}
              >
                <option value="" disabled>
                  اختر الحساب
                </option>
                {banks.map((bank, index) => (
                  <option key={index} className="font-bold" value={bank.bank_name}>
                    {bank.bank_name}
                  </option>
                ))}
              </select>
            </span>
          </p>
        </div>

        <div className='grid grid-cols-2 gap-16 pt-24'>
          <div>
          {!editId ? (
            <div className="flex flex-col items-center">
              {
                approvedBy?(
                  <img 
                    src={`${approvedBy}`} 
                    alt="Signature" 
                    className="w-20 mt-3 h-auto" 
                  />
                ):(
                  ''
                )
              }
              <Input
                name="approvedBy"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData((prev) => ({ ...prev, approvedBy: file }));
              
                  if (handleApprovedSign
                    
                  ) {
                    handleApprovedSign(e);
                  }
                }}
                className="border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0"
                required
              />            
              <p className="text-center mb-2">Approved By</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img 
                src={`${approvedBy}`} 
                alt="Signature" 
                className="w-20 mt-3 h-auto" 
              />
              <hr className="mt-5" style={{ width: '22%' }} />
              <p className="text-center mb-2">Approved By</p>
            </div>
          )}
          </div>
          <div>
            {!editId ? (
              <div className="flex flex-col items-center">
                {
                  sign?(
                    <img 
                      src={`${sign}`} 
                      alt="Signature" 
                      className="w-20 mt-3 h-auto" 
                    />
                  ):(
                    ''
                  )
                }
                <Input
                  name="signature"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData((prev) => ({ ...prev, signature: file }));
                
                    if (handleImageChange) {
                      handleImageChange(e);
                    }
                  }}
                  className="border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0"
                  required
                />            
                <p className="text-center mb-2">Signature</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <img 
                  src={`${sign}`} 
                  alt="Signature" 
                  className="w-20 mt-3 h-auto" 
                />
                <hr className="mt-5" style={{ width: '22%' }} />
                <p className="text-center mb-2">Signature</p>
              </div>
            )}
          </div>
        </div>

        <hr className="my-4" style={{border: "2px solid black", width: "80%", marginLeft: "auto", marginRight: "auto"}} />
        <hr className="my-4" style={{border: "2px solid black", width: "80%", marginLeft: "auto", marginRight: "auto", marginTop:"-10px"}} />

        <hr className="my-4" style={{border: "2px solid black", width: "50%", marginLeft: "auto", marginRight: "auto"}} />
        <hr className="my-4" style={{border: "2px solid black", width: "50%", marginLeft: "auto", marginRight: "auto", marginTop:"-10px"}} />

        <div className='text-center flex flex-col w-full pt-12'>
          <p className='text-xl font-bold w-full text-right'>المحاسب</p>
          <p className='text-xl font-bold mt-4 w-full text-left ml-52'>
            الملحق العسكري
          </p>
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
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ المستند'}
            </Button>
          </div>
        </div>
      </form>
      <div className='mt-4 self-end'>
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
  )
}
