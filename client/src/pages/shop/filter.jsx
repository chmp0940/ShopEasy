import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { filterOptions } from "@/config";
import React from "react";

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 h-fit sticky top-24">
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-t-2xl">
        <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
          Filters
        </h2>
      </div>
      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Object.keys() extracts property names from filterOptions object */}
        {/* filterOptions = { category: [...], brand: [...] } */}
        {/* Object.keys(filterOptions) returns ["category", "brand"] */}
        {Object.keys(filterOptions).map((keyItems, index) => (
          <div key={keyItems}>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-800 capitalize">
                {keyItems}
              </h3>
              <div className="grid gap-3">
                {filterOptions[keyItems].map((option) => (
                  <Label
                    key={option.id}
                    className="flex items-center gap-3 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer p-2 rounded-lg hover:bg-blue-50/50"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItems] &&
                        filters[keyItems].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItems, option.id)}
                      className="border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-orange-500 data-[state=checked]:border-none"
                    />
                    <span className="select-none">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
            {index < Object.keys(filterOptions).length - 1 && (
              <Separator className="mt-6 bg-gradient-to-r from-blue-200 via-orange-200 to-yellow-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// ********IMP ***********
// Work flow

// 1. Initial:        filters = {}                        → Checkbox: UNCHECKED ❌
// 2. User clicks:    onCheckedChange triggered           → handleFilter runs
// 3. Update:         filters = { category: ["men"] }     → Checkbox: CHECKED ✅
// 4. User clicks:    onCheckedChange triggered again     → handleFilter removes option
// 5. Update:         filters = {}                        → Checkbox: UNCHECKED ❌

export default ProductFilter;
