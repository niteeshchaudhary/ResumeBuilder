// UpgradeButton.jsx
import { useState, useEffect } from 'react';
import axios from '../assets/AxiosConfig';
import { useNavigate } from 'react-router-dom';

// Plan card UI component
export const PlanCard = ({ plan, isCurrent, isSelectable, selected, onSelect }) => (
  <div
    onClick={isSelectable ? () => onSelect(plan) : undefined}
    className={`p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm ${selected
      ? 'border-blue-600 bg-blue-50'
      : isCurrent
        ? 'border-green-500 bg-green-50'
        : isSelectable
          ? 'border-gray-200 hover:border-blue-400 cursor-pointer'
          : 'border-gray-100 bg-gray-50 opacity-75 cursor-not-allowed'
      }`}
  >
    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
    <p className="text-2xl font-bold text-blue-700 mb-4">₹{plan.price_month}/mo</p>
    <div className="text-sm text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: plan.features }} />
    {isCurrent && <span className="text-green-600 font-medium">Current Plan</span>}
  </div>
);

// Discount card UI component
const DiscountCard = ({ ind, discount, selected, selectedPlan, onSelect }) => {
  const discountLabels = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
  const discountSuffix = ['mo', '3 mo', '6 mo', 'yr'];

  return (
    <div
      onClick={() => onSelect(ind)}
      className={`p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm ${selected
        ? 'border-blue-600 bg-blue-50'
        : 'border-gray-200 hover:border-blue-400 cursor-pointer'
        }`}
    >
      <h3 className="text-lg font-semibold mb-2">{discountLabels[ind]}</h3>
      <p className="text-2xl font-bold text-blue-700 mb-4">₹{selectedPlan[discount]} / {discountSuffix[ind]}</p>
      <div className="text-sm text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: selectedPlan?.features }} />
    </div>
  );
};

export default function UpgradeButton({ usertype }) {
  const [showModal, setShowModal] = useState(0);
  const navigator = useNavigate();
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const discounts = ['price_month', 'price_qyear', 'price_hyear', 'price_year'];

  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.post('/get_plans/', { usertype });
        setPlans(response.data.plans);
        setCurrentPlanId(response.data.active_plan);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    if (showModal === 1) fetchPlans();
  }, [showModal]);

  const directToCheckout = () => {
    navigator(`/${usertype}/checkout`, {
      state: {
        id: selectedPlan?.id,
        name: selectedPlan?.name,
        price: Number(selectedPlan[discounts[selectedDiscount]]),
        level: selectedPlan?.level,
        discount: discounts[selectedDiscount],
      },
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(1)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Upgrade Plan
      </button>

      {showModal === 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-lg relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Upgrade Your Plan</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {plans.map((plan, index) => {
                const isCurrent = plan.id === currentPlanId;
                const currentLevel = plans.find((p) => p.id === currentPlanId)?.level || 0;
                const isSelectable = plan.level > currentLevel;
                return (
                  <label
                    key={index}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${isCurrent ? 'border-blue-600 bg-blue-50' : isSelectable ? 'border-gray-200' : 'border-gray-100 bg-gray-100'
                      }`}
                    onClick={() => {
                      if (!isCurrent && isSelectable)
                        setSelectedPlan(plan.id)
                    }
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{plan.name}{isCurrent ? <span className='text-blue-600 text-sm'> : Current Plan</span> : ""}</h3>
                      <input
                        type="radio"
                        name="plan"
                        disabled={!isSelectable}
                        className="form-radio text-blue-600"
                        checked={selectedPlan?.id === plan.id}
                        onChange={() => setSelectedPlan(plan)}
                      />
                    </div>
                    <p className="text-gray-500 mb-4">₹{plan.price_month} / month</p>

                    <ul className="space-y-2 text-sm text-gray-700">
                      {plan.features
                        .split(';')
                        .filter((line) => line.trim() !== '')
                        .map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414L8.414 15H6v-2.414l8.293-8.293a1 1 0 011.414 0z" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                    </ul>
                  </label>
                )
              })}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowModal(0)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(2)}
                disabled={!selectedPlan}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}


      {showModal === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ maxHeight: "100vh", zIndex: 1000 }}>
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-6">Choose Billing Period</h2>

            <div className="mb-6">
              <label htmlFor="billingSelect" className="block mb-2 font-medium text-gray-700">Billing Frequency</label>
              <select
                id="billingSelect"
                className="w-full border rounded-lg px-4 py-2"
                value={selectedDiscount}
                onChange={(e) => setSelectedDiscount(parseInt(e.target.value))}
              >
                <option value={0}>Monthly</option>
                <option value={1}>Quarterly (3 Months)</option>
                <option value={2}>Half-Yearly (6 Months)</option>
                <option value={3}>Yearly</option>
              </select>
            </div>

            {selectedPlan && (
              <div className="p-6 border rounded-lg bg-blue-50 shadow-sm">
                <h3 className="text-xl font-bold mb-2">{selectedPlan.name} Plan</h3>

                <div className="text-gray-700 mb-4">
                  {selectedPlan.features
                    .split(';')
                    .filter((line) => line.trim() !== '')
                    .map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414L8.414 15H6v-2.414l8.293-8.293a1 1 0 011.414 0z" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                </div>

                <div className="text-lg">
                  {(() => {
                    const discountKey = discounts[selectedDiscount];
                    const originalPrice = selectedPlan?.price_month * [1, 3, 6, 12][selectedDiscount];
                    const discountedPrice = parseFloat(selectedPlan[discountKey]);
                    const percentageOff = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

                    return (
                      <div className="mt-4">
                        <p className="text-gray-500 line-through">₹{originalPrice.toFixed(2)}</p>
                        <p className="text-2xl font-bold text-blue-600">₹{discountedPrice.toFixed(2)}</p>
                        <p className="text-green-600 font-medium">Save {percentageOff}%</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={directToCheckout}
                disabled={!selectedPlan}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
