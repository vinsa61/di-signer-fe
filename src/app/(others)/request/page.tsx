"use client";
import { useState, useEffect } from "react";

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchTerm) {
        setLoading(true);
        fetch(
          `http://localhost:3001/api/search/users?inputUsername=${searchTerm}`
        )
          .then((res) => res.json())
          .then((data) => {
            setResults(data.users || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchTerm]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search for users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input text-black"
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {results.map((user) => (
            <li key={user._id}>{user.username}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;
