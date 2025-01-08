


const Header = ({ sidebarOpen, setSidebarOpen }) => {
    return (
        <header className="sticky top-0 z-10 flex w-full bg-white border-b shadow-lg ">
            <div className="flex flex-grow items-center gap-5 justify-between px-4 py-2 shadow md:px-11">
               
                <div className="flex items-center gap-5 justify-between w-full">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-lg font-bold text-[#333333]">Dashboard</h1>
                        <p className="text-base text-[#999999]">
                            {new Date().toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            }).replace(",", "")}
                        </p>
                    </div>
                    <img alt="profile" width={25} height={25} className="size-[50px] rounded-full object-cover" src={'/profile.jpg'} />
                </div>


            </div>
        </header>
    )
}

export default Header