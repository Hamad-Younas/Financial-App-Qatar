'use client'
import {Suspense} from 'react'
import ReceiptForm from "@/components/receipts"

export default function ReceiptsForm() {
  return (
    <div className="w-full flex items-center justify-center py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ReceiptForm />
      </Suspense>
    </div>
  )
}

