'use client'

import { useState } from 'react'
import SidebarItem from './SidebarItem'
import ClickOutside from './ClickOutside'
import useLocalStorage from './useLocalStorage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CircleDollarSign, Settings2Icon, ChevronDown, Plus } from 'lucide-react'

const menuGroups = [
  {
    icon: (
      <svg
        width='30'
        height='30'
        viewBox='0 0 30 30'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M13.7437 5.85V10.7C13.7437 11.1016 13.6644 11.4992 13.5104 11.8701C13.3563 12.2409 13.1305 12.5777 12.846 12.8611C12.5614 13.1445 12.2237 13.3689 11.8523 13.5214C11.4808 13.674 11.0828 13.7516 10.6812 13.75H5.85623C5.45573 13.7524 5.05887 13.674 4.68942 13.5193C4.31998 13.3647 3.98557 13.137 3.70623 12.85C3.42262 12.5688 3.19803 12.2337 3.04563 11.8645C2.89323 11.4953 2.81609 11.0994 2.81873 10.7V5.8625C2.81872 5.05575 3.13835 4.28186 3.70763 3.71023C4.27692 3.1386 5.04949 2.81581 5.85623 2.8125H10.6937C11.0938 2.81288 11.4898 2.89263 11.8589 3.04711C12.2279 3.2016 12.5627 3.42776 12.8437 3.7125C13.1281 3.99123 13.3541 4.32378 13.5086 4.69076C13.6632 5.05774 13.7431 5.45181 13.7437 5.85ZM27.1812 5.8625V10.7C27.1747 11.5047 26.853 12.2749 26.2851 12.8451C25.7173 13.4153 24.9484 13.7402 24.1437 13.75H19.2937C18.4852 13.7451 17.7101 13.4269 17.1312 12.8625C16.8484 12.5781 16.6244 12.2407 16.4721 11.8696C16.3198 11.4986 16.2422 11.1011 16.2437 10.7V5.8625C16.2427 5.46221 16.3218 5.06577 16.4764 4.69652C16.631 4.32728 16.8579 3.9927 17.1437 3.7125C17.4248 3.42776 17.7595 3.2016 18.1286 3.04711C18.4976 2.89263 18.8937 2.81288 19.2937 2.8125H24.1312C24.9381 2.81903 25.7101 3.14247 26.2807 3.71305C26.8513 4.28362 27.1747 5.05561 27.1812 5.8625ZM27.1812 19.3V24.1375C27.1747 24.9422 26.853 25.7124 26.2851 26.2826C25.7173 26.8528 24.9484 27.1777 24.1437 27.1875H19.2937C18.4801 27.1958 17.6953 26.8863 17.1062 26.325C16.8222 26.0414 16.5975 25.7042 16.4452 25.3329C16.2928 24.9617 16.2158 24.5638 16.2187 24.1625V19.325C16.2177 18.9247 16.2968 18.5283 16.4514 18.159C16.606 17.7898 16.8329 17.4552 17.1187 17.175C17.3998 16.8903 17.7345 16.6641 18.1036 16.5096C18.4726 16.3551 18.8686 16.2754 19.2687 16.275H24.1062C24.9131 16.2815 25.6851 16.605 26.2557 17.1755C26.8263 17.7461 27.1497 18.5181 27.1562 19.325L27.1812 19.3ZM13.7437 19.3125V24.15C13.7339 24.9569 13.4073 25.7275 12.8344 26.2958C12.2615 26.864 11.4881 27.1843 10.6812 27.1875H5.85623C5.45688 27.1892 5.06115 27.1117 4.69188 26.9597C4.3226 26.8076 3.98709 26.5839 3.70471 26.3015C3.42232 26.0191 3.19864 25.6836 3.04658 25.3144C2.89451 24.9451 2.81708 24.5494 2.81873 24.15V19.3125C2.82195 18.5056 3.14222 17.7323 3.71046 17.1593C4.2787 16.5864 5.04937 16.2598 5.85623 16.25H10.6937C11.504 16.2583 12.2793 16.581 12.8562 17.15C13.4263 17.7251 13.7455 18.5027 13.7437 19.3125Z'
          fill='hsl(var(--destructive))'
        />
      </svg>
    ),
    name: 'Dashboard',
    route: '/dashboard'
  },
  {
    icon: <CircleDollarSign color='hsl(var(--destructive))' />,
    name: 'Vouchers',
    children: [
      {
        name: 'Cash Voucher',
        route: '/dashboard/cash-main'
      },
      {
        name: 'Online Voucher',
        route: '/dashboard/payment-main'
      },
      {
        name: 'Receipt Voucher',
        route: '/dashboard/receipts-main'
      },
      {
        name: 'Summary',
        route: '/dashboard/summary-main'
      }
    ]
  },

  {
    icon: <Settings2Icon color='hsl(var(--destructive))' />,
    name: 'Reports',
    children: [
      {
        name: 'Payment Voucher Report',
        route: '/dashboard/reports'
      },
      {
        name: 'Bank Statement',
        route: '/dashboard/statements'
      },
      {
        name: 'Bank Expense Statement',
        route: '/dashboard/expense-statement'
      },
    ]
  },
  {
    icon: <Settings2Icon color='hsl(var(--destructive))' />,
    name: 'Settings',
    route: '/dashboard/settings'
  }
]

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [pageName, setPageName] = useLocalStorage('qatarMenu', 'dashboard')
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <ClickOutside onClick={() => {}}>
      <aside
        className={`fixed left-0 top-0 z-20 flex h-full w-64 flex-col items-start overflow-y-hidden bg-[#fff] shadow-lg border-r duration-300 ease-linear`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <Link href='/' className='mt-5 w-full px-4'>
          <div className='flex items-center gap-2 '>
            <img
              alt='logo'
              width={200}
              height={200}
              className='object-cover'
              src={'/logo.png'}
            />
          </div>
        </Link>

        <div className='flex flex-col overflow-y-auto duration-300 ease-linear w-full'>
          <ul className='mb-6 flex flex-col gap-1.5 px-4 py-4'>
            {menuGroups.map((menuItem, menuIndex) => (
              <SidebarItem
                key={menuIndex}
                item={menuItem}
                pageName={pageName}
                setPageName={setPageName}
              />
            ))}
          </ul>
        </div>

        <div className="mt-auto w-full px-4 pb-4">
          <button
            className={`group relative flex w-full items-center text-sm 2xl:text-base gap-4 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-destructive/10`}
            onClick={handleLogout}
          >
            <span className='text-center flex items-center justify-center w-[20px]'>
              <svg
                width='25'
                height='25'
                viewBox='0 0 30 30'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M7.5 2.5C6.50544 2.5 5.55161 2.89509 4.84835 3.59835C4.14509 4.30161 3.75 5.25544 3.75 6.25V23.75C3.75 24.7446 4.14509 25.6984 4.84835 26.4017C5.55161 27.1049 6.50544 27.5 7.5 27.5H15C15.9946 27.5 16.9484 27.1049 17.6517 26.4017C18.3549 25.6984 18.75 24.7446 18.75 23.75V6.25C18.75 5.25544 18.3549 4.30161 17.6517 3.59835C16.9484 2.89509 15.9946 2.5 15 2.5H7.5ZM20.3662 9.11625C20.6007 8.88191 20.9185 8.75027 21.25 8.75027C21.5815 8.75027 21.8993 8.88191 22.1338 9.11625L27.1338 14.1163C27.3681 14.3507 27.4997 14.6685 27.4997 15C27.4997 15.3315 27.3681 15.6493 27.1338 15.8837L22.1338 20.8838C21.898 21.1114 21.5822 21.2374 21.2545 21.2346C20.9268 21.2317 20.6132 21.1003 20.3815 20.8685C20.1497 20.6368 20.0183 20.3232 20.0154 19.9955C20.0126 19.6678 20.1386 19.352 20.3662 19.1163L23.2325 16.25H12.5C12.1685 16.25 11.8505 16.1183 11.6161 15.8839C11.3817 15.6495 11.25 15.3315 11.25 15C11.25 14.6685 11.3817 14.3505 11.6161 14.1161C11.8505 13.8817 12.1685 13.75 12.5 13.75H23.2325L20.3662 10.8837C20.1319 10.6493 20.0003 10.3315 20.0003 10C20.0003 9.66854 20.1319 9.35066 20.3662 9.11625Z'
                  fill='hsl(var(--destructive))'
                />
              </svg>
            </span>
            <span className='text-base font-semibold'>Logout</span>
          </button>
        </div>
      </aside>
    </ClickOutside>
  )
}

export default Sidebar

