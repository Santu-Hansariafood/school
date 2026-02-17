 "use client"

 import React from "react"

 const Pagination = ({ currentPage, pageSize, totalItems, onPageChange }) => {
   if (!totalItems || totalItems <= 0) return null

   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
   const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages)
   const startItem = (safeCurrent - 1) * pageSize + 1
   const endItem = Math.min(totalItems, safeCurrent * pageSize)
   const canPrev = safeCurrent > 1
   const canNext = safeCurrent < totalPages

   const handlePrev = () => {
     if (canPrev) onPageChange(safeCurrent - 1)
   }

   const handleNext = () => {
     if (canNext) onPageChange(safeCurrent + 1)
   }

   return (
     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-gray-700">
       <p>
         Showing <span className="font-medium">{startItem}</span>-
         <span className="font-medium">{endItem}</span> of{" "}
         <span className="font-medium">{totalItems}</span> students
       </p>
       <div className="inline-flex items-center gap-2">
         <button
           type="button"
           onClick={handlePrev}
           disabled={!canPrev}
           className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
             canPrev
               ? "border-gray-300 text-gray-700 hover:bg-gray-50"
               : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
           }`}
         >
           Previous
         </button>
         <span className="text-xs text-gray-500">
           Page <span className="font-semibold">{safeCurrent}</span> of{" "}
           <span className="font-semibold">{totalPages}</span>
         </span>
         <button
           type="button"
           onClick={handleNext}
           disabled={!canNext}
           className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
             canNext
               ? "border-gray-300 text-gray-700 hover:bg-gray-50"
               : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
           }`}
         >
           Next
         </button>
       </div>
     </div>
   )
 }

 export default Pagination

