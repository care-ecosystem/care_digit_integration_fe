import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18NNAMESPACE } from "@/lib/constants";
import { apis } from "@/apis";
import type { Facility } from "@/types/facility";

interface FacilityDropdownProps {
  value: string;
  onChange: (id: string, name: string) => void;
  /** Pre-filter the list to only these facility IDs (optional) */
  allowedIds?: string[];
}

export function FacilityDropdown({
  value,
  onChange,
  allowedIds,
}: FacilityDropdownProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch facilities dynamically from care's /api/v1/facility/ endpoint
  const { data, isLoading, isError } = useQuery({
    queryKey: ["facilities", search],
    queryFn: () =>
      apis.facilities.list({ search: search || undefined, limit: 100 }),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const allFacilities: Facility[] = data?.results ?? [];

  const filteredFacilities = allFacilities.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const facilities = allowedIds
    ? filteredFacilities.filter((f) => allowedIds.includes(f.id))
    : filteredFacilities;

  const selected = facilities.find((f) => f.id === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-secondary-700">
        {t("facility")}
        <span className="text-red-500 ml-0.5">*</span>
      </label>

      <div className="relative" ref={dropdownRef}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          disabled={isLoading}
          className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 ${
            isOpen
              ? "border-primary-500 ring-2 ring-primary-200"
              : "border-secondary-400"
          } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <span
            className={selected ? "text-secondary-900" : "text-secondary-400"}
          >
            {isLoading
              ? t("loading_facilities")
              : selected
                ? selected.name
                : t("select_facility_placeholder")}
          </span>
          {isLoading ? (
            <Loader2Icon className="size-4 text-secondary-400 animate-spin" />
          ) : (
            <ChevronDownIcon
              className={`size-4 text-secondary-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {/* Dropdown panel */}
        {isOpen && !isLoading && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-secondary-200 bg-white shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-secondary-100">
              <input
                type="text"
                value={search}
                autoFocus
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search_facility_placeholder")}
                className="w-full rounded-md border border-secondary-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              />
            </div>

            {/* Options list */}
            <ul className="max-h-48 overflow-y-auto">
              {isError ? (
                <li className="px-3 py-3 text-sm text-red-500 text-center">
                  {t("facilities_load_error")}
                </li>
              ) : facilities.length === 0 ? (
                <li className="px-3 py-3 text-sm text-secondary-400 text-center">
                  {t("no_facilities")}
                </li>
              ) : (
                facilities.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(f.id, f.name);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 hover:text-primary-700 ${
                        f.id === value
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-secondary-700"
                      }`}
                    >
                      {f.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
