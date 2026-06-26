"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  itemsPerPage?: number;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  label,
  className,
  itemsPerPage = 8,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  useEffect(() => {
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOptions(filtered);
    setCurrentPage(1);
  }, [searchQuery, options]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setCurrentPage(1);
    } else {
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOptions = filteredOptions.slice(startIndex, endIndex);

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("all");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-slate-50 border-slate-200 hover:bg-slate-100 text-sm font-normal px-3 py-2.5 h-auto min-h-[42px]",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {label && (
              <span className="text-xs text-slate-500 font-medium flex-shrink-0">
                {label}:
              </span>
            )}
            <span className="truncate">
              {value === "all" ? (
                <span className="text-slate-500">{placeholder}</span>
              ) : (
                <span className="text-slate-800 font-medium">{value}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {value !== "all" && (
              <X
                className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 bg-white border-slate-200 shadow-lg rounded-xl" 
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 py-2 h-9 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[280px] overflow-y-auto p-1">
            {currentOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No options found
              </div>
            ) : (
              <div className="space-y-0.5">
                {currentOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      value === option
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <span className="truncate">{option}</span>
                    {value === option && (
                      <Check className="h-4 w-4 text-violet-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredOptions.length > itemsPerPage && (
            <div className="flex items-center justify-between p-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {filteredOptions.length} items
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2 text-xs border-slate-200 hover:bg-slate-50"
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-500 px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2 text-xs border-slate-200 hover:bg-slate-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}