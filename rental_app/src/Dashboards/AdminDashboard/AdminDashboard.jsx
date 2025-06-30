// // import React from 'react';
// // import Sidebar from './Sidebar/Sidebar';

// // import './AdminDashboard.css'; // Styling file
// // import { Outlet } from 'react-router-dom';

// // const AdminDashboard = () => {
// //   return (
// //     <div className="admin-dashboard">
// //       <div className="sidebar-section">
// //         <Sidebar />
// //       </div>
// //       <div className="display-section">
// //         <Outlet />
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminDashboard;




import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import './AdminDashboard.css';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-dashboard">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`sidebar-section ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>

      <div className="display-section">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
