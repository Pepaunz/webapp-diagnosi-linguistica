// src/components/shared/Filters.tsx

import { Search, ChevronDown } from "lucide-react";

// Reusable SelectFilter component
export const SelectFilter = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) => (
  <div className="relative flex-1">
    <select
      className="w-full pl-3 pr-8 py-2 border rounded-lg appearance-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value={options[0].value}>{placeholder}</option>
      {options.slice(1).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <ChevronDown size={18} className="text-gray-400" />
    </div>
  </div>
);

// Reusable SearchBar component
export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search size={18} className="text-gray-400" />
    </div>
    <input
      type="text"
      className="w-full pl-10 pr-4 py-2 border rounded-lg"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// src/components/shared/Table.tsx

// Reusable Pagination component
export const Pagination = ({
  total,
  currentPage = 1,
  onPageChange = () => {},
}: {
  total: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}) => (
  <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">{total}</span> of{" "}
          <span className="font-medium">{total}</span> results
        </p>
      </div>
      <div>
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <button
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button className="bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
            {currentPage}
          </button>
          <button
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  </div>
);

// Reusable EmptyState component
export const EmptyState = ({
  message,
  colSpan = 7,
}: {
  message: string;
  colSpan?: number;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-6 py-4 text-center text-sm text-gray-500"
    >
      {message}
    </td>
  </tr>
);

// src/components/shared/UI.tsx

// Reusable StatsCard component
export const StatsCard = ({
  title,
  count,
  icon,
  color,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-white shadow-sm rounded-lg p-4">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{count}</p>
      </div>
    </div>
  </div>
);

// Reusable Button component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  icon?: React.ReactNode;
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon,
}: ButtonProps) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case "primary":
        return "bg-gray-800 text-white hover:bg-gray-700";
      case "secondary":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      default:
        return "bg-gray-800 text-white hover:bg-gray-700";
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${getVariantClasses()} ${className}`}
      onClick={onClick}
    >
      {icon && icon}
      {children}
    </button>
  );
};
