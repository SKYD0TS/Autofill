"use client"

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const GoogleFormAccess = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (session && session?.accessToken) {
      const fetchGoogleForm = async () => {
        try {
          const res = await fetch(`/api/google-form?accessToken=${session.accessToken}`);
          const data = await res.json();
          setFormData(data);
        } catch (error) {
          console.error('Error fetching form data:', error);
        }
      };

      fetchGoogleForm();
    }
  }, [session]);

  return (
    <div>
      <p>{session?.user.name??"null"}</p>
      {formData ? (
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      ) : (
        <p>Loading form data...</p>
      )}
    </div>
  );
};

export default GoogleFormAccess;
