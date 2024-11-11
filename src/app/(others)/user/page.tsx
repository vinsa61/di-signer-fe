"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  interface UserData {
    message: string;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  }


  const [userData, setUserData] = useState<UserData | null>(null); // Set initial state to null
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch("http://localhost:3001/api/data/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the header
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push('/login');
          throw new Error('Unauthorized');
        }
        // console.log(response.json);
        return response.json();
      })
      .then((data) => {
        console.log(data); // Log the data for debugging
        setUserData(data); // Set the entire response data to `userData`
        setIsLoading(false); // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.error(error);
        router.push('/login');
      });
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render user data safely, handling cases where `userData` might still be null
  return (
    <div>
      <h1>{userData?.message || 'Welcome'}</h1>
      <p>ID: {userData?._id || 'Not available'}</p>
      <p>First Name: {userData?.firstName || 'Not available'}</p>
      <p>Last Name: {userData?.lastName || 'Not available'}</p>
      <p>Email: {userData?.email || 'Not available'}</p>
      <p>Username: {userData?.username || 'Not available'}</p>
    </div>
  );
};

export default DashboardPage;
