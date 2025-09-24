import React, { useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { BASE_URL } from "../constants/BASE_URL";

// Yup validation schema (mirrors backend)
const companySchema = yup.object().shape({
  name: yup.string().required("Name is required").min(2).max(100),
  description: yup.string().nullable(),
  industry: yup.string().required("Industry is required"),
  location: yup.string().required("City is required"),
  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(/^\d{5,6}$/, "Pincode must be 5 or 6 digits"),
  employeeSize: yup
    .number()
    .typeError("Employee size must be a number")
    .required("Employee size is required")
    .min(1),
  establishedDate: yup
    .date()
    .typeError("Established date is required")
    .max(new Date(), "Established date cannot be in the future")
    .required("Established date is required"),
  website: yup.string().nullable().url("Website must be a valid URL"),
  email: yup.string().required("Email is required").email("Invalid email"),
  phone: yup.string().required("Phone is required"),
  isActive: yup.boolean().nullable(),
});

const CompanyFormModal = ({ show, onClose, onSuccess, company }) => {
  const isEdit = !!company;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      location: "",
      pincode: "",
      employeeSize: "",
      establishedDate: "",
      website: "",
      email: "",
      phone: "",
      isActive: true,
    },
  });

  // When editing, populate form
  useEffect(() => {
    if (isEdit) {
      reset({
        name: company.name || "",
        description: company.description || "",
        industry: company.industry || "",
        location: company.location || "",
        pincode: company.pincode || "",
        employeeSize: company.employeeSize || "",
        establishedDate: company.establishedDate
          ? new Date(company.establishedDate).toISOString().slice(0, 10)
          : "",
        website: company.website || "",
        email: company.email || "",
        phone: company.phone || "",
        isActive: company.isActive !== undefined ? company.isActive : true,
      });
    } else {
      reset(); // clear for add
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, isEdit, reset]);

  const submitHandler = async (values) => {
    try {
      if (isEdit) {
        await axios.put(
          `${BASE_URL}companies/updateById/${company._id}`,
          values,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${BASE_URL}companies/add`,
          values,
          { withCredentials: true }
        );
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Request failed");
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? "Edit Company" : "Add Company"}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input placeholder="Enter Here.." className={`form-control ${errors.name ? "is-invalid" : ""}`} {...register("name")} />
                  <div className="invalid-feedback">{errors.name?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Industry</label>
                  <input placeholder="Enter Here.." className={`form-control ${errors.industry ? "is-invalid" : ""}`} {...register("industry")} />
                  <div className="invalid-feedback">{errors.industry?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input placeholder="Enter Here.." className={`form-control ${errors.location ? "is-invalid" : ""}`} {...register("location")} />
                  <div className="invalid-feedback">{errors.location?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Pincode</label>
                  <input placeholder="Enter Here.." className={`form-control ${errors.pincode ? "is-invalid" : ""}`} {...register("pincode")} />
                  <div className="invalid-feedback">{errors.pincode?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Employee Size</label>
                  <input placeholder="Enter Here.." type="number" className={`form-control ${errors.employeeSize ? "is-invalid" : ""}`} {...register("employeeSize")} />
                  <div className="invalid-feedback">{errors.employeeSize?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Established Date</label>
                  <input type="date" className={`form-control ${errors.establishedDate ? "is-invalid" : ""}`} {...register("establishedDate")} />
                  <div className="invalid-feedback">{errors.establishedDate?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Website</label>
                  <input placeholder="Enter Here.." className={`form-control ${errors.website ? "is-invalid" : ""}`} {...register("website")} />
                  <div className="invalid-feedback">{errors.website?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input placeholder="Enter Here.." type="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} {...register("email")} />
                  <div className="invalid-feedback">{errors.email?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input placeholder="Enter Here.." className={`form-control ${errors.phone ? "is-invalid" : ""}`} {...register("phone")} />
                  <div className="invalid-feedback">{errors.phone?.message}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea placeholder="Enter Here.." className="form-control" rows="2" {...register("description")}></textarea>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="checkbox" {...register("isActive")} id="isActive" />
                    <label className="form-check-label" htmlFor="isActive">
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isEdit ? "Update Company" : "Create Company"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyFormModal;
