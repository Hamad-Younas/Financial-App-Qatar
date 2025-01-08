


export async function createVoucher(formData: FormData) {
  try {
   
    const voucherData = {
      type: 'cash',
      date: formData.get('date'),
      accountId: formData.get('itemNumber'),
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description'),
      userId: '1', // You might want to get this from the session
      beneficiary: formData.get('beneficiary'),
      voucherNumber: formData.get('voucherNumber'),
      itemName: formData.get('itemName'),
      accountantSignature: formData.get('accountantSignature'),
    }
    console.log("Form data:", voucherData)
 
    return new Promise((resolve, reject) => {
      // voucherModel.createVoucher(
      //   voucherData.type,
      //   voucherData.date as string,
      //   voucherData.accountId as string,
      //   voucherData.amount,
      //   voucherData.description as string,
      //   voucherData.userId,
      //   (err: Error | null, id: number | null) => {
      //     if (err) {
      //       reject(err)
      //     } else {
      //       resolve({ success: true, id })
      //     }
      //   }
      // )
    })
  } catch (error) {
    console.error('Error creating voucher:', error)
    throw new Error('Failed to create voucher')
  }
}

