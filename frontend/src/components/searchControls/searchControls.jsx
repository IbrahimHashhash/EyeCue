import { ReactComponent as SearchIcon } from "../../icons/search.svg";
import { ReactComponent as FilterIcon } from "../../icons/filter.svg";

const SearchControls = ({
  searchTerm,
  setSearchTerm,
  selectedFilter,
  setSelectedFilter,
  isDropdownOpen,
  setIsDropdownOpen,
  searchPlaceholder = "Search...",
  filterOptions = []
}) => {
  return (
    <div className="header-controls">
      <div className="search-container">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="search-icon">
          <SearchIcon />
        </div>
      </div>
      <div className="sort-container">
        <button
          className="sort-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <FilterIcon className="filter-icon" />
          <span className="sort-label">Filter</span>
        </button>
        {isDropdownOpen && (
          <div className="sort-dropdown-menu">
            {filterOptions.map((option) => (
              <div
                key={option.value}
                className={`sort-dropdown-item ${selectedFilter === option.value ? "active" : ""}`}
                onClick={() => {
                  setSelectedFilter(option.value);
                  setIsDropdownOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchControls;
