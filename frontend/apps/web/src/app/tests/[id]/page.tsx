"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import { SampleType, TestFormData, TestCategory } from "@/types";

export default function TestDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams ? searchParams.get('edit') === 'true' : false;
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : String(params.id || '');
  
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [test, setTest] = useState<any>(null);
  const [formData, setFormData] = useState<TestFormData>({
    testCode: "",
    testName: "",
    shortName: "",
    categoryId: "",
    sampleType: "BLOOD",
    sampleContainer: "",
    sampleVolume: "",
    processingDepartment: "",
    method: "",
    description: "",
    clinicalSignificance: "",
    patientPreparation: "",
    price: 0,
    offerPrice: 0,
    b2bRate: 0,
    gstPercentage: 0,
    tatHours: 24,
    tatDisplay: "",
    displayOrder: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchTest();
    fetchCategories();
  }, [id]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await testApi.getById(id);
      if (response.success && response.data) {
        const testData = response.data;
        setTest(testData);
        setFormData({
          testCode: testData.testCode || "",
          testName: testData.testName || "",
          shortName: testData.shortName || "",
          categoryId: testData.categoryId || "",
          sampleType: testData.sampleType || "BLOOD",
          sampleContainer: testData.sampleContainer || "",
          sampleVolume: testData.sampleVolume || "",
          processingDepartment: testData.processingDepartment || "",
          method: testData.method || "",
          description: testData.description || "",
          clinicalSignificance: testData.clinicalSignificance || "",
          patientPreparation: testData.patientPreparation || "",
          price: testData.price || 0,
          offerPrice: testData.offerPrice || 0,
          b2bRate: testData.b2bRate || 0,
          gstPercentage: testData.gstPercentage || 0,
          tatHours: testData.tatHours || 24,
          tatDisplay: testData.tatDisplay || "",
          displayOrder: testData.displayOrder || 0,
          isActive: testData.isActive !== false,
        });
      } else {
        setError(response.message || "Failed to fetch test");
      }
    } catch (err) {
      console.error("Error fetching test:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch test");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await testApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const testData: any = {
        testCode: formData.testCode,
        testName: formData.testName,
        sampleType: formData.sampleType,
        price: formData.price,
      };

      // Only add optional fields if they have values
      if (formData.shortName) testData.shortName = formData.shortName;
      if (formData.categoryId) testData.categoryId = formData.categoryId;
      if (formData.sampleContainer) testData.sampleContainer = formData.sampleContainer;
      if (formData.sampleVolume) testData.sampleVolume = formData.sampleVolume;
      if (formData.processingDepartment) testData.processingDepartment = formData.processingDepartment;
      if (formData.method) testData.method = formData.method;
      if (formData.description) testData.description = formData.description;
      if (formData.clinicalSignificance) testData.clinicalSignificance = formData.clinicalSignificance;
      if (formData.patientPreparation) testData.patientPreparation = formData.patientPreparation;
      if (formData.offerPrice) testData.offerPrice = formData.offerPrice;
      if (formData.b2bRate) testData.b2bRate = formData.b2bRate;
      if (formData.gstPercentage) testData.gstPercentage = formData.gstPercentage;
      if (formData.tatHours) testData.tatHours = formData.tatHours;
      if (formData.tatDisplay) testData.tatDisplay = formData.tatDisplay;
      if (formData.displayOrder) testData.displayOrder = formData.displayOrder;
      if (formData.isActive !== undefined) testData.isActive = formData.isActive;

      const response = await testApi.update(id, testData);

      if (response.success) {
        alert("Test updated successfully!");
        router.push(`/tests/${id}`);
      } else {
        setError(response.message || "Failed to update test");
      }
    } catch (err) {
      console.error("Error updating test:", err);
      setError(err instanceof Error ? err.message : "Failed to update test");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${test?.testName || 'this test'}?`)) {
      return;
    }

    try {
      await testApi.delete(id);
      alert("Test deleted successfully!");
      router.push("/tests");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete test");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading test details...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !test) {
    return (
      <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
        <div className="max-w-4xl">
          <div className="mb-6">
            <Link
              href="/tests"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Tests
            </Link>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="max-w-4xl">
        <div className="mb-6">
          <Link
            href="/tests"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Tests
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {editMode ? "Edit Test" : "Test Details"}
            </h1>
            <div className="flex gap-2">
              {!editMode && (
                <>
                  <Link
                    href={`/tests/${id}?edit=true`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
              {editMode && (
                <Link
                  href={`/tests/${id}`}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Test Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.testName}
                      onChange={(e) =>
                        setFormData({ ...formData, testName: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Test Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.testCode}
                      onChange={(e) =>
                        setFormData({ ...formData, testCode: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Short Name
                    </label>
                    <input
                      type="text"
                      value={formData.shortName}
                      onChange={(e) =>
                        setFormData({ ...formData, shortName: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      disabled={loadingCategories}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Sample Type *
                    </label>
                    <select
                      required
                      value={formData.sampleType}
                      onChange={(e) =>
                        setFormData({ ...formData, sampleType: e.target.value as SampleType })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="BLOOD">Blood</option>
                      <option value="URINE">Urine</option>
                      <option value="SERUM">Serum</option>
                      <option value="PLASMA">Plasma</option>
                      <option value="STOOL">Stool</option>
                      <option value="SWAB">Swab</option>
                      <option value="SPUTUM">Sputum</option>
                      <option value="CSF">CSF</option>
                      <option value="TISSUE">Tissue</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sample Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Information</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Sample Container
                    </label>
                    <input
                      type="text"
                      value={formData.sampleContainer}
                      onChange={(e) =>
                        setFormData({ ...formData, sampleContainer: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Sample Volume
                    </label>
                    <input
                      type="text"
                      value={formData.sampleVolume}
                      onChange={(e) =>
                        setFormData({ ...formData, sampleVolume: e.target.value })
                      }
                      placeholder="e.g., 5ml"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Processing Department
                    </label>
                    <input
                      type="text"
                      value={formData.processingDepartment}
                      onChange={(e) =>
                        setFormData({ ...formData, processingDepartment: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Offer Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.offerPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      B2B Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.b2bRate}
                      onChange={(e) =>
                        setFormData({ ...formData, b2bRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      GST %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.gstPercentage}
                      onChange={(e) =>
                        setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Turnaround Time */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Turnaround Time</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      TAT (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.tatHours}
                      onChange={(e) =>
                        setFormData({ ...formData, tatHours: parseInt(e.target.value) || 24 })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      TAT Display
                    </label>
                    <input
                      type="text"
                      value={formData.tatDisplay}
                      onChange={(e) =>
                        setFormData({ ...formData, tatDisplay: e.target.value })
                      }
                      placeholder="e.g., 24 hours, Same Day"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Method
                    </label>
                    <input
                      type="text"
                      value={formData.method}
                      onChange={(e) =>
                        setFormData({ ...formData, method: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Clinical Significance
                    </label>
                    <textarea
                      value={formData.clinicalSignificance}
                      onChange={(e) =>
                        setFormData({ ...formData, clinicalSignificance: e.target.value })
                      }
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Patient Preparation
                    </label>
                    <textarea
                      value={formData.patientPreparation}
                      onChange={(e) =>
                        setFormData({ ...formData, patientPreparation: e.target.value })
                      }
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href={`/tests/${id}`}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* View Mode */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Test Name</label>
                    <p className="text-gray-900">{test?.testName || test?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Test Code</label>
                    <p className="text-gray-900 font-mono">{test?.testCode || test?.code}</p>
                  </div>
                  {test?.shortName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Short Name</label>
                      <p className="text-gray-900">{test.shortName}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900">{test?.category?.name || test?.category || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sample Type</label>
                    <p className="text-gray-900">{test?.sampleType || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      test?.isActive !== false 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {test?.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sample Container</label>
                    <p className="text-gray-900">{test?.sampleContainer || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sample Volume</label>
                    <p className="text-gray-900">{test?.sampleVolume || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Processing Department</label>
                    <p className="text-gray-900">{test?.processingDepartment || "—"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price</label>
                    <p className="text-gray-900 font-semibold">₹{test?.price || '0'}</p>
                  </div>
                  {test?.offerPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Offer Price</label>
                      <p className="text-gray-900">₹{test.offerPrice}</p>
                    </div>
                  )}
                  {test?.b2bRate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">B2B Rate</label>
                      <p className="text-gray-900">₹{test.b2bRate}</p>
                    </div>
                  )}
                  {test?.gstPercentage && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">GST</label>
                      <p className="text-gray-900">{test.gstPercentage}%</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Turnaround Time</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">TAT (Hours)</label>
                    <p className="text-gray-900">{test?.tatHours || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">TAT Display</label>
                    <p className="text-gray-900">{test?.tatDisplay || test?.turnaroundTime || "—"}</p>
                  </div>
                </div>
              </div>

              {test?.method && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Method</h2>
                  <p className="text-gray-900">{test.method}</p>
                </div>
              )}

              {test?.description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-900">{test.description}</p>
                </div>
              )}

              {test?.clinicalSignificance && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Significance</h2>
                  <p className="text-gray-900">{test.clinicalSignificance}</p>
                </div>
              )}

              {test?.patientPreparation && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Preparation</h2>
                  <p className="text-gray-900">{test.patientPreparation}</p>
                </div>
              )}

              {test?.parameters && test.parameters.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Parameters</h2>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Unit</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Data Type</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {test.parameters.map((param: any) => (
                          <tr key={param.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{param.parameterName}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{param.unit || "—"}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{param.dataType}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{param.isRequired ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}