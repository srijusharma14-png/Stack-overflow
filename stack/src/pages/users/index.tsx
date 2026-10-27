import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/MainLayout";
import axiosInstance from "@/lib/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/user/getalluser");
        // Ensure you handle array payloads cleanly safely
        
setUsers(
  Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data?.users)
        ? response.data.users
        : []
);

      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Mainlayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map((user) => (
              <div key={user._id} className="border p-4 rounded-lg bg-white shadow-sm flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-blue-600 hover:underline">
                    <Link href={`/users/${user._id}`}>{user.name}</Link>
                  </h3>
                  <p className="text-gray-500 text-sm">@{user.username || 'user'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
