'use client';
import { useEffect, useState } from 'react';

const Page = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    const setCookie = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const goldExValue = searchParams.get('gold-ex');

      if (!goldExValue) {
        setError('Missing "gold-ex" parameter in the URL.');
        return;
      }

      try {
        const [datePart] = goldExValue.split('-');
        if (!/^\d{8}$/.test(datePart)) {
          throw new Error('Invalid date format. Expected YYYYMMDD.');
        }

        const year = parseInt(datePart.substring(0, 4), 10);
        const month = parseInt(datePart.substring(4, 6), 10) - 1; // JS months are 0-based
        const day = parseInt(datePart.substring(6, 8), 10);

        const expirationDate = new Date(year, month, day);
        if (isNaN(expirationDate.getTime())) {
          throw new Error('Invalid date. Could not parse date.');
        }

        const currentDate = new Date();
        if (expirationDate < currentDate) {
          throw new Error('Expiration date must be in the future.');
        }

        document.cookie = `gold-ex=${goldExValue}; expires=${expirationDate.toUTCString()}; path=/`;

        navigation.navigate('/');
      } catch (err) {
        setError(err.message);
      }
    };

    setCookie();
  }, []);

  return (
    <div>
      <h1>Cookie</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Page;
