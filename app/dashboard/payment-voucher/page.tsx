'use client'
import {Suspense} from 'react'
import { createVoucher } from "@/app/actions/create-voucher"
import PaymentVoucherForm from "@/components/payment-voucher"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function PaymentVoucher() {
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    try {
      console.log("Form data:", formData)
      createVoucher(formData)
      toast.success("تم حفظ إذن الصرف بنجاح")
      // router.push('/vouchers') // Redirect to vouchers list
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ إذن الصرف")
      console.error('Error:', error)
    }
  }

  return (
    <div className="w-full flex items-center justify-center py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentVoucherForm onSubmit={handleSubmit} />
      </Suspense>
    </div>
  )
}

