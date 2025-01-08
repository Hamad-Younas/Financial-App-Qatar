'use client'

import { useState } from 'react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, Plus } from 'lucide-react'

const SidebarItem = ({ item, pageName, setPageName }) => {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const { pathname } = router

    const handleClick = (e) => {
        e.stopPropagation() // Prevent triggering parent clicks from children
        if (item.children) {
            setIsOpen(prev => !prev) // Toggle the collapse state
        } else {
            const updatedPageName =
                pageName !== item.name.toLowerCase() ? item.name.toLowerCase() : ""
            setPageName(updatedPageName)
            router.push(item.route)
        }
    }

    const isActive = (item) => {
        if (item.route === pathname) return true
        if (item.children) {
            return item.children.some(child => child.route === pathname)
        }
        return false
    }

    return (
        <li className="w-full">
            <div
                className={` group relative flex items-center text-sm 2xl:text-base gap-4 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-destructive/10 cursor-pointer`}
                onClick={handleClick} // Handle click only on the parent item
            >
                <span className="text-center flex items-center justify-center w-[20px]">
                    {item.icon || <Plus size={20} color='hsl(var(--destructive))' />}
                </span>
                <span className="text-base font-semibold whitespace-nowrap flex-grow">{item.name}</span>
                {item.children && (
                    <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                    />
                )}
            </div>
            {item.children && isOpen && (
                <ul className="ml-6 mt-2 space-y-2">
                    {item.children.map((child, index) => (
                        <li key={index}>
                            <Link
                                href={child.route}
                                className={`${
                                    pathname === child.route ? "text-destructive" : ""
                                } block py-2 px-4 text-sm hover:bg-destructive/5 rounded-sm transition-colors duration-200`}
                                onClick={(e) => e.stopPropagation()} // Prevent collapsing when clicking on a child
                            >
                                {child.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    )
}

export default SidebarItem
