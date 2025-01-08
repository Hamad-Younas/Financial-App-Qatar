'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { convertToWords } from './numberToWords'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation"
import Image from 'next/image'

interface RowData {
  id: number
  invoiceNo: string
  description: string
  usd: string
  pkr: string
}

export function SummaryForm ({
  className
}: React.ComponentPropsWithoutRef<'div'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [category1,setCategory1]=useState(0);
  const [category2,setCategory2]=useState(0);
  const [category3,setCategory3]=useState(0);
  const [date,setDate]=useState();

  const [remaining1,setRemaining1]=useState(0);
  const [remaining2,setRemaining2]=useState(0);
  const [remaining3,setRemaining3]=useState(0);

  const [serial,setSerial]=useState(0);

  const [yearBudget,setYearBudget]=useState(0);
  const [yearGift,setYearGift]=useState(0);

  const [text1,setText1]=useState('');
  const [text2,setText2]=useState('');
  const [text3,setText3]=useState('');
  const [text4,setText4]=useState('');

  const [PrimUSD, setPrimUSD]=useState(0);
  const [PrimPKR, setPrimPKR]=useState(0);
  const [SecUSD, setSecUSD]=useState(0);
  const [SecPKR, setSecPKR]=useState(0);
  const [month,setMonth]=useState('');
  const [safe,setSafe]=useState(0);
  const [mustaazSum, setMustaazSum]=useState(0);
  const [reimusableSum, setReimusableSum]=useState(0);
  const [vouchers,setVouchers]=useState([]);
  const [sign1,setSign1]=useState('');
  const [sign2,setSign2]=useState('');
  const [sign3,setSign3]=useState('');

  const [banks,setBanks]=useState([]);
  const searchParams = useSearchParams();
  const editId = searchParams.get('id')

  const getAllLookups = async () => {
    const query = 'SELECT categories.id AS category_name, SUM(account_types.amount) AS total_budget FROM account_types LEFT JOIN categories ON account_types.category_id = categories.id GROUP BY account_types.category_id, categories.name';
    const response = await window.electronAPI.dbQuery(query, []);
    return response;
  };

  const getAccountTypes = async () => {
    const query = 'SELECT * FROM account_types';
    const response = await window.electronAPI.dbQuery(query, []);
    return response;
  };
  
  useEffect(() => {
    const monthsInArabic = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    
    const currentDate = new Date();
    const currentMonthArabic = monthsInArabic[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    
    const formattedDate = `${currentMonthArabic} ${currentYear}`;
    setMonth(formattedDate);
    getSafeMoney();
    getMonthlyMustaz();
    getReimusableSUM();
    getVouchers();
    getAllLookups()
    .then(response => {
      response.forEach(item => {
        if (item.category_name === 1) {
          setCategory1(item.total_budget);
        }
        if (item.category_name === 2) {
          setCategory2(item.total_budget || 0);
        }
        if (item.category_name === 3) {
          setCategory3(item.total_budget || 0);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching account types:', error);
    });
    getOnlineVouchersSUM();
    getSerialNo();
    getYearBudget();
    fetchBanks();
    getAccountTypes()
    .then(accountTypes => {
      let sumCategory1 = 0;
      let sumCategory2 = 0;
      let sumCategory3 = 0;
  
      getBudgetsFromReport()
        .then(budgets => {
          console.log(budgets);
          budgets.forEach(budget => {
            const account = accountTypes.find(
              accountType => accountType.name === budget.budget_item_name
            );
  
            if (account) {
              switch (account.category_id) {
                case 1:
                  sumCategory1 += budget.remaining_budget_usd;
                  break;
                case 2:
                  sumCategory2 += budget.remaining_budget_usd;
                  break;
                case 3:
                  sumCategory3 += budget.remaining_budget_usd;
                  break;
                default:
                  break;
              }
            }
          });
          setRemaining1(sumCategory1);
          setRemaining2(sumCategory2);
          setRemaining3(sumCategory3);
        })
        .catch(error => {
          console.error("Error fetching budgets:", error);
        });
    })
    .catch(error => {
      console.error("Error fetching account types:", error);
    });  

    if(editId){
      
      getPaymentDetails();
    }
  }, []);

  const getPaymentDetails = async () => {
    const voucherQuery = `SELECT * FROM Summaries WHERE serialno = ? LIMIT 1`;
    const voucherResponse = await window.electronAPI.dbQuery(voucherQuery, [editId]);
    console.log(voucherResponse)
    setSign1(voucherResponse[0].Sign1);
    setSign2(voucherResponse[0].Sign2);
    setSign3(voucherResponse[0].Sign3);
    setText1(voucherResponse[0].text1);
    setText2(voucherResponse[0].text2);
    setText3(voucherResponse[0].text3);
    setText4(voucherResponse[0].text4);
    setDate(voucherResponse[0].date);
    setYearBudget(voucherResponse[0].budget);
    setYearBudget(voucherResponse[0].gift);
    setPrimUSD(voucherResponse[0].primUSD);
    setPrimPKR(voucherResponse[0].primPKR);
    setSecUSD(voucherResponse[0].secUSD);
    setSecPKR(voucherResponse[0].secPKR);
    setMustaazSum(voucherResponse[0].monthlyExpense);
    setReimusableSum(voucherResponse[0].ReimburseMoney);
    setSerial(voucherResponse[0].serialno);
  }

  useEffect(()=>{
    const getPaymentDetails = async () => {
      const voucherQuery = `SELECT * FROM Summaries WHERE id = ? LIMIT 1`;
      const voucherResponse = await window.electronAPI.dbQuery(voucherQuery, [editId]);
      setSign1(voucherResponse[0].sign1);
      setSign2(voucherResponse[0].sign2);
      setSign3(voucherResponse[0].sign3);
      setText1(voucherResponse[0].text1);
      setText2(voucherResponse[0].text2);
      setText3(voucherResponse[0].text3);
      setText4(voucherResponse[0].text4);
      setDate(voucherResponse[0].date);
      setYearBudget(voucherResponse[0].budget);
      setYearBudget(voucherResponse[0].gift);
      setPrimUSD(voucherResponse[0].primUSD);
      setPrimPKR(voucherResponse[0].primPKR);
      setSecUSD(voucherResponse[0].secUSD);
      setSecPKR(voucherResponse[0].secPKR);
      setMustaazSum(voucherResponse[0].monthlyExpense);
      setReimusableSum(voucherResponse[0].ReimburseMoney);
      setSerial(voucherResponse[0].serialno);
    }
    getPaymentDetails();
  },[editId])

  const getSerialNo = async () => {
    const query = 'SELECT serialno FROM summaries ORDER BY serialno DESC LIMIT 1';
    
    try {
      const response = await window.electronAPI.dbQuery(query, []);

      if (response.length > 0) {
        setSerial(response[0].serialno+1);  
      } else {
        setSerial(1);  
      }
    } catch (error) {
      console.error('Error fetching last petty_cash id:', error);
    }
  };


  const getBudgetsFromReport= async ()=>{
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
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const formattedStartDate = startOfMonth.toISOString().split("T")[0];
      const formattedEndDate = endOfMonth.toISOString().split("T")[0];

      const response = await window.electronAPI.dbQuery(query, [
        formattedStartDate,
        formattedEndDate,
      ]);
      return response;
  }

  const getYearBudget= async ()=>{
    const currentYear = new Date().getFullYear();
    const query = `SELECT * FROM yearlybudget WHERE year = ?`;
    const response = await window.electronAPI.dbQuery(query, [currentYear]);
    setYearBudget(response[0].budget);
    setYearGift(response[0].gift);
  }

  const getOnlineVouchersSUM= async ()=>{
    const query = `
      SELECT 
          SUM(CASE WHEN b.type = 'أولي' AND b.currency = 'USD' THEN pv.total_usd ELSE 0 END) AS USD_SUM,
          SUM(CASE WHEN b.type = 'أولي' AND b.currency = 'PKR' THEN pv.total_pkr ELSE 0 END) AS PKR_Total,
          SUM(CASE WHEN b.type = 'ثانوي' AND b.currency = 'USD' THEN pv.total_usd ELSE 0 END) AS Sec_USD,
          SUM(CASE WHEN b.type = 'ثانوي' AND b.currency = 'PKR' THEN pv.total_pkr ELSE 0 END) AS Sec_PKR
      FROM 
          payment_vouchers pv
      JOIN 
          banks b ON pv.bank_account = b.bank_name
      WHERE 
          strftime('%Y', pv.date) = strftime('%Y', 'now')
          AND strftime('%m', pv.date) = strftime('%m', 'now')
    `;
    const response = await window.electronAPI.dbQuery(query, []);
    setPrimUSD(response[0].USD_SUM.toFixed(2));
    setPrimPKR(response[0].PKR_Total.toFixed(2));
    setSecUSD(response[0].Sec_USD.toFixed(2));
    setSecPKR(response[0].Sec_PKR.toFixed(2));
  }

  const getMonthlyMustaz= async ()=>{
    const query = `
      SELECT 
          SUM(total_usd) AS USD_SUM
      FROM 
          payment_vouchers pv
      WHERE 
          is_mustaaz=1
          AND strftime('%Y', pv.date) = strftime('%Y', 'now')
          AND strftime('%m', pv.date) = strftime('%m', 'now')
    `;
    const response = await window.electronAPI.dbQuery(query, []);
    console.log(response)
    setMustaazSum(response[0].USD_SUM.toFixed(2));
  }

  const getReimusableSUM= async ()=>{
    const query = `
      SELECT 
          SUM(total_usd) AS USD_SUM
      FROM 
          payment_vouchers pv
      WHERE 
          IsReimbursable=1
          AND strftime('%Y', pv.date) = strftime('%Y', 'now')
          AND strftime('%m', pv.date) = strftime('%m', 'now')
    `;
    const response = await window.electronAPI.dbQuery(query, []);
    setReimusableSum(response[0].USD_SUM.toFixed(2));
  }

  const getSafeMoney= async ()=>{
    const query = `
      SELECT 
          SUM(total_usd) AS total_usd_sum
      FROM 
          petty_cash
      WHERE 
          item_name = 'خزنة'
          AND strftime('%Y', date) = strftime('%Y', 'now')
          AND strftime('%m', date) = strftime('%m', 'now')
    `;
    const response = await window.electronAPI.dbQuery(query, []);
    setSafe(response[0].total_usd_sum.toFixed(2));
  }

  const getVouchers= async ()=>{
    const query = `
      SELECT 
          *
      FROM 
          payment_vouchers
      WHERE 
          is_mustaaz=1 AND IsReimbursable=0
          AND strftime('%Y', date) = strftime('%Y', 'now')
          AND strftime('%m', date) = strftime('%m', 'now')
    `;
    const response = await window.electronAPI.dbQuery(query, []);
    console.log(response);
    setVouchers(response);
  }

  const fetchBanks = async () => {
    try {
      const query = 'SELECT * FROM banks'
      const result = await window.electronAPI.dbQuery(query, [])
      console.log(result);
      setBanks(result)
    } catch (error) {
      console.error('Error fetching banks:', error)
      toast.error('Failed to fetch banks')
    }
  } 

  function printSection() {
    var printContent = document.getElementById("printsection").innerHTML;
  
    var hiddenElement = document.getElementById("printHidden");
  
    if (hiddenElement) {
      hiddenElement.style.display = 'block'; 
    }

    var hiddenContent = hiddenElement ? hiddenElement.innerHTML : ""; 
  
    var originalContent = document.body.innerHTML;
    var originalDirection = document.body.style.direction;
  
    document.body.innerHTML = printContent + hiddenContent; 
  
    document.body.style.direction = 'rtl';
  
    window.print();
  
    document.body.innerHTML = originalContent;
    document.body.style.direction = originalDirection;
  
    if (hiddenElement) {
      hiddenElement.style.display = 'none';
    }
  
    window.location.reload(); 
  }  

  const handleSign1 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSign1(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSign2 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSign2(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSign3 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSign3(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = {
      budget: yearBudget,
      gift: yearGift,
      primUSD: PrimUSD,
      secUSD: SecUSD,
      primPKR: PrimPKR,
      secPKR: SecPKR,
      text1: text1,
      text2: text2,
      text3: text3,
      text4: text4,
      safemoney: safe,
      monthlyexpense: mustaazSum,
      reimurse: reimusableSum,
    }
    let Fsign1=formData.get('sign1');
    let Fsign2=formData.get('sign2');
    let Fsign3=formData.get('sign3');

    try {
      let Isign1 = '';
      let Isign2 = '';
      let Isign3 = '';

      if (Fsign1) {
        const fileName = `${Date.now()}-${Fsign1.name}`;
        const filePath = `/uploads/Signatures/${fileName}`;
        await window.electronAPI.saveFile({
          path: filePath,
          content: await Fsign1.arrayBuffer()
        });
        Isign1 = filePath;
      }

      if (Fsign2) {
        const fileName = `${Date.now()}-${Fsign2.name}`;
        const filePath = `/uploads/Signatures/${fileName}`;
        
        await window.electronAPI.saveFile({
          path: filePath,
          content: await Fsign2.arrayBuffer()
        });

        Isign2 = filePath;
      }

      if (Fsign3) {
        const fileName = `${Date.now()}-${Fsign3.name}`;
        const filePath = `/uploads/Signatures/${fileName}`;
        
        await window.electronAPI.saveFile({
          path: filePath,
          content: await Fsign3.arrayBuffer()
        });

        Isign3 = filePath;
      }

      console.log(Isign3,Isign2,Isign1)
      const summariesQuery = `
        INSERT INTO Summaries (
          serialno, month, date, budget, gift, primUSD, primPKR, secUSD, secPKR,
          text1, text2, text3, text4, safeMoney, monthlyExpense, ReimburseMoney,
          Sign1, Sign2, Sign3
        ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const summariesValues = [
        serial,
        month,                
        date || new Date().toISOString().split('T')[0],             
        data.budget,          
        data.gift,            
        data.primUSD,         
        data.primPKR,         
        data.secUSD,          
        data.secPKR,          
        data.text1,           
        data.text2,          
        data.text3,           
        data.text4,           
        data.safemoney,      
        data.monthlyexpense,  
        data.reimurse,       
        Isign1,      
        Isign2,        
        Isign3  
      ];

      // Execute the database query using the Electron API to insert the values into the table
      const summariesResult = await window.electronAPI.dbQuery(
        summariesQuery,
        summariesValues
      );
      printSection();
      router.push('/dashboard/summary-main')
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Error saving form data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    const formData = new FormData(e.currentTarget)
    const data = {
      budget: yearBudget,
      gift: yearGift,
      primUSD: PrimUSD,
      secUSD: SecUSD,
      primPKR: PrimPKR,
      secPKR: SecPKR,
      text1: text1,
      text2: text2,
      text3: text3,
      text4: text4,
      safemoney: safe,
      monthlyexpense: mustaazSum,
      reimurse: reimusableSum,
    }
  
    try {
      const summariesQuery = `
        UPDATE Summaries 
        SET 
          month = ?, 
          date = ?, 
          budget = ?, 
          gift = ?, 
          primUSD = ?, 
          primPKR = ?, 
          secUSD = ?, 
          secPKR = ?, 
          text1 = ?, 
          text2 = ?, 
          text3 = ?, 
          text4 = ?, 
          safeMoney = ?, 
          monthlyExpense = ?, 
          ReimburseMoney = ?
        WHERE id = ?;
      `
  
      const summariesValues = [
        month,                
        date || new Date().toISOString().split('T')[0],             
        data.budget,          
        data.gift,            
        data.primUSD,         
        data.primPKR,         
        data.secUSD,          
        data.secPKR,          
        data.text1,           
        data.text2,          
        data.text3,           
        data.text4,           
        data.safemoney,      
        data.monthlyexpense,  
        data.reimurse,               
        editId 
      ]
  
      // Execute the update query using the Electron API to update the record
      const summariesResult = await window.electronAPI.dbQuery(
        summariesQuery,
        summariesValues
      )
      printSection();
      toast.success("Summary Updated");
      router.push('/dashboard/summary-main')
    } catch (error) {
      console.error('Form update error:', error)
      alert('Error updating form data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }  

  return (
    <div
      className={cn(
        'flex w-full max-w-7xl flex-col font-taybah  bg-white',
        className
      )}
      dir='rtl'
    >
    <form onSubmit={editId ? handleUpdate : handleSubmit}>
     <div id="printsection" style={{marginTop:"50px"}}>
         <div className='grid grid-cols-3 place-items-center'>
          <div className='col-span-1 text-center space-y-1'>
            <p className='text-3xl'>سفــارة دولــة قطــر</p>
            <p className='text-3xl  text-red-600'>باكستان (إسلام اباد)</p>
            <p className='text-3xl'>الملحقيــة العسكــرية</p>
          </div>
    
          <div className='col-span-1 flex flex-col items-center justify-center'>
            <Image
              src='/logo.png'
              alt='State of Qatar'
              width={450}
              height={450}
              className='object-contain mb-2 mt-5'
            />
          </div>
          <div className='col-span-1 flex flex-col items-center justify-center'>
            <Label className='text-lg text-center font-geist font-bold'>
              Embassy Of State of Qatar <br />
              Military Attache <br /> Islamabad
            </Label>
          </div>
        </div>

        <div className='text-center mb-12 mt-10' style={{paddingBottom:"20px"}}>
          <h1 className='text-2xl font-bold '>تقرير الإغلاق الشهري</h1>
          <h2 className='text-xl font-bold font-geist uppercase'>
          إغلاق مصروفات المحليات عن شهر {month}
          </h2>
        </div>

        <div className='grid grid-cols-2 gap-16'>
          <div className='flex items-center gap-2  justify-start w-full font-bold font-geist p-4'>
            <Label className='font-bold text-lg'>أولاً: بيانات الموازنة المالية لعام {month}</Label>
          </div>
          <div className='w-full flex flex-col items-end'>
            <div className='flex items-center gap-2 justify-end w-full max-w-sm font-bold font-geist p-4'>
              <Label className='font-bold text-lg'>مسلسل رقم</Label>
              <Input
                name='serialNo'
                className='w-48 !border-b-2 text-center border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b'
                value={serial}
                readOnly
              />
              <Label>Serial No</Label>
            </div>
            <div className='flex items-center gap-2 justify-end w-full max-w-sm font-bold font-geist p-4 -mt-3'>
              <Label className='font-bold text-lg'>التاريخ</Label>
              <Input
                type='date'
                name='date'
                className='w-48 !border-b-2 text-center border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b'
                value={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setDate(e.target.value)} 
              />
              <Label>Date</Label>
            </div>
          </div>
        </div>
              
        <div className='border-t border-l border-r  border-black'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-black'>
                <th className='border-l border-black p-2 w-3/6'>
                  البيــــــــــــــــان
                </th>
                <th className='border-l border-black p-2'>
                  الميزانية المخططة  
                  <br />
                  <hr className='border-black my-1 w-full' />
                  <span className='font-geist'>(دولار أمريكي)</span>
                </th>
                <th className='border-l border-black p-2'>
                  المصروفات الفعلية 
                  <hr className='border-black my-1 w-full' />
                  <span className='font-geist'>(دولار أمريكي)</span>
                </th>
                <th className='p-2'>
                  الرصيد 
                  <br />
                  <hr className='border-black my-1 w-full' />
                  <span className='font-geist'>(دولار أمريكي)</span>
                </th>
              </tr>
            </thead>
              <tbody>
                <tr className='border-b border-black'>
                  <td className='border-l border-black p-2'>
                  الباب الأول - الرواتب والأجور
                  </td>
                  <td className='border-l border-black p-2 w-1/6 relative'>
                    {category1}
                  </td>
                  <td className='border-l border-black p-2 w-1/6 relative'>
                    {(category1-remaining1).toFixed(2)}
                  </td>
                  <td className='p-2 w-1/6 relative'>
                    {remaining1}
                  </td>
                </tr>
                <tr className='border-b border-black'>
                  <td className='border-l border-black p-2'>
                  الباب الثاني - المصروفات الجارية
                  </td>
                  <td className='border-l border-black p-2 w-1/6 relative'>
                    {category2}
                  </td>
                  <td className='border-l border-black p-2 w-1/6 relative'>
                    {(category2-remaining2).toFixed(2)}
                  </td>
                  <td className='p-2 w-1/6 relative'>
                    {remaining2}
                  </td>
                </tr>
                <tr className='border-b border-black'>
                  <td className='border-l border-black p-2'>
                  الباب الثالث - المصروفات الرأسمالية
                  </td>
                  <td className='border-l border-black p-2 w-1/6 relative'>
                    {category3}
                  </td>
                  <td className='border-l border-black p-2 w-1/6 relative'>
                   {(category3-remaining3).toFixed(2)}
                  </td>
                  <td className='p-2 w-1/6 relative'>
                    {remaining3}
                  </td>
                </tr>
                <tr className='border-b border-black'>
                  <td colSpan={1} className='border-l border-black p-2'>
                      الإجمالـــــــــــــــــــــــــــي
                  </td>
                  <td className='border-l border-black p-2 font-bold text-right relative font-geist w-1/6'>
                    <span className='absolute top-1/2 -translate-y-1/2 left-2 font-bold'>
                      $
                    </span>
                    {(category1+category2+category3)?.toFixed(2)}
                  </td>
                  <td className='border-l border-black p-2 font-bold text-right relative font-geist w-1/6'>
                    <span className='absolute top-1/2 -translate-y-1/2 left-2 font-bold'>
                      $
                    </span>
                    {((category1-remaining1)+(category2-remaining2)+(category3-remaining3))?.toFixed(2)}
                  </td>
                  <td className='p-2 font-bold text-right relative font-geist w-1/6'>
                    <span className='absolute top-1/2 -translate-y-1/2 left-2 text-xs font-bold'>
                      $
                    </span>
                    {(remaining1+remaining2+remaining3)?.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>


          <div className='grid grid-cols-2 gap-16 mt-40' id="secondpart">
            <div className='flex items-center gap-2  justify-start w-full font-bold font-geist p-4'>
              <Label className='font-bold text-lg'>ثانياً: تسوية سلفة الملحقية العسكرية</Label>
            </div>
          </div>
                
          <div className='border-t border-l border-r  border-black '>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-black'>
                  <th className='border-l border-black p-2 w-2/6'>
                    البيــــــــــــــــان
                  </th>
                  <th className='border-l border-black p-2'>
                   جزئي 
                  </th>
                  <th className='border-l border-black p-2'>
                  كل 
                  </th>
                  <th className='p-2 w-2/6'>
                    املاحظات 
                  </th>
                </tr>
              </thead>
                <tbody> 
                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2 text-center">
                      سلفة الملحقية 
                      </td>
                    
                      <td className="border-l border-black p-2 text-center">

                      </td>
                    
                      <td className="border-l border-black p-2 text-center">
                        <Input
                          name={'total'}
                          type='number'
                          dir='rtl'
                          step='0.01'
                          value={yearBudget}
                          onChange={e =>
                            setYearBudget(e.target.value)
                          }
                          className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                        /> 
                      </td>
                    
                      <td className="p-2 text-center" rowSpan={2}>
                      سلفة تم إيداعها من مدرية المالية 	
                      </td>
                    </tr>
                    
                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2 text-center">
                      إيردات وفرق العملة  
                      </td>

                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                    
                      <td className="border-l border-black p-2 text-center">
                        <Input
                          name={'budget'}
                          type='number'
                          dir='rtl'
                          step='0.01'
                          value={yearGift}
                          onChange={e =>
                            setYearGift(e.target.value)
                          }
                          className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                        /> 
                      </td>
                  </tr>

                  <tr className="border-b border-black h-8">
                    <td className="border-l border-black p-2 text-center"></td>
                    <td className="border-l border-black p-2 text-center"></td>
                    <td className="border-l border-black p-2 text-center"></td>
                    <td className="border-l border-black p-2 text-center"></td>
                  </tr>


                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2 text-center">
                        {banks.map((bank, item) => {
                          return bank.type === "أولي" ? (
                            <span key={item}>{bank.bank_name}</span>
                          ) : null;
                        })}                      
                      </td>
                    
                      <td className="border-l border-black p-2 text-center" rowSpan={1}>
                        <Input
                          name={'primUSD'}
                          type='number'
                          dir='rtl'
                          step='0.01'
                          value={PrimUSD}
                          onChange={e =>
                            setPrimUSD(e.target.value)
                          }
                          className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                        /> 
                        <hr className='border-black my-1 w-full' />
                          <Input
                            name={'primPKR'}
                            type='number'
                            dir='rtl'
                            step='0.01'
                            value={PrimPKR}
                            onChange={e =>
                              setPrimPKR(e.target.value)
                            }
                            className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                          /> 
                      </td>
                    
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                    
                      <td className="p-2 text-center" rowSpan={2}>
                        <Input
                          name={`text`}
                          type='text'
                          dir='rtl'
                          value={text1}
                          onChange={(e)=>setText1(e.target.value)}
                          className='w-full !border-b-1 text-center border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b'
                        />             
                        <Input
                          name={`text`}
                          type='text'
                          dir='rtl'
                          value={text2}
                          onChange={(e)=>setText2(e.target.value)}
                          className='w-full !border-b-1 text-center border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b'
                        />             
                        <Input
                          name={`text`}
                          type='text'
                          dir='rtl'
                          value={text3}
                          onChange={(e)=>setText3(e.target.value)}
                          className='w-full !border-b-1 text-center border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b'
                        />             
                        <Input
                          name={`text`}
                          type='text'
                          dir='rtl'
                          value={text4}
                          onChange={(e)=>setText4(e.target.value)}
                          className='w-full !border-b-1 text-center border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b'
                        />             
                      </td>
                    </tr>
                    
                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2 text-center">
                        {banks.map((bank, item) => {
                          return bank.type === "ثانوي" ? (
                            <span key={item}>{bank.bank_name}</span>
                          ) : null;
                        })} 
                      </td>

                      <td className="border-l border-black p-2 text-center">
                        <Input
                          name={'secUSD'}
                          type='number'
                          dir='rtl'
                          step='0.01'
                          value={SecUSD}
                          onChange={e =>
                            setSecUSD(e.target.value)
                          }
                          className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                        /> 
                       <hr className='border-black my-1 w-full' />
                          <Input
                            name={'secPKR'}
                            type='number'
                            dir='rtl'
                            step='0.01'
                            value={SecPKR}
                            onChange={e =>
                              setSecPKR(e.target.value)
                            }
                            className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                          /> 
                      </td>
                    
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                    </tr>

                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2 text-center">
                      رصيد حساب العهد النقدية بنهاية {} 
                      </td>

                      <td className="border-l border-black p-2 text-center">
                        <Input
                          name={'safe'}
                          type='number'
                          dir='rtl'
                          step='0.01'
                          value={safe}
                          onChange={e =>
                            setSafe(e.target.value)
                          }
                          className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                        /> 
                      </td>
                    
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                    </tr>

                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2 text-center">
                      قيمة المصروف الكلي للشهر الحالي   
                      </td>

                      <td className="border-l border-black p-2 text-center">
                        <Input
                          name={'mustaazSum'}
                          type='number'
                          dir='rtl'
                          step='0.01'
                          value={mustaazSum}
                          onChange={e =>
                            setMustaazSum(e.target.value)
                          }
                          className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                        /> 
                      </td>
                    
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                    </tr>

                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2 text-center">
                      قيمة المصروفات المعلقة للملحقية حتى أغسطس 2024   
                      </td>

                      <td className="border-l border-black p-2 text-center">
                        <Input
                          name={'Reimusable'}
                          type='number'
                          dir='rtl'
                          step='0.01'
                          value={reimusableSum}
                          onChange={e =>setReimusableSum(e.target.value)}
                          className='border-none ring-0 focus-visible:ring-0 w-full h-full'
                        /> 
                      </td>
                    
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                      <td className="border-l border-black p-2 text-center">
                        
                      </td>
                    </tr>
              
              
                  <tr className='border-b border-black'>
                    <td colSpan={1} className='border-l border-black p-2'>
                        الإجمالـــــــــــــــــــــــــــي
                    </td>
                    <td className='border-l border-black p-2 font-bold text-right relative font-geist w-1/6'>
                      <span className='absolute top-1/2 -translate-y-1/2 left-2 font-bold'>
                        $
                      </span>
                     {((parseInt(PrimUSD) || 0) +(parseInt(SecUSD) || 0) +(parseInt(safe) || 0) +(parseInt(mustaazSum) || 0) +(parseInt(reimusableSum) || 0)).toFixed(2)}
                    </td>
                    <td className='border-l border-black p-2 font-bold text-right relative font-geist w-1/6'>
                      <span className='absolute top-1/2 -translate-y-1/2 left-2 font-bold'>
                        $
                      </span>
                       {(parseInt(yearBudget)+parseInt(yearGift)).toFixed(2)}
                    </td>
                    <td className='p-2 font-bold text-right relative font-geist w-1/6'>
                      
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          <div className='grid grid-cols-3 gap-3 p-2 py-6 w-full'>
            <div className='w-full'>
              <div>
                <Label className='block text-xl font-medium'>توقيع المدقق</Label>
                {!editId ? (
                  <>
                    {sign1 ? (
                      <img 
                        src={`${sign1}`} 
                        alt="Signature" 
                        className="w-20 mt-3 h-auto" 
                      />
                    ) : (
                      ''
                    )}
                    <div>
                      <Input
                        name="sign1"
                        type="file"
                        multiple={false}
                        accept="image/*"
                        dir="rtl"
                        onChange={handleSign1}
                        className="w-full !border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                      /> 
                    </div>
                  </>
                ) : (
                  <div>
                    <img 
                      src={`${sign1}`} 
                      alt="Signature" 
                      className="w-20 mt-3 h-auto" 
                    />
                    <hr className="mt-3" style={{ width: '15%', color: 'black' }} />
                  </div>
                )}
              </div>  
            </div>
            
            <div className='w-full'>
                <div>
                  <Label className='block text-xl font-medium'>توقيع المحاسب</Label>
                  {!editId ? (
                    <>
                      {sign2 ? (
                        <img 
                          src={`${sign2}`} 
                          alt="Signature" 
                          className="w-20 mt-3 h-auto" 
                        />
                      ) : (
                        ''
                      )}
                      <div>
                        <Input
                          name="sign2"
                          type="file"
                          multiple={false}
                          accept="image/*"
                          dir="rtl"
                          onChange={handleSign2}
                          className="w-full !border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                        /> 
                      </div>
                    </>
                  ) : (
                    <div>
                      <img 
                        src={`${sign2}`} 
                        alt="Signature" 
                        className="w-20 mt-3 h-auto" 
                      />
                      <hr className="mt-3" style={{ width: '15%', color: 'black' }} />
                    </div>
                  )}
                </div>  
            </div>
            
            <div className='w-full'>
                <div>
                  <Label className='block text-xl font-medium'>إعتماد الملحق العسكري</Label>
                  {!editId ? (
                    <>
                      {sign3 ? (
                        <img 
                          src={`${sign3}`} 
                          alt="Signature" 
                          className="w-20 mt-3 h-auto" 
                        />
                      ) : (
                        ''
                      )}
                      <div>
                        <Input
                          name="sign3"
                          type="file"
                          multiple={false}
                          accept="image/*"
                          dir="rtl"
                          onChange={handleSign3}
                          className="w-full !border-b-2 border-transparent rounded-none border-b-black outline-none focus-visible:ring-0 focus-visible:border-b"
                        /> 
                      </div>
                    </>
                  ) : (
                    <div>
                      <img 
                        src={`${sign3}`} 
                        alt="Signature" 
                        className="w-20 mt-3 h-auto" 
                      />
                      <hr className="mt-3" style={{ width: '15%', color: 'black' }} />
                    </div>
                  )}
                </div>     
            </div>
          </div>          

          <div className='text-center pt-4'>
            <h3 className='font-bold mb-2 text-xl'>إعتماد الملحق العسكري</h3>
            <p className='text-sm font-semibold'>Defense Attache Approval</p>
          </div>
        </div>
        <br/>
        <br/>
        <br/>
        <div id='printHidden' style={{display:"none",marginTop:"20px"}}>
          <div className='text-center pt-4 mt-10'>
            <h3 className='font-bold mb-2 text-xl'>الكشف التدريبي للمستعاض</h3>
          </div>
          <div className='border-t border-l border-r  border-black'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-black'>
                  <th className='border-l border-black p-2 w-1/6'>
                  رقم مستند الصرف
                  </th>
                  <th className='border-l border-black p-2 w-1/6'>
                  تاريخ مستند الصرف  
                  </th>
                  <th className='border-l border-black p-2 w-2/6'>
                  البيان 
                  </th>
                  <th className='p-2 w-1/6'>
                  المبلغ / روبيـة 
                  </th>
                  <th className='p-2 w-1/6'>
                  المبلغ / دولـار 
                  </th>
                </tr>
              </thead>
                <tbody>
                  {vouchers.map((item,index)=>(
                    <tr className='border-b border-black'>
                      <td className='border-l border-black p-2'>
                      {parseInt(item.serial_no)}
                      </td>
                      <td className='border-l border-black p-2 w-1/6 relative'>
                        {item.date}
                      </td>
                      <td className='border-l border-black p-2 w-1/6 relative'>
                        {item.statement}
                      </td>
                      <td className='border-l border-black p-2 w-1/6 relative'>
                        {item.total_pkr.toFixed(2)}
                      </td>
                      <td className='border-l border-black p-2 w-1/6 relative'>
                        {item.total_usd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className='border-b border-black'>
                    <td colSpan={3} className='border-l border-black p-2'>
                        الإجمالـــــــــــــــــــــــــــي
                    </td>
                    <td className='border-l border-black p-2 font-bold text-right relative font-geist w-1/6'>
                    <span className='absolute top-1/2 -translate-y-1/2 left-2 font-bold'>
                      $
                    </span>
                    {vouchers.reduce((sum, voucher) => sum + (parseInt(voucher.total_pkr) || 0), 0)}
                  </td>
                    <td className='border-l border-black p-2 font-bold text-right relative font-geist w-1/6'>
                      <span className='absolute top-1/2 -translate-y-1/2 left-2 font-bold'>
                        $
                      </span>
                      {vouchers.reduce((sum, voucher) => sum + (parseInt(voucher.total_usd) || 0), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
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
              {isSubmitting ? 'جاري الحفظ...' : editId ? 'تحديث النموذج':'حفظ المستند'}
            </Button>
          </div>
        </div>
        </form>
    </div>
  )
}

export default SummaryForm
