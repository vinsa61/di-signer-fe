"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  interface UserData {
    message: string;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3001/api/data/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        router.push("/login");
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3001/api/data/update", {
        method: "PUT", // or "POST" based on your backend API
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update data");
      }

      const result = await response.json();
      alert("Changes saved successfully!");
      console.log("Updated data:", result);
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to save changes.");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-[#EDEDED] mb-6">Edit Profile</h1>
        <form>
          <div className="mb-4">
            <label className="block text-[#EDEDED] font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#3A3A3A] text-[#EDEDED] rounded-lg border border-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#EDEDED] font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#3A3A3A] text-[#EDEDED] rounded-lg border border-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#EDEDED] font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#3A3A3A] text-[#EDEDED] rounded-lg border border-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#EDEDED] font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              className="w-full p-2 bg-[#3A3A3A] text-[#EDEDED] rounded-lg border border-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-black text-[#EDEDED] border border-white transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-black text-[#EDEDED] border border-white transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
