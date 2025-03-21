import React, { useState, useEffect } from "react";
import { FaUserAlt, FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../../services/userService";
import { jwtDecode } from "jwt-decode";
import "./Profile.css";

// ✅ Function to get JWT token
const getAuthToken = () => {
    return localStorage.getItem("token");
};

const Profile = () => {
    const [userId, setUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [editMode, setEditMode] = useState({
        name: false,
        email: false,
        phone: false,
    });

    // ✅ Decode token and set userId (_id from MongoDB)
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("🔍 Decoded Token:", decoded); // Debugging
    
                // Extract `id` instead of `_id`
                const extractedUserId = decoded.id;  // Ensure this matches backend structure
    
                if (!extractedUserId) {
                    throw new Error("❌ User ID not found in decoded token.");
                }
    
                setUserId(extractedUserId);
            } catch (error) {
                console.error("❌ Error decoding token:", error);
            }
        }
    }, []);
    
    
    
  

    // ✅ Fetch user data when userId is available
    useEffect(() => {
        if (userId) {
            setFormData({ name: "", email: "", phone: "" }); // Reset state before fetching
            fetchUserData(userId);
        }
    }, [userId]);
    

    // ✅ Fetch user data from backend
    const fetchUserData = async (id) => {
        try {
            console.log("🔎 Fetching User Data for ID:", id); // Debugging
            const userData = await getUserProfile(id);
            console.log("✅ Fetched User Data:", userData); // Debugging
            setFormData(userData); // Update state with correct data
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
        }
    };
    
    const handleEditClick = (field) => {
        setEditMode({ ...editMode, [field]: true });
    };

    const handleSaveClick = async (field) => {
        setEditMode({ ...editMode, [field]: false });

        try {
            await updateUserProfile(userId, formData);
            alert("✅ Profile updated successfully!");
        } catch (error) {
            console.error("❌ Error updating profile:", error);
        }
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
                        <label>Phone:</label>
                        {editMode.phone ? (
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        ) : (
                            <span>{formData.phone || "N/A"}</span>
                        )}
                        <button onClick={() => (editMode.phone ? handleSaveClick("phone") : handleEditClick("phone"))}>
                            {editMode.phone ? <FaSave /> : <FaEdit />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
