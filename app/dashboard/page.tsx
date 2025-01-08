"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import TopHeader from "../../components/ui/topHeader";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/responsiveTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';


interface Voucher {
  id: number;
  serial_no: string;
  bank_account: string;
  cheque_no: string;
  exchange_rate: number;
  is_mustaaz: number;
  IsReimbursable: number;
  statement: string;
}

interface BankData {
  bank_name: string;
  USD_SUM: number;
  PKR_Total: number;
}

ChartJS.register(ArcElement, Tooltip, Legend);

const Page = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [allvouchers, setAllvouchers] = useState<any[]>([]);
  const [banks, setBanks] = useState<any>({ primBanks: [], secBanks: [] });
  const [allbanks,setAllbanks]=useState([]);
  const router = useRouter();

  const data = {
    labels: ["مستعاض", "غير مستعاض", "قابل للسداد", "غير قابل للسداد"],
    datasets: [
      {
        data: [
          vouchers.length > 0 ? parseInt(vouchers[0].IsMustaaz_1_Count, 10) : 0,
          vouchers.length > 0 ? parseInt(vouchers[0].IsMustaaz_0_Count, 10) : 0,
          vouchers.length > 0 ? parseInt(vouchers[0].IsReimbursable_1_Count, 10) : 0,
          vouchers.length > 0 ? parseInt(vouchers[0].IsReimbursable_0_Count, 10) : 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const bankColumns: ColumnDef<Voucher>[] = [
    {
      accessorKey: "bank_name",
      header: "اسم البنك",
    },
    {
      accessorKey: "USD_SUM",
      header: "قيمة بالدولار الأمريكي",
      cell: ({ row }) => {
        const value = parseFloat(row.original.USD_SUM).toFixed(2);
        return `$${value}`;
      },
    },
    {
      accessorKey: "PKR_Total",
      header: "قيمة بالروبية الباكستانية",
      cell: ({ row }) => {
        const value = parseFloat(row.original.PKR_Total).toFixed(2); 
        return `₨${value}`;
      },
    },
  ];
  

  useEffect(() => {
    fetchVouchers();
  }, []);

  const backupDatabase = (dbFilePath: string, backupDir: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if the database file exists
      if (!fs.existsSync(dbFilePath)) {
        reject(new Error(`Database file not found at path: ${dbFilePath}`));
        return;
      }
  
      // Ensure the backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
  
      const fileName = path.basename(dbFilePath);
      const backupFilePath = path.join(backupDir, `${fileName}.bak`);
  
      // Copy the database file to the backup location
      fs.copyFile(dbFilePath, backupFilePath, (err) => {
        if (err) {
          reject(new Error(`Error during backup: ${err.message}`));
          return;
        }
  
        console.log(`Database backed up successfully to: ${backupFilePath}`);
        resolve();
      });
    });
  };
  

  const fetchVouchers = async () => {
    try {
      const query = `
      SELECT 
        COUNT(CASE WHEN is_mustaaz = 0 AND IsReimbursable = 0 THEN 1 END) AS IsMustaaz_0_Count,
        COUNT(CASE WHEN is_mustaaz = 1 AND IsReimbursable = 0 THEN 1 END) AS IsReimbursable_0_Count,
        COUNT(CASE WHEN is_mustaaz = 1 AND IsReimbursable = 1 THEN 1 END) AS IsReimbursable_1_Count
      FROM payment_vouchers 
      WHERE status != ?`;

      const allquery = `SELECT * FROM payment_vouchers WHERE status != ?`;

      const response = await window.electronAPI.dbQuery(query, ["Deleted"]);
      console.log(response);
      const responses = await window.electronAPI.dbQuery(allquery, ["Deleted"]);
      console.log(responses);
      setVouchers(response);
      setAllvouchers(responses);

      const PrimaryBanks = `
        SELECT 
            b.bank_name AS bank_name,
            SUM(CASE WHEN b.type = 'أولي' AND b.currency = 'USD' THEN pv.total_usd ELSE 0 END) AS USD_SUM,
            SUM(CASE WHEN b.type = 'أولي' AND b.currency = 'PKR' THEN pv.total_pkr ELSE 0 END) AS PKR_Total
        FROM 
            payment_vouchers pv
        JOIN 
            banks b ON pv.bank_account = b.bank_name
        WHERE 
            strftime('%Y', pv.date) = strftime('%Y', 'now') 
            AND strftime('%m', pv.date) = strftime('%m', 'now') 
            AND b.type = 'أولي'
        GROUP BY 
            b.bank_name`;

      const SecondaryBanks = `
        SELECT 
            b.bank_name AS bank_name,
            SUM(CASE WHEN b.type = 'ثانوي' AND b.currency = 'USD' THEN pv.total_usd ELSE 0 END) AS USD_SUM,
            SUM(CASE WHEN b.type = 'ثانوي' AND b.currency = 'PKR' THEN pv.total_pkr ELSE 0 END) AS PKR_Total
        FROM 
            payment_vouchers pv
        JOIN 
            banks b ON pv.bank_account = b.bank_name
        WHERE 
            strftime('%Y', pv.date) = strftime('%Y', 'now')
            AND strftime('%m', pv.date) = strftime('%m', 'now')
            AND b.type = 'ثانوي' 
        GROUP BY 
            b.bank_name`;

      const primBanks = await window.electronAPI.dbQuery(PrimaryBanks, []);
      const secBanks = await window.electronAPI.dbQuery(SecondaryBanks, []);
      const combinedResult = {
        primBanks,
        secBanks,
      };
      console.log(primBanks.concat(secBanks))
      setAllbanks(primBanks.concat(secBanks));
      setBanks(combinedResult);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };

  const dbFilePath = '../../database/app.sqlite'; // Path to your SQLite database
  const backupDir = '../../Backups';

  const usdData = [
    ...banks.primBanks.map((bank: BankData) => bank.USD_SUM.toFixed(2)),
    ...banks.secBanks.map((bank: BankData) => bank.USD_SUM.toFixed(2)),
  ];

  const pkrData = [
    ...banks.primBanks.map((bank: BankData) => bank.PKR_Total.toFixed(2)),
    ...banks.secBanks.map((bank: BankData) => bank.PKR_Total.toFixed(2)),
  ];

  const bankNames = [
    ...banks.primBanks.map((bank: BankData) => bank.bank_name),
    ...banks.secBanks.map((bank: BankData) => bank.bank_name),
  ];

  const totalData = [...usdData, ...pkrData];

  const datas = {
    labels: [
      ...bankNames.map((name) => `${name} USD`),
      ...bankNames.map((name) => `${name} PKR`),
    ], 
    datasets: [
      {
        data: totalData,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40",
          "#C9DAF8",
        ], 
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40",
          "#C9DAF8",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Bank Transactions (USD and PKR)",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw} (${context.dataset.data[context.dataIndex]})`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[calc(100dvh-200px)] flex flex-col items-center">
      <TopHeader />
      <div className="flex w-full mt-8 px-4">
        <div className="w-2/4 flex justify-center items-center">
          <Pie data={data} />
        </div>

        <div className="w-3/4">
        <div className="w-3/4 grid grid-cols-2 gap-4">
          <div className="card bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-bold">مستعاض</h2>
            <div className="mt-2 flex justify-between">
              <div className="sub-category">
                <h3 className="text-md font-semibold">قابل للسداد</h3>
                <p>{vouchers.length > 0 ? parseInt(vouchers[0].IsReimbursable_1_Count, 10) : 0}</p>
              </div>
              <div className="sub-category">
                <h3 className="text-md font-semibold">غير قابل للسداد</h3>
                <p>{vouchers.length > 0 ? parseInt(vouchers[0].IsReimbursable_0_Count, 10) : 0}</p>
              </div>
            </div>
          </div>      
        
          <div className="card bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-bold">غير مستعاض</h2>
            <h3 className="text-md font-semibold">{vouchers.length > 0 ? parseInt(vouchers[0].IsMustaaz_0_Count, 10):0}</h3>
          </div>
        </div>
      </div>
      </div>

      <div className="flex w-full mt-8 px-4">
        <div className="w-2/4 flex justify-center items-center">
          <Pie data={datas} options={options} />
        </div>

        <div className="w-3/4">
          <DataTable columns={bankColumns} data={allbanks} />
        </div>
      </div>
    </div>
  );
};

export default Page;
