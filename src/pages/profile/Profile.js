import React, { useState } from "react";
import { FaUserAlt, FaTrash, FaEdit, FaSave } from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "N Tri",
    email: "ntri.knp@gmail.com",
    phone: "None",
    password: "********",
    currency: "USD ($)",
    timezone: "GMT+05:30 Chennai",
    language: "English",
    avatar: "",
  });

  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
  });

  const handleEditClick = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSaveClick = (field) => {
    setEditMode({ ...editMode, [field]: false });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-container">
      <h2>Your Account</h2>
      <div className="profile-box">
        <div className="profile-left">
          <div className="avatar-box">
            <FaUserAlt size={100} color="#2e7d32" className="profile-icon" />
          </div>
          
          <div className="input-box">
            <label>Name:</label>
            {editMode.name ? (
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            ) : (
              <span>{formData.name}</span>
            )}
            <button onClick={() => (editMode.name ? handleSaveClick("name") : handleEditClick("name"))}>
              {editMode.name ? <FaSave /> : <FaEdit />}
            </button>
          </div>

          <div className="input-box">
            <label>Email:</label>
            {editMode.email ? (
              <input type="text" name="email" value={formData.email} onChange={handleChange} />
            ) : (
              <span>{formData.email}</span>
            )}
            <button onClick={() => (editMode.email ? handleSaveClick("email") : handleEditClick("email"))}>
              {editMode.email ? <FaSave /> : <FaEdit />}
            </button>
          </div>

          <div className="input-box">
            <label>Phone Number:</label>
            {editMode.phone ? (
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            ) : (
              <span>{formData.phone}</span>
            )}
            <button onClick={() => (editMode.phone ? handleSaveClick("phone") : handleEditClick("phone"))}>
              {editMode.phone ? <FaSave /> : <FaEdit />}
            </button>
          </div>

          <div className="input-box">
            <label>Password:</label>
            {editMode.password ? (
              <input type="password" name="password" value={formData.password} onChange={handleChange} />
            ) : (
              <span>{formData.password}</span>
            )}
            <button onClick={() => (editMode.password ? handleSaveClick("password") : handleEditClick("password"))}>
              {editMode.password ? <FaSave /> : <FaEdit />}
            </button>
          </div>
        </div>

        <div className="profile-right">
          <div className="input-box">
            <label>Default Currency:</label>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="USD ($)">USD ($)</option>
              <option value="INR (₹)">INR (₹)</option>
            </select>
          </div>

          <div className="input-box">
            <label>Time Zone:</label>
            <select name="timezone" value={formData.timezone} onChange={handleChange}>
              <option value="GMT+05:30 Chennai">GMT+05:30 Chennai</option>
            </select>
          </div>

          <div className="input-box">
            <label>Language:</label>
            <select name="language" value={formData.language} onChange={handleChange}>
              <option value="English">English</option>
            </select>
          </div>

          <div className="button-container">
            <button className="save-btn">Save</button>
            <button className="delete-btn">
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
