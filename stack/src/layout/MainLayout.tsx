import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import RightSideBar from '@/components/RightSideBar';
import React, { useEffect, useState } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    useEffect(() => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    }, []);

    const handleslidein = () => {
        if (window.innerWidth <= 768) {
            setSidebarOpen((state) => !state);
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen flex flex-col">
            {/* Top Navbar */}
            <Navbar handleslidein={handleslidein} />
            
            {/* Main Application Container */}
            <div className="flex flex-1 max-w-full">
                {/* Left Sidebar */}
                <Sidebar isopen={sidebarOpen} onClose={handleslidein} />
                
                {/* Center Content Area */}
                <main className="flex-1 min-w-0 p-4 lg:p-6 bg-white">
                    {children}
                </main>
                
                {/* Right Sidebar (Moved inside the flex container row) */}
                <div className="hidden lg:block border-l border-gray-200">
                    <RightSideBar />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
