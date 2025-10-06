import React, { useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { BASE_URL } from "../constants/BASE_URL";

// Yup validation schema (same as before)
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
      reset();
    }
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
        await axios.post(`${BASE_URL}companies/add`, values, {
          withCredentials: true,
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Request failed");
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} 
    >
      <div
        className="bg-white w-full max-w-4xl rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h5 className="text-lg font-semibold">
              {isEdit ? "Edit Company" : "Add Company"}
            </h5>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium">Industry</label>
                <input
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.industry ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("industry")}
                />
                {errors.industry && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium">Pincode</label>
                <input
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.pincode ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("pincode")}
                />
                {errors.pincode && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.pincode.message}
                  </p>
                )}
              </div>

              {/* Employee Size */}
              <div>
                <label className="block text-sm font-medium">Employee Size</label>
                <input
                  type="number"
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.employeeSize ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("employeeSize")}
                />
                {errors.employeeSize && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.employeeSize.message}
                  </p>
                )}
              </div>

              {/* Established Date */}
              <div>
                <label className="block text-sm font-medium">
                  Established Date
                </label>
                <input
                  type="date"
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.establishedDate
                    ? "border-red-500"
                    : "border-gray-300"
                    }`}
                  {...register("establishedDate")}
                />
                {errors.establishedDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.establishedDate.message}
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium">Website</label>
                <input
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.website ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("website")}
                />
                {errors.website && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.website.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  placeholder="Enter Here.."
                  className={`w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 ${errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  placeholder="Enter Here.."
                  rows="2"
                  className="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 border-gray-300"
                  {...register("description")}
                ></textarea>
              </div>

              {/* Active checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 border-gray-300 rounded"
                  {...register("isActive")}
                />
                <label htmlFor="isActive" className="text-sm">
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <button
              type="button"
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isEdit ? "Update Company" : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyFormModal;
