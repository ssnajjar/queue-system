import { useState, useEffect } from "react";

export default function QueueStatus() {
  const [position, setPosition] = useState(2);
  const [estimatedWait, setEstimatedWait] = useState(20);
  const [status, setStatus] = useState("waiting");

  // Mock progress update
  useEffect(() => {
    const interval = setInterval(() => {
      setEstimatedWait(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    if (position === 1) {
      return {
        text: "You're Next!",
        color: "green",
        icon: "check"
      };
    } else if (position <= 3) {
      return {
        text: "Almost Ready",
        color: "yellow",
        icon: "clock"
      };
    } else {
      return {
        text: "Waiting",
        color: "blue",
        icon: "hourglass"
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Queue Status</h2>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Status Header */}
          <div className={`p-6 ${
            statusInfo.color === 'green' ? 'bg-green-50 border-b border-green-200' :
            statusInfo.color === 'yellow' ? 'bg-yellow-50 border-b border-yellow-200' :
            'bg-blue-50 border-b border-blue-200'
          }`}>
            <div className="flex items-center justify-center space-x-3">
              {statusInfo.icon === 'check' && (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusInfo.icon === 'clock' && (
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusInfo.icon === 'hourglass' && (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <h3 className={`text-2xl font-bold ${
                statusInfo.color === 'green' ? 'text-green-800' :
                statusInfo.color === 'yellow' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {statusInfo.text}
              </h3>
            </div>
          </div>

          {/* Queue Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Position */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Your Position</p>
                <p className="text-4xl font-bold text-gray-900">{position}</p>
              </div>

              {/* Estimated Wait */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Estimated Wait</p>
                <p className="text-4xl font-bold text-gray-900">{estimatedWait}</p>
                <p className="text-sm text-gray-500">minutes</p>
              </div>

              {/* People Ahead */}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">People Ahead</p>
                <p className="text-4xl font-bold text-gray-900">{position - 1}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.max(0, 100 - (position * 10))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, 100 - (position * 10))}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              <button className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                Refresh Status
              </button>
              <button className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                Leave Queue
              </button>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You'll receive a notification when it's your turn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}