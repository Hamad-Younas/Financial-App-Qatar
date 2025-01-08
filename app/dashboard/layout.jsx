"use client"

import React from 'react'
import Sidebar from '../../components/sidebar'
import Header from '../../components/header'

const layout = ({children}) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="flex w-full justify-between">                
    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    <div className="relative flex flex-1 flex-col w-full lg:max-w-[calc(100%-260px)]">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="w-full">
            <div className="w-full p-4 md:p-6 2xl:p-10">
                {children}
            </div>
        </main>
    </div>
</div>
  )
}

export default layout