// Shared Design Styles
// Keep these consistent across all pages
// This is a simple design system for beginners

export const formStyles = {
  // Input field styling
  input: "w-full bg-stone-50 border-2 border-stone-800 rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#1c1917] transition-all",
  
  // Label styling
  label: "block text-xs font-black uppercase tracking-widest text-stone-800 mb-2",
  
  // Primary button (submit, login, register, etc.)
  button: "w-full py-4 border-2 border-stone-900 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-sm font-black uppercase tracking-widest text-stone-900 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1c1917] active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:cursor-wait disabled:bg-stone-300 disabled:hover:-translate-y-0 disabled:hover:shadow-none",
  
  // Secondary / action button
  secondaryButton: "flex-1 py-4 border-2 border-stone-900 rounded-xl text-xs font-black uppercase tracking-widest text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer",
  
  // Danger button
  dangerButton: "flex-1 py-2 border-2 border-red-200 bg-red-50 rounded-xl text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors cursor-pointer",

  // Error message box
  errorBox: "bg-red-100 border-2 border-red-900 text-red-900 px-4 py-3 rounded-xl mb-4 text-sm font-bold shadow-[4px_4px_0px_#7f1d1d]",
  
  // Success message box
  successBox: "bg-emerald-100 border-2 border-emerald-900 text-emerald-900 px-4 py-3 rounded-xl mb-4 text-sm font-bold shadow-[4px_4px_0px_#14532d]",

  // Link styling
  link: "text-orange-600 hover:text-orange-500 font-bold underline transition-colors",

  // Helper text styling
  helperText: "text-center text-xs font-black uppercase tracking-widest text-stone-500 mt-6",

  // List Item styling
  cardListItem: "p-5 border-2 border-stone-200 bg-white rounded-2xl cursor-pointer transition-all hover:border-stone-900 hover:shadow-[4px_4px_0px_#1c1917] hover:-translate-y-1 text-stone-900 w-full text-left",
};

// Page layout styles
export const layoutStyles = {
  // Full page container
  pageContainer: "min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-orange-200 flex flex-col items-center justify-center p-6",
  
  // Form card/box
  formCard: "bg-white border-2 border-stone-900 rounded-[28px] p-8 md:p-12 shadow-[8px_8px_0px_#1c1917] w-full max-w-md relative",
  
  // Page title
  pageTitle: "text-3xl font-black mb-8 text-stone-900 uppercase tracking-wide border-b-4 border-stone-900 pb-4 inline-block",
};
