import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MonthYearPicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
        <>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholderText="Select Month and Year"
      />
      {selectedDate && (
        <p className="mt-4 text-gray-700">
          Selected: {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selectedDate)}
        </p>
      )}
      </>
  );
};

export default MonthYearPicker;
