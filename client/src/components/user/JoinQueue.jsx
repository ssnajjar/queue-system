import { useState } from "react";
import { services } from "../../data/mockData";

export default function JoinQueue() {
  const [selected, setSelected] = useState(null);
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    setJoined(true);
    alert("Successfully joined the queue!");
  };

  const handleLeave = () => {
    setJoined(false);
    setSelected(null);
    alert("Left the queue");
  };

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Join Queue</h2>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="mb-6">
            <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select a Service
            </label>
            <select
              id="service-select"
              onChange={e => {
                const service = services.find(s => s.id == e.target.value);
                setSelected(service);
                setJoined(false);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {!s.isOpen && "(Closed)"}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="space-y-6">
              {/* Service Information */}
              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{selected.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">Estimated Wait</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(selected.queue?.length || 0) * (selected.expectedDuration || 10)} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">People in Queue</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selected.queue?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">Status</p>
                      <p className={`text-lg font-semibold ${selected.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                        {selected.isOpen ? 'Open' : 'Closed'}
                      </p>
                    </div>
                  </div>
                </div>

                {selected.description && (
                  <p className="mt-4 text-sm text-gray-700">{selected.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {!joined ? (
                  <button
                    onClick={handleJoin}
                    disabled={!selected.isOpen}
                    className={`flex-1 py-3 px-4 rounded-md text-white font-medium transition-colors ${
                      selected.isOpen
                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Join Queue
                  </button>
                ) : (
                  <button
                    onClick={handleLeave}
                    className="flex-1 py-3 px-4 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Leave Queue
                  </button>
                )}
              </div>

              {joined && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Successfully joined the queue!
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        You'll be notified when it's your turn.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!selected && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No service selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a service from the dropdown to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}