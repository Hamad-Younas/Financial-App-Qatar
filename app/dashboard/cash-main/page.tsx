
"use client";
export const dynamic = 'force-dynamic'; // Force dynamic rendering
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import TopHeader from "@/components/ui/topHeader";
import { DataTable } from "@/components/ui/responsiveTable";
import { useRouter } from "next/navigation";

interface PettyCash {
  id: number;
  item_name: string;
  item_number: string;
  military_attache_name: string;
  accountant_name: string;
  total_usd: number;
  total_pkr: number;
}

export default function Page() {
  const [pettyCashRecords, setPettyCashRecords] = useState<PettyCash[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const router = useRouter();

  const columns1: ColumnDef<PettyCash>[] = [
    {
      accessorKey: "actions",
      header: "فعل",
      cell: ({ row }) => {
        const pettyCash = row.original;
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInfoClick(pettyCash.id)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM13 17H11V9H13V17ZM13 7H11V5H13V7Z"
                  fill="black"
                />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeletePettyCash(pettyCash.id)}
            >
              <svg
                width="18"
                height="23"
                viewBox="0 0 18 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.7549 7.5V20H3.75494V7.5H13.7549ZM11.8799 0H5.62994L4.37994 1.25H0.00494385V3.75H17.5049V1.25H13.1299L11.8799 0ZM16.2549 5H1.25494V20C1.25494 21.375 2.37994 22.5 3.75494 22.5H13.7549C15.1299 22.5 16.2549 21.375 16.2549 20V5Z"
                  fill="black"
                />
              </svg>
            </Button>
          </div>
        );
      },
    },
    { accessorKey: "item_name", header: "اسم العنصر" },
    { accessorKey: "item_number", header: "رقم العنصر" },
    { accessorKey: "military_attache_name", header: "اسم الملحق العسكري" },
    { accessorKey: "total_usd", header: "المجموع بالدولار" },
    { accessorKey: "total_pkr", header: "المجموع بالروبية" },
    { accessorKey: "statement", header: "بيان" },
    {
      accessorKey: "id",
      header: "الرقم التسلسلي",
      cell: ({ row }) => {
        const serialNo = row.original.id;
        return <span>{serialNo}</span>;
      },
    },
  ];

  const handleInfoClick = (id: number) => {
    router.push(`/dashboard/cash-payment?id=${id}`);
  };

  const fetchPettyCash = async () => {
    try {
      const query = "SELECT * FROM petty_cash WHERE status != ?";
      const response = await window.electronAPI.dbQuery(query, ["Deleted"]);
      setPettyCashRecords(response);
    } catch (error) {
      console.error("Error fetching petty cash records:", error);
      toast.error("Failed to fetch petty cash records");
    }
  };

  const handleDeletePettyCash = async (id: number) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to mark this petty cash record as deleted?"
      );
      if (!confirm) return;

      const query = "UPDATE petty_cash SET status = ? WHERE id = ?";
      await window.electronAPI.dbQuery(query, ["Deleted", id]);
      toast.success("Petty cash record marked as deleted successfully");
      fetchPettyCash(); // Refresh the petty cash table to reflect the change
    } catch (error) {
      console.error("Error updating petty cash status:", error);
      toast.error("Failed to update petty cash status");
    }
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return pettyCashRecords.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(pettyCashRecords.length / rowsPerPage);

  useEffect(() => {
    fetchPettyCash();
  }, []);

  return (
    <div className="overflow-x-auto">
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
      </div>
      <div className="flex justify-end">
        <Button
          variant="default"
          className="bg-[#800020] text-xl font-bold w-[200px] h-[50px] mt-4 mb-4 -mb-10"
          onClick={() => router.push("/dashboard/cash-payment")}
        >
          إنشاء سجل نقدي
        </Button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns1} data={paginatedData()} />

      <div className="flex justify-between mt-4">
        {/* Rows Per Page Dropdown */}
        <div className="flex items-center">
          <label className="mr-2">Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Pagination Controls */}
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === index + 1
                  ? "bg-[#942c51] text-white"
                  : "bg-[#e1a3b1] text-white"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
