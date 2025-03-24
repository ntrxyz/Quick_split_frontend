import React, { useState, useEffect } from "react";
import { FaUserAlt, FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../../services/userService";
import { jwtDecode } from "jwt-decode";
import "./Profile.css";

// ✅ Function to get JWT token
const getAuthToken = () => {
    return localStorage.getItem("authToken");
};

const Profile = () => {
    const [userId, setUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [editMode, setEditMode] = useState({
        name: false,
        email: false,
       password: false,
    });

    const [loading, setLoading] = useState(true); // ✅ Added loading state
    const [error, setError] = useState(null); // ✅ Added error state

    // ✅ Decode token and extract userId (_id from MongoDB)
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("🔍 Decoded Token:", decoded);

                const extractedUserId = decoded._id || decoded.id || decoded.userId || decoded.sub;
                if (!extractedUserId) {
                    throw new Error("❌ User ID not found in decoded token.");
                }

                setUserId(extractedUserId);
            } catch (error) {
                console.error("❌ Error decoding token:", error);
                setError("Failed to decode user token.");
            }
        } else {
            setError("No authentication token found.");
        }
    }, []);

    // ✅ Fetch user data when userId is available
    useEffect(() => {
        if (userId) {
            fetchUserData(userId);
        }
    }, [userId]);

    // ✅ Fetch user data from backend
    const fetchUserData = async (id) => {
        try {
            setLoading(true);
            const response = await getUserProfile(id);
            console.log("✅ Fetched User Data:", response);

            const userData = response.user || response;

            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                password: "**********",
            });

            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
            setError("Failed to fetch user data.");
            setLoading(false);
        }
    };

    const handleEditClick = (field) => {
        setEditMode({ ...editMode, [field]: true });
    };

    const handleDeleteClick = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    
        if (confirmDelete) {
            try {
                await deleteUserAccount(userId);
                alert("✅ Account deleted successfully!");
                localStorage.removeItem("authToken"); // Remove token from storage
                window.location.href = "/login"; // Redirect to login page after deletion
            } catch (error) {
                console.error("❌ Error deleting account:", error);
                setError("Failed to delete account.");
            }
        }
    };
    

    const handleSaveClick = async (field) => {
        setEditMode({ ...editMode, [field]: false });

        try {
            await updateUserProfile(userId, formData);
            alert("✅ Profile updated successfully!");
        } catch (error) {
            console.error("❌ Error updating profile:", error);
            setError("Failed to update profile.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    // ✅ Display error message if something goes wrong
    if (error) return <p className="error-message">❌ {error}</p>;

    return (
        <div className="profile-container">
            <h2>Your Account</h2>
            {loading ? (
                <p>Loading profile...</p>
            ) : (
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
                            <label>Password:</label>
                            {editMode.password ? (
                                <input type="text" name="phone" value={formData.password} onChange={handleChange} />
                            ) : (
                                <span>{formData.password || "N/A"}</span>
                            )}
                            <button onClick={() => (editMode.phone ? handleSaveClick("password") : handleEditClick("password"))}>
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
             <button className="delete-btn" onClick={handleDeleteClick}>
              <FaTrash />
             </button>
           </div>
         </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
