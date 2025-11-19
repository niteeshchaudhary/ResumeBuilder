import React from "react";

const CountryCodeDropdown = ({ currentValue,onSelect }) => {
  const countryCodes = [
    { code: "+1", country: "USA" },
    { code: "+91", country: "India" },
    { code: "+44", country: "UK" },
    { code: "+61", country: "Australia" },
    { code: "+81", country: "Japan" },
    // Add more countries as needed
  ];
  console.log(currentValue,countryCodes.find((item) => item.code === currentValue)?.code,"*|*\n")

  const handleChange = (e) => {
    onSelect(e.target.value); // Call the parent's function with the selected code
  };

  return (
    <div className="flex flex-col items-center">
      
      <select
        id="country-code"
        onChange={handleChange}
        value={countryCodes.find((item) => item.code === currentValue)?.code}
        className="py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {countryCodes.map((item) => (
          <option key={item.code} value={item.code}>
            {item.country} ({item.code})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountryCodeDropdown;
