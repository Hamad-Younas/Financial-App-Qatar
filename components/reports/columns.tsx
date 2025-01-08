import { ColumnDef } from "@tanstack/react-table";
import { ReportData } from "./report";

export const columns: ColumnDef<ReportData>[] = [
  {
    accessorKey: "serial_no",
    header: "Serial No",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "beneficiary",
    header: "Beneficiary",
  },
  {
    accessorKey: "budget_voto_no",
    header: "Budget Voto No",
  },
  {
    accessorKey: "account_type_name",
    header: "Account Type",
  },
  {
    accessorKey: "total_pkr",
    header: "Amount (PKR)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_pkr"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PKR",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "total_usd",
    header: "Amount (USD)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_usd"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "exchange_rate",
    header: "Exchange Rate",
  },
  {
    accessorKey: "remaining_budget",
    header: "Remaining Budget",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("remaining_budget"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "invoice_nos",
    header: "Invoices",
    cell: ({ row }) => {
      const invoices = row.getValue<string[]>("invoice_nos");
      return (
        <div className="font-medium">
          {invoices || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "descriptions",
    header: "Descriptions",
    cell: ({ row }) => {
      const descriptions = row.getValue<string[]>("descriptions");
      return (
        <div className="font-medium">
          {descriptions || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "usd_values",
    header: "USD Values",
    cell: ({ row }) => {
      const usdValues = row.getValue<number[]>("usd_values");
      return (
        <div className="font-medium">
          {usdValues || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "pkr_values",
    header: "PKR Values",
    cell: ({ row }) => {
      const pkrValues = row.getValue<number[]>("pkr_values");
      return (
        <div className="font-medium">
          {pkrValues|| "N/A"}
        </div>
      );
    },
  },
];
