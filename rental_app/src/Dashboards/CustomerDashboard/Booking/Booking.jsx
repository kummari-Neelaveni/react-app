import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { db, authentication } from "../../../ConfigFirebase/config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import './Booking.css'

const Booking = ({ show, handleClose, material, adminId }) => {
  const [bookingDetails, setBookingDetails] = useState({
  customerName: "",
  phoneNumber: "",
  location: "",
  startDate: "",
  endDate: ""
});

  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  const [rentalDays, setRentalDays] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authentication, (user) => {
      if (user) {
        setLoggedInCustomer(user);
        localStorage.setItem("loggedInCustomer", JSON.stringify(user));
        console.log("User logged in:", user);
      } else {
        setLoggedInCustomer(null);
        localStorage.removeItem("loggedInCustomer");
        console.log("User logged out.");
      }
    });

    return () => unsubscribe();
  }, []);
  //// Calculate rental days and total price when dates or price change
  useEffect(()=>{
    const {startDate,endDate}=bookingDetails;
    if (!startDate|| !endDate){
      console.log("Start date or end date missing");
      setRentalDays(0)
      setCalculatedPrice(0);
      return;
    }
    if(!material?.price){
      console.log("material price is missing");
      setRentalDays(0);
      setCalculatedPrice(0);
      return;

    }
      const start=new Date(startDate)
      const end = new Date(endDate);
     
    if (end <= start) {
    console.log("End date must be after start date");
    setRentalDays(0);
    setCalculatedPrice(0);
    return;
  }
  const diffMs = end - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const daysRoundedUp = Math.ceil(diffDays);
  setRentalDays(daysRoundedUp);
  setCalculatedPrice(daysRoundedUp * material.price);
   console.log("Rental Duration (days):", daysRoundedUp);
  console.log("Total Price:", daysRoundedUp * material.price);
  },[bookingDetails.startDate, bookingDetails.endDate, material?.price])

  const handleChange = (e) => {
    setBookingDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBooking = async () => {
    if (
  !bookingDetails.customerName ||
  !bookingDetails.phoneNumber ||
  !bookingDetails.location ||
  !bookingDetails.startDate ||
  !bookingDetails.endDate
) {
  alert("Please fill all fields.");
  return;
}

    if (!loggedInCustomer) {
      alert("You must be logged in to book.");
      return;
    }

    if (!material || !material.name || !material.price || !material.category) {
      alert("Invalid material data.");
      return;
    }

    const bookingData = {
      ...bookingDetails,
      materialId: material.id || "",
      materialName: material.name,
      materialPrice: material.price,
      materialCategory: material.category,
      timestamp: new Date().toISOString(),
    };

    console.log("Booking Data:", bookingData);

    try {
      const adminRef = doc(db, "Admins", adminId);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        alert("Admin not found!");
        return;
      }

      let adminData = adminSnap.data();
      console.log("Admin Data before update:", adminData);

      let updatedMaterials = [];

      if (adminData.materials && Array.isArray(adminData.materials)) {
        updatedMaterials = adminData.materials.map((mat) => {
          if (
            mat.name === material.name &&
            mat.price === material.price &&
            mat.category === material.category
          ) {
            if (!mat.bookings) mat.bookings = [];
            return {
              ...mat,
              bookings: [...mat.bookings, bookingData],
            };
          }
          return mat;
        });
      }

      console.log("Updated materials to save:", updatedMaterials);

      await updateDoc(adminRef, {
        materials: updatedMaterials,
      });

      const customerKey =
        loggedInCustomer.displayName || loggedInCustomer.uid;

      const customerRef = doc(db, "Customers", customerKey);
      const customerSnap = await getDoc(customerRef);

      console.log("Customer Ref ID:", customerKey);
      console.log("Customer Exists:", customerSnap.exists());

      if (customerSnap.exists()) {
        const currentBookings = customerSnap.data().myBookings || [];
        console.log("Existing Bookings:", currentBookings);
        await updateDoc(customerRef, {
          myBookings: [...currentBookings, bookingData],
        });
      } else {
        await setDoc(customerRef, {
          myBookings: [bookingData],
        });
      }

      console.log("Booking successful");
      alert("Booking confirmed!");
      handleClose();
    } catch (error) {
      console.error("Error booking:", error);
      alert("Booking failed. Try again.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Book Material</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {material && (
          <>
            <p><strong>Material Name:</strong> {material.name}</p>
            <p><strong>Price perday:</strong> ₹{material.price}</p>
            <p><strong>Category:</strong> {material.category}</p>
          </>
        )}

        <Form>
          <Form.Group controlId="customerName">
            <Form.Label>Your Name</Form.Label>
            <Form.Control
              type="text"
              name="customerName"
              value={bookingDetails.customerName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="phoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="number"
              name="phoneNumber"
              value={bookingDetails.phoneNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="location">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={bookingDetails.location}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="startDate">
  <Form.Label>From Date & Time</Form.Label>
  <Form.Control
    type="datetime-local"
    name="startDate"
    value={bookingDetails.startDate}
    onChange={handleChange}
    required
  />
</Form.Group>

<Form.Group controlId="endDate">
  <Form.Label>To Date & Time</Form.Label>
  <Form.Control
    type="datetime-local"
    name="endDate"
    value={bookingDetails.endDate}
    onChange={handleChange}
    required
  />
</Form.Group>
<Form.Group>
  <Form.Label>Rental Duration</Form.Label>
  <Form.Control
    type="text"
    value={`${rentalDays} day(s)`}
    disabled
  />
</Form.Group>

<Form.Group>
  <Form.Label>Total Price</Form.Label>
  <Form.Control
    type="text"
    value={`₹${calculatedPrice}`}
    disabled
  />
</Form.Group>

       </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleBooking}>Confirm Booking</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Booking;















