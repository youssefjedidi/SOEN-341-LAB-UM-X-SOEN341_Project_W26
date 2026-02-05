// Shared Design Styles
// Keep these consistent across all pages
// This is a simple design system for beginners

export const formStyles = {
  // Input field styling
  input: "w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500",
  
  // Label styling
  label: "block text-base font-semibold text-gray-700 mb-2",
  
  // Primary button (submit, login, register, etc.)
  button: "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Error message box
  errorBox: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4",
  
  // Success message box
  successBox: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4",
};

// Page layout styles
export const layoutStyles = {
  // Full page container (centered, gradient background)
  pageContainer: "min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100",
  
  // Form card/box
  formCard: "bg-white p-8 rounded-lg shadow-lg w-full max-w-md",
  
  // Page title
  pageTitle: "text-2xl font-bold mb-6 text-gray-900 text-center",
};
