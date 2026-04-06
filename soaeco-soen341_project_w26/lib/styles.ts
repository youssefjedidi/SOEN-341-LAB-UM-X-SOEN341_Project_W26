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

  // Shared spacing wrapper for stacked status messages
  statusMessage: "mb-4",

  // Link styling
  link: "text-orange-600 hover:text-orange-500 font-bold underline transition-colors",

  // Helper text styling
  helperText: "text-center text-xs font-black uppercase tracking-widest text-stone-500 mt-6",

  // List Item styling
  cardListItem: "p-5 border-2 border-stone-200 bg-white rounded-2xl cursor-pointer transition-all hover:border-stone-900 hover:shadow-[4px_4px_0px_#1c1917] hover:-translate-y-1 text-stone-900 w-full text-left",

  statText:
    "text-xs font-black uppercase tracking-widest text-stone-700",

  helperStatText:
    "text-[10px] font-black uppercase tracking-widest text-stone-500",

  inputSuffix:
    "absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold pointer-events-none",

};

// Page layout styles
export const layoutStyles = {
  // Full page container
  pageContainer: "min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-orange-200 flex flex-col items-center justify-center p-6 pt-28",

  // Form card/box
  formCard: "bg-white border-2 border-stone-900 rounded-[28px] p-8 md:p-12 shadow-[8px_8px_0px_#1c1917] w-full max-w-md relative",

  // Page title
  pageTitle: "text-3xl font-black mb-8 text-stone-900 uppercase tracking-wide border-b-4 border-stone-900 pb-4 inline-block",

  // Navigation Container (Fixed at top-right)
  navContainer: "fixed top-6 right-6 z-50 bg-stone-50 border-2 border-stone-900 p-2 rounded-2xl shadow-[4px_4px_0px_#1c1917] flex gap-2",

  // Navigation Items
  navBase: "px-4 py-3 text-center text-[10px] md:text-xs font-black uppercase tracking-widest transition-all rounded-xl",
  navActive: "bg-stone-900 border-2 border-stone-900 text-white shadow-[2px_2px_0px_#E2725B] -translate-y-1",
  navInactive: "bg-white border-2 border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900 hover:shadow-[2px_2px_0px_#1c1917] hover:-translate-y-1",

  //Added for Weekly PLanner - not sure if we want to keep these in styles.ts or just inline them
  contentWrapper: "w-full max-w-7xl mx-auto",

  sectionSpacing: "mt-8",

  responsiveTableWrapper: "overflow-x-auto pb-4",

  plannerGrid: "min-w-[1100px] grid grid-cols-8 border-2 border-stone-900 rounded-[28px] overflow-hidden shadow-[8px_8px_0px_#1c1917] bg-white",

  plannerHeaderCell: "border-b-2 border-r-2 border-stone-900 bg-emerald-500 p-4 flex items-center justify-center",

  plannerDayHeaderCell: "border-b-2 border-r-2 last:border-r-0 border-stone-900 bg-emerald-500 p-4 flex items-center justify-center text-center",

  modalOverlay: "fixed inset-0 bg-stone-900/40 z-40",

  modalWrapper: "fixed inset-0 z-50 flex items-center justify-center p-6",

  modalCard: "bg-white border-2 border-stone-900 rounded-[28px] p-8 w-full max-w-md shadow-[8px_8px_0px_#1c1917] relative",

  modalTitle: "text-2xl font-black uppercase tracking-wide text-stone-900 inline-block",

  modalSubtext: "mt-4 text-sm font-bold text-stone-700",

  modalContent: "mt-6 flex flex-col gap-3 max-h-80 overflow-y-auto pr-1",

  modalActions: "mt-6 flex gap-3",

  weeklyRowLabel:
    "border-t-2 border-r-2 border-stone-900 bg-stone-100 p-4 flex items-center justify-center text-center",

  weeklyCell:
    "col-span-7 border-t-2 border-stone-900 bg-[#FDFBF7] p-4 flex flex-col gap-3 justify-center",

  progressBarContainer:
    "h-3 w-full overflow-hidden rounded-full bg-stone-200",
};
