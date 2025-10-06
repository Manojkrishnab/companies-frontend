import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../constants/BASE_URL";
import CompanyFormModal from "./CompanyFormModal";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters / sort / pagination
  const [industryFilter, setIndustryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'

  // Dropdown values
  const [allIndustries, setAllIndustries] = useState([]);
  const [allCities, setAllCities] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Page size
  const [limit, setLimit] = useState(5);

  // Helper to build sort string for backend (e.g., "-employeeSize" or "name")
  const sortString = useMemo(() => {
    return (sortOrder === "desc" ? "-" : "") + sortField;
  }, [sortField, sortOrder]);

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch dropdown values (page=1, limit=300) once
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`${BASE_URL}companies/list`, {
          params: { page: 1, limit: 300 }, withCredentials: true
        });
        const items = res.data?.data || [];
        const industries = Array.from(new Set(items.map((c) => c.industry).filter(Boolean))).sort();
        const cities = Array.from(new Set(items.map((c) => c.location).filter(Boolean))).sort();
        setAllIndustries(industries);
        setAllCities(cities);
      } catch (err) {
        // non-fatal: don't block page
        console.error("Failed to fetch dropdowns:", err?.response?.data || err.message);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch paginated companies whenever dependencies change
  useEffect(() => {
    fetchCompanies(meta.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.page, limit, industryFilter, cityFilter, debouncedSearch, sortString]);

  const fetchCompanies = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit,
        sort: sortString,
      };
      if (industryFilter) params.industry = industryFilter;
      if (cityFilter) params.city = cityFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await axios.get(`${BASE_URL}companies/list`, {
        params,
        withCredentials: true,
      });
      const data = res.data;
      setCompanies(data.data || []);
      setMeta((prev) => ({
        ...prev,
        page: data.meta?.page || page,
        limit: data.meta?.limit || limit,
        pages: data.meta?.pages || 0,
        total: data.meta?.total || 0,
      }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  // Toggle sort when header clicked
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc"); // default to asc on new field
    }
    // After changing sort, refresh page 1
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const openAddModal = () => {
    setEditingCompany(null);
    setShowModal(true);
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCompany(null);
  };

  // After add/edit/delete succeed -> refresh current page
  const handleSuccessAndRefresh = () => {
    closeModal();
    fetchCompanies(meta.page);
  };

  // Delete with SweetAlert2 confirmation
  const handleDelete = (company) => {
    Swal.fire({
      title: `Delete "${company.name}"?`,
      // text: "This will soft-delete the company (mark isActive = false).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `${BASE_URL}companies/deleteById/${company._id}`,
            {
              withCredentials: true,
            }
          );
          Swal.fire("Deleted", res.data?.message || "Company deleted", "success");
          // Refresh list
          fetchCompanies(meta.page);
        } catch (err) {
          console.error(err);
          Swal.fire("Error", err.response?.data?.error || err.message || "Delete failed", "error");
        }
      }
    });
  };

  // Pagination controls
  const goToPage = (p) => {
    if (p < 1 || p > meta.pages) return;
    setMeta((m) => ({ ...m, page: p }));
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return <span className="text-muted ms-1">↕</span>;
    return sortOrder === "asc" ? <span className="ms-1">▲</span> : <span className="ms-1">▼</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">List of Companies</h4>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={openAddModal}
        >
          + Add Company
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200"
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
            >
              <option value="">All Industries</option>
              {allIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
            >
              <option value="">All Cities</option>
              {allCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="search"
              className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200"
              placeholder="Search by name or industry..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          // Shimmer UI
          <div className="animate-pulse p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>

            <div className="space-y-3">
              {/* table header shimmer */}
              <div className="grid grid-cols-7 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>

              {/* table rows shimmer */}
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-7 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No companies found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-separate border-spacing-0">
              <thead>
                <tr className="text-gray-700">
                  <th
                    className="px-4 py-2 cursor-pointer border-b bg-gray-100 rounded-tl-lg"
                    onClick={() => handleSort("name")}
                  >
                    Name {renderSortIndicator("name")}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer border-b bg-gray-100"
                    onClick={() => handleSort("industry")}
                  >
                    Industry {renderSortIndicator("industry")}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer border-b bg-gray-100"
                    onClick={() => handleSort("location")}
                  >
                    City {renderSortIndicator("location")}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer border-b bg-gray-100"
                    onClick={() => handleSort("employeeSize")}
                  >
                    Employees {renderSortIndicator("employeeSize")}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer border-b bg-gray-100"
                    onClick={() => handleSort("establishedDate")}
                  >
                    Established {renderSortIndicator("establishedDate")}
                  </th>
                  <th className="px-4 py-2 border-b bg-gray-100">Active</th>
                  <th className="px-4 py-2 border-b bg-gray-100 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.industry}</td>
                    <td className="px-4 py-2">{c.location}</td>
                    <td className="px-4 py-2">
                      {c.employeeSize?.toLocaleString?.() ?? c.employeeSize}
                    </td>
                    <td className="px-4 py-2">
                      {c.establishedDate
                        ? new Date(c.establishedDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {c.isActive ? (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white"
                        onClick={() => openEditModal(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white"
                        onClick={() => handleDelete(c)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Showing page {meta.page} of {meta.pages} — {meta.total} total
        </div>

        <div className="flex items-center gap-1">
          <button
            className={`px-3 py-1 border rounded ${meta.page <= 1
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100"
              }`}
            disabled={meta.page <= 1}
            onClick={() => goToPage(meta.page - 1)}
          >
            Previous
          </button>

          {Array.from({ length: meta.pages }).map((_, idx) => {
            const p = idx + 1;
            if (meta.pages > 9) {
              const start = Math.max(1, meta.page - 3);
              const end = Math.min(meta.pages, meta.page + 3);
              if (p !== 1 && p !== meta.pages && (p < start || p > end)) {
                return null;
              }
            }
            return (
              <button
                key={p}
                className={`px-3 py-1 border rounded ${p === meta.page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
                  }`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            );
          })}

          <button
            className={`px-3 py-1 border rounded ${meta.page >= meta.pages
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100"
              }`}
            disabled={meta.page >= meta.pages}
            onClick={() => goToPage(meta.page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CompanyFormModal
          show={showModal}
          onClose={closeModal}
          onSuccess={handleSuccessAndRefresh}
          company={editingCompany}
        />
      )}
    </div>
  );
};

export default CompaniesPage;
