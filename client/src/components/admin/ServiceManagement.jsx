import { useState } from "react";

export default function ServiceManagement() {
  const [service, setService] = useState({
    name: "",
    description: "",
    expectedDuration: "",
    priority: "low"
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!service.name) {
      newErrors.name = "Service name is required";
    } else if (service.name.length > 100) {
      newErrors.name = "Service name must be 100 characters or less";
    }

    if (!service.description) {
      newErrors.description = "Description is required";
    }

    if (!service.expectedDuration) {
      newErrors.expectedDuration = "Expected duration is required";
    } else if (parseInt(service.expectedDuration) <= 0) {
      newErrors.expectedDuration = "Duration must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (validate()) {
      setSuccessMessage("Service saved successfully!");
      // Reset form
      setTimeout(() => {
        setService({
          name: "",
          description: "",
          expectedDuration: "",
          priority: "low"
        });
        setSuccessMessage("");
      }, 2000);
    }
  };

  const reset = () => {
    setService({
      name: "",
      description: "",
      expectedDuration: "",
      priority: "low"
    });
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <div className="px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Service Management</h2>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create New Service</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new service to the queue system</p>
          </div>

          <form onSubmit={save} className="p-6 space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Service Name */}
            <div>
              <label htmlFor="service-name" className="block text-sm font-medium text-gray-700 mb-1">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                id="service-name"
                type="text"
                placeholder="e.g., Customer Support, Technical Help"
                value={service.name}
                onChange={e => setService({ ...service, name: e.target.value })}
                className={`block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{service.name.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="service-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="service-description"
                rows={4}
                placeholder="Describe what this service provides..."
                value={service.description}
                onChange={e => setService({ ...service, description: e.target.value })}
                className={`block w-full px-3 py-2 border ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Expected Duration and Priority - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expected Duration */}
              <div>
                <label htmlFor="expected-duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  id="expected-duration"
                  type="number"
                  min="1"
                  placeholder="e.g., 15"
                  value={service.expectedDuration}
                  onChange={e => setService({ ...service, expectedDuration: e.target.value })}
                  className={`block w-full px-3 py-2 border ${
                    errors.expectedDuration ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.expectedDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.expectedDuration}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  id="priority"
                  value={service.priority}
                  onChange={e => setService({ ...service, priority: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            {/* Priority Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">About Priority Levels</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Priority determines the queue ordering. High priority services are served first, 
                    followed by medium and low priority services.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Save Service
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        {(service.name || service.description) && (
          <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {service.name || "Service Name"}
              </h4>
              <p className="text-gray-600 mb-3">
                {service.description || "Service description will appear here..."}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.expectedDuration || 0} min
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  service.priority === 'high' ? 'bg-red-100 text-red-800' :
                  service.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {service.priority} priority
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}