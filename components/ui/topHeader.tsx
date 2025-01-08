import Image from 'next/image'
import { Label } from './label'

const TopHeader = () => {
  return (
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
          width={250}
          height={250}
          className='object-contain mb-2'
        />
      </div>
      <div className='col-span-1 flex flex-col items-center justify-center'>
        <Label className='text-lg text-center font-geist font-bold'>
          Embassy Of State of Qatar <br />
          Military Attache <br /> Islamabad
        </Label>
      </div>
    </div>
  )
}

export default TopHeader
