export default function ProfileManagement() {
   return (

      //Main Container for Profile Management Page
      <div className="min-h-screen flex justify-center py-16 bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
         <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl">

            <h1 className="text-4xl font-bold mb-6 text-gray-700 text-center">
               Profile Management
            </h1>

            {/* Grid Container */}
            <div className="grid grid-cols-2 gap-4 text-gray-700 ">

               {/* Grid Container Child 1 */}
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold">
                     Dietary Restrictions
                  </h2>
                  <h2 className="text-xs text-gray-400 mb-3">
                     (eg. allergies, religious restrictions, etc.)
                  </h2>

                  {/* Grid Container Child 1 - Selection */}
                  <div className="bg-white p-2 rounded-lg shadow-xl border-2 border-emerald-800  max-h-96 overflow-y-auto">

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>None</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Halal</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Vegan</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Vegetarian</span>
                     </label>
                  </div>
               </div>

               {/* Grid Container Child 2 */}
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold">
                     Dietary Preferences
                  </h2>
                  <h2 className="text-xs text-gray-400 mb-3">
                     (What you don&apos;t like to eat)
                  </h2>

                  {/* Grid Container Child 2 - Selection */}
                  <div className="bg-white p-2 rounded-lg shadow-xl border-2 border-emerald-800  max-h-96 overflow-y-auto">

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>None</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Tomatos</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Pickles</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>

                     <label className="flex items-center gap-4">
                        <input type="checkbox" className="h-8 w-4 accent-emerald-600" />
                        <span>Lettuce</span>
                     </label>
                  </div>
               </div>

            </div>

            <div className="flex justify-end items-end w-full mt-4 gap-2">

               <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300" type="submit">
                  Save
               </button>

               <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300" type="submit">
                  Cancel
               </button>

            </div>
         </div>
      </div>
   );
}