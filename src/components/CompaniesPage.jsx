import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../constants/BASE_URL";
import CompanyFormModal from "./CompanyFormModal";

const CompaniesPage = () => {
  // Data & UI state
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

  // Dropdown values (fetched once with large limit)
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
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">List of Companies</h4>
        <div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3 filters-card">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label">Industry</label>
              <select
                className="form-select"
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

            <div className="col-md-4">
              <label className="form-label">City</label>
              <select
                className="form-select"
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

            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="search"
                className="form-control"
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
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-4">No companies found matching your filters.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
                      Name {renderSortIndicator("name")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("industry")}>
                      Industry {renderSortIndicator("industry")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("location")}>
                      City {renderSortIndicator("location")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("employeeSize")}>
                      Employees {renderSortIndicator("employeeSize")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("establishedDate")}>
                      Established {renderSortIndicator("establishedDate")}
                    </th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.industry}</td>
                      <td>{c.location}</td>
                      <td>{c.employeeSize?.toLocaleString?.() ?? c.employeeSize}</td>
                      <td>{c.establishedDate ? new Date(c.establishedDate).toLocaleDateString() : "-"}</td>
                      <td>{c.isActive ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2 mb-2 mb-md-0" onClick={() => openEditModal(c)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c)}>
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
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <small>
            Showing page {meta.page} of {meta.pages} — {meta.total} total
          </small>
        </div>

        <nav aria-label="Companies pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${meta.page <= 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => goToPage(meta.page - 1)}>
                Previous
              </button>
            </li>

            {/* show a window of page numbers */}
            {Array.from({ length: meta.pages }).map((_, idx) => {
              const p = idx + 1;
              // show first, last, and neighbors
              if (meta.pages > 9) {
                const start = Math.max(1, meta.page - 3);
                const end = Math.min(meta.pages, meta.page + 3);
                if (p !== 1 && p !== meta.pages && (p < start || p > end)) {
                  // skip rendering this page (except we add ellipsis later)
                  return null;
                }
              }
              return (
                <li key={p} className={`page-item ${p === meta.page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(p)}>
                    {p}
                  </button>
                </li>
              );
            })}

            {/* If large pages, show first/last and ellipsis */}
            {meta.pages > 9 && meta.page > 5 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}

            <li className={`page-item ${meta.page >= meta.pages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => goToPage(meta.page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
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
