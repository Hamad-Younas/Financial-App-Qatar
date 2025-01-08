
'use client'

import {Suspense} from 'react'
import PettyCashForm from "@/components/petty-cash-form"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CashPaymentPage() {
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    try {
      console.log("Form data:", formData)
      toast.success("تم حفظ إذن الصرف بنجاح")
      router.push('/vouchers') // Redirect to vouchers list
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ إذن الصرف")
      console.error('Error:', error)
    }
  }

  return (
    <div className="w-full flex items-center justify-center py-8">
      <Suspense fallback={<div>Loading...</div>}>
      <PettyCashForm onSubmit={handleSubmit} />
      </Suspense>
    </div>
  )
}

