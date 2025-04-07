import React, { createContext, useState, useEffect } from "react";
import { getUserGroups } from "../services/GroupService";

export const GroupsContext = createContext();

export const GroupsProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const data = await getUserGroups();
      setGroups(data || []);
    } catch (err) {
      console.error("❌ Failed to fetch user groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <GroupsContext.Provider value={{ groups, setGroups, loading, refreshGroups: fetchGroups }}>
      {children}
    </GroupsContext.Provider>
  );
};
