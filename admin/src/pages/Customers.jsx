import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Customers = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        backendUrl + "/api/user/list",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        toast.error(response.data.message || "Failed to load customers");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Customers</h1>
        <button
          onClick={fetchUsers}
          className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading customers...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-600">No customers found.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Provider</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{user.name || "-"}</td>
                  <td className="px-4 py-3">{user.email || "-"}</td>
                  <td className="px-4 py-3 capitalize">
                    {user.authProvider || "local"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

Customers.propTypes = {
  token: PropTypes.string.isRequired,
};

export default Customers;
