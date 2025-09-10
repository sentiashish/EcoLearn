import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api'; // Fixed import path
import toast from 'react-hot-toast';
import {
  CalculatorIcon,
  BoltIcon,
  TruckIcon,
  GlobeAltIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface CarbonData {
  electricity: number;
  carTravel: number;
  publicTransport: number;
  flights: number;
  heating: number;
  diet: string;
}

interface EmissionResult {
  total: number;
  breakdown: {
    electricity: number;
    transport: number;
    flights: number;
    heating: number;
    diet: number;
  };
  rating: string;
  suggestions: string[];
}

const CarbonFootprintCalculator: React.FC = () => {
  const [formData, setFormData] = useState<CarbonData>({
    electricity: 0,
    carTravel: 0,
    publicTransport: 0,
    flights: 0,
    heating: 0,
    diet: 'mixed'
  });

  const [result, setResult] = useState<EmissionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const emissionFactors = {
    electricity: 0.92, // kg CO2 per kWh
    carTravel: 0.12,   // kg CO2 per km
    publicTransport: 0.05, // kg CO2 per km
    shortFlight: 150,  // kg CO2 per flight
    longFlight: 1000,  // kg CO2 per flight
    heating: 0.2,      // kg CO2 per kWh
    diet: {
      vegan: 1.5,
      vegetarian: 2.5,
      mixed: 4.0,
      meatHeavy: 6.0
    }
  };

  const handleInputChange = (field: keyof CarbonData, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFootprint = async () => {
    setIsCalculating(true);
    
    try {
      // Prepare data for backend submission
      const backendData = {
        // Transportation
        car_distance: formData.carTravel,
        car_efficiency: 8.0, // Default efficiency
        public_transport_distance: formData.publicTransport,
        flights_short: formData.flights,
        flights_long: 0,
        
        // Energy
        electricity_usage: formData.electricity,
        heating_gas: formData.heating / 10, // Convert to cubic meters
        renewable_energy: false,
        
        // Lifestyle
        meat_consumption: formData.diet === 'vegan' ? 'none' : 
                         formData.diet === 'vegetarian' ? 'low' :
                         formData.diet === 'mixed' ? 'medium' : 'high',
        local_food: false,
        waste_recycling: true
      };

      // Submit to backend and get calculated results
      const backendResult = await apiService.createCarbonFootprint(backendData);
      
      // Use backend calculations if available, otherwise fall back to frontend calculations
      if (backendResult) {
        const suggestions = backendResult.recommendations || [];
        
        const emissionResult: EmissionResult = {
          total: backendResult.total_emissions,
          breakdown: {
            electricity: backendResult.energy_emissions,
            transport: backendResult.transport_emissions,
            flights: backendResult.transport_emissions * 0.3, // Approximate
            heating: backendResult.energy_emissions * 0.5, // Approximate
            diet: backendResult.lifestyle_emissions
          },
          rating: backendResult.eco_score > 80 ? 'Excellent' :
                  backendResult.eco_score > 60 ? 'Good' :
                  backendResult.eco_score > 40 ? 'Fair' : 'Poor',
          suggestions
        };
        
        setResult(emissionResult);
        toast.success('Carbon footprint calculated and saved!');
      } else {
        throw new Error('Failed to get results from backend');
      }
    } catch (error) {
      console.error('Backend calculation failed, using frontend calculation:', error);
      toast.error('Using offline calculation - please check your connection');
      
      // Fallback to original frontend calculation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate emissions using original logic
      const electricityEmissions = formData.electricity * emissionFactors.electricity;
      const carEmissions = formData.carTravel * emissionFactors.carTravel;
      const publicTransportEmissions = formData.publicTransport * emissionFactors.publicTransport;
      const flightEmissions = formData.flights * emissionFactors.shortFlight;
      const heatingEmissions = formData.heating * emissionFactors.heating;
      const dietEmissions = emissionFactors.diet[formData.diet as keyof typeof emissionFactors.diet] * 30;

      const transportTotal = carEmissions + publicTransportEmissions;
      const total = electricityEmissions + transportTotal + flightEmissions + heatingEmissions + dietEmissions;

      // Determine rating
      let rating = 'Excellent';
      if (total > 500) rating = 'Poor';
      else if (total > 300) rating = 'Fair';
      else if (total > 150) rating = 'Good';

      // Generate suggestions
      const suggestions = [];
      if (electricityEmissions > 100) suggestions.push('Consider switching to renewable energy sources');
      if (carEmissions > 50) suggestions.push('Try carpooling, public transport, or cycling more often');
      if (flightEmissions > 300) suggestions.push('Consider offsetting flight emissions or reducing air travel');
      if (dietEmissions > 100) suggestions.push('Consider reducing meat consumption');

      const emissionResult: EmissionResult = {
        total,
        breakdown: {
          electricity: electricityEmissions,
          transport: transportTotal,
          flights: flightEmissions,
          heating: heatingEmissions,
          diet: dietEmissions
        },
        rating,
        suggestions
      };

      setResult(emissionResult);
    }
    
    setIsCalculating(false);
  };

  const resetCalculator = () => {
    setFormData({
      electricity: 0,
      carTravel: 0,
      publicTransport: 0,
      flights: 0,
      heating: 0,
      diet: 'mixed'
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <CalculatorIcon className="h-10 w-10 text-green-600 mr-3" />
            Carbon Footprint Calculator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Calculate your monthly carbon emissions and discover ways to reduce your environmental impact
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
              Your Monthly Usage
            </h2>

            <div className="space-y-6">
              {/* Electricity */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <BoltIcon className="h-4 w-4 text-yellow-500 mr-2" />
                  Electricity Usage (kWh)
                </label>
                <input
                  type="number"
                  value={formData.electricity}
                  onChange={(e) => handleInputChange('electricity', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 300"
                />
              </div>

              {/* Car Travel */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <TruckIcon className="h-4 w-4 text-blue-500 mr-2" />
                  Car Travel (km)
                </label>
                <input
                  type="number"
                  value={formData.carTravel}
                  onChange={(e) => handleInputChange('carTravel', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 500"
                />
              </div>

              {/* Public Transport */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <TruckIcon className="h-4 w-4 text-green-500 mr-2" />
                  Public Transport (km)
                </label>
                <input
                  type="number"
                  value={formData.publicTransport}
                  onChange={(e) => handleInputChange('publicTransport', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 200"
                />
              </div>

              {/* Flights */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <GlobeAltIcon className="h-4 w-4 text-purple-500 mr-2" />
                  Flights this Month
                </label>
                <select
                  value={formData.flights}
                  onChange={(e) => handleInputChange('flights', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3+</option>
                </select>
              </div>

              {/* Heating */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <BoltIcon className="h-4 w-4 text-orange-500 mr-2" />
                  Heating/Cooling (kWh)
                </label>
                <input
                  type="number"
                  value={formData.heating}
                  onChange={(e) => handleInputChange('heating', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 150"
                />
              </div>

              {/* Diet */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <ChartBarIcon className="h-4 w-4 text-red-500 mr-2" />
                  Diet Type
                </label>
                <select
                  value={formData.diet}
                  onChange={(e) => handleInputChange('diet', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="mixed">Mixed Diet</option>
                  <option value="meatHeavy">Meat Heavy</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={calculateFootprint}
                  disabled={isCalculating}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Footprint'}
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-green-600 mr-2" />
              Your Carbon Footprint
            </h2>

            {result ? (
              <div className="space-y-6">
                {/* Total Emissions */}
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {result.total.toFixed(1)} kg
                  </div>
                  <div className="text-gray-600 mb-2">CO₂ per month</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    result.rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                    result.rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                    result.rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.rating}
                  </div>
                </div>

                {/* Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Emission Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(result.breakdown).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="capitalize text-gray-600">{category}</span>
                        <span className="font-semibold">{amount.toFixed(1)} kg</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-600">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalculatorIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Fill in your usage data and click "Calculate Footprint" to see your results</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintCalculator;
