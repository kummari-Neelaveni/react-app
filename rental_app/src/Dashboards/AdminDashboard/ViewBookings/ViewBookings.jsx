import React, { useEffect, useState } from "react";
import { db } from "../../../ConfigFirebase/config";
import { collection, getDocs } from "firebase/firestore";
import './ViewBookings.css';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const customersSnap = await getDocs(collection(db, "Customers"));

        if (customersSnap.empty) {
          setBookings([]);
          setLoading(false);
          return;
        }

        let allBookings = [];

        customersSnap.forEach((doc) => {
          const data = doc.data();

          // Check if myBookings exists and is an array
          if (Array.isArray(data.myBookings)) {
            const customerBookings = data.myBookings.map((booking) => ({
              ...booking,
              customerId: doc.id,
              customerName: booking.customerName || data.name || "Unknown",
              quantity: booking.quantity || "N/A", // ✅ show requested quantity
            }));
            allBookings = allBookings.concat(customerBookings);
          }
        });

        setBookings(allBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, []);

  // if (loading) return <div>Loading bookings...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  // if (bookings.length === 0)
  //   return <div>No bookings found for any customer.</div>;

  return (
    // <div style={{ padding: "20px" }}>
    //   <h2>All Customer Bookings</h2>
    //   <table
    //     border="1"
    //     cellPadding="10"
    //     style={{ width: "100%", borderCollapse: "collapse" }}
    //   >
    //     <thead>
    //       <tr>
    //         <th>Customer Name</th>
    //         <th>Material Name</th>
    //         <th>Location</th>
    //         <th>Phone</th>
    //         <th>Start Date</th>
    //         <th>End Date</th>
    //         <th>Material Price</th>
    //         <th>Status</th>
           
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {bookings.map((b, i) => (
    //         <tr key={`${b.customerId}_${i}`}>
    //           <td>{b.customerName}</td>
    //           <td>{b.materialName}</td>
    //           <td>{b.location}</td>
    //           <td>{b.phoneNumber || "N/A"}</td>
    //           <td>{new Date(b.startDate).toLocaleString()}</td>
    //           <td>
    //             {b.endDate
    //               ? new Date(b.endDate).toLocaleString()
    //               : "Ongoing"}
    //           </td>
    //           <td>{b.materialPrice || "N/A"}</td>
    //           <td>{b.status || "Active"}</td>
    //           {/* <td>{b.quantity}</td>  */}
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
//     <div style={{ padding: "20px" }}>
//   <h2>All Customer Bookings</h2>

//   <div className="table-container">
//     <table
//       border="1"
//       cellPadding="10"
//       style={{ width: "100%", borderCollapse: "collapse" }}
//     >
//       <thead>
//         <tr>
//           <th>Customer Name</th>
//           <th>Material Name</th>
//           <th>Location</th>
//           <th>Phone</th>
//           <th>Start Date</th>
//           <th>End Date</th>
//           <th>Material Price</th>
//           <th>Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {bookings.map((b, i) => (
//           <tr key={`${b.customerId}_${i}`}>
//             <td>{b.customerName}</td>
//             <td>{b.materialName}</td>
//             <td>{b.location}</td>
//             <td>{b.phoneNumber || "N/A"}</td>
//             <td>{new Date(b.startDate).toLocaleString()}</td>
//             <td>
//               {b.endDate ? new Date(b.endDate).toLocaleString() : "Ongoing"}
//             </td>
//             <td>{b.materialPrice || "N/A"}</td>
//             <td>{b.status || "Active"}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// </div>

  <div style={{ padding: "20px" }}>
  <h2>All Customer Bookings</h2>

  <div className="table-container">
    <table
      border="1"
      cellPadding="10"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <thead>
        <tr>
          <th>Customer Name</th>
          <th>Material Name</th>
          <th>Location</th>
          <th>Phone</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Material Price</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
              Loading bookings...
            </td>
          </tr>
        ) : bookings.length === 0 ? (
          <tr>
            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
              No bookings found for any customer.
            </td>
          </tr>
        ) : (
          bookings.map((b, i) => (
            <tr key={`${b.customerId}_${i}`}>
              <td>{b.customerName}</td>
              <td>{b.materialName}</td>
              <td>{b.location}</td>
              <td>{b.phoneNumber || "N/A"}</td>
              <td>{new Date(b.startDate).toLocaleString()}</td>
              <td>
                {b.endDate ? new Date(b.endDate).toLocaleString() : "Ongoing"}
              </td>
              <td>{b.materialPrice || "N/A"}</td>
              <td>{b.status || "Active"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>


  );
};

export default ViewBookings;



















