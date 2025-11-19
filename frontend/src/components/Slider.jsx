const Slider = ({ min, max, step, label }) => {
    const [value, setValue] = useState((min + max) / 2);
  
    const handleChange = (e) => {
      setValue(e.target.value);
    };
  
    return (
      <div className="flex flex-col items-center w-full max-w-md p-4 bg-gray-100 rounded-lg shadow">
        <label className="mb-2 text-lg font-medium text-gray-700">{label}</label>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="mt-2 text-gray-700">Value: {value}</span>
      </div>
    );
  };

  export default Slider;