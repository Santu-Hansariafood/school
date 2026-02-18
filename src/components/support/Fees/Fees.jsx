"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  CheckCircle,
  Clock,
  CreditCard,
  X,
  Smartphone,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/common/Toast/ToastProvider";
import { useApiClient } from "@/components/providers/ApiClientProvider";

const Fees = ({ role }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const apiClient = useApiClient();
  const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "School Management System";

  const [classesList, setClassesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [fees, setFees] = useState([]);
  const [newFeeType, setNewFeeType] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [newFeeDueDate, setNewFeeDueDate] = useState("");
  const [creatingFee, setCreatingFee] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [upiId, setUpiId] = useState("");

  const fetchClasses = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/classes");
      const list = (res.data || []).map((c) => c.name);
      startTransition(() => {
        setClassesList(list);
        if (!selectedClass && list.length) {
          setSelectedClass(list[0]);
        }
      });
    } catch (error) {
      console.error("Error loading classes for fees:", error);
      showToast({ type: "error", message: "Failed to load classes" });
    }
  }, [apiClient, selectedClass, showToast]);

  const fetchStudents = useCallback(
    async (cls) => {
      try {
        const params = [];
        if (role === "student" && user?.email) {
          params.push(`email=${encodeURIComponent(user.email)}`);
        } else if (cls) {
          params.push(`class=${encodeURIComponent(cls)}`);
        }
        const query = params.length ? `?${params.join("&")}` : "";
        const res = await apiClient.get(`/api/students${query}`);
        const list = res.data || [];
        startTransition(() => {
          setStudentsList(list);
          if (role === "student" && user?.email) {
            const byEmail = list.find((s) => s.email === user.email);
            if (byEmail) {
              setSelectedStudent(byEmail._id);
            }
          } else if (!selectedStudent && list.length) {
            setSelectedStudent(list[0]._id);
          }
        });
      } catch (error) {
        console.error("Error loading students for fees:", error);
        showToast({ type: "error", message: "Failed to load students" });
      }
    },
    [apiClient, role, user, selectedStudent, showToast]
  );

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchStudents(selectedClass);
  }, [fetchStudents, selectedClass]);

  useEffect(() => {
    const loadFees = async () => {
      if (!selectedStudent) return;
      try {
        const res = await apiClient.get(
          `/api/fees?studentId=${encodeURIComponent(selectedStudent)}`
        );
        setFees(res.data || []);
      } catch (error) {
        console.error("Error loading fees:", error);
        showToast({ type: "error", message: "Failed to load fees" });
      }
    };
    loadFees();
  }, [apiClient, selectedStudent, showToast]);

  const filteredStudents = useMemo(() => studentsList, [studentsList]);

  const selectedStudentObj = useMemo(
    () => studentsList.find((s) => s._id === selectedStudent) || null,
    [studentsList, selectedStudent]
  );

  const studentFees = useMemo(() => fees, [fees]);

  const totalFees = studentFees.reduce((sum, f) => sum + f.amount, 0);
  const paidFees = studentFees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingFees = totalFees - paidFees;

  // --- OPEN MODAL ---
  const handlePayNow = (fee) => {
    setSelectedFee(fee);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
    setTransactionDetails(null);
  };

  const generateTransactionId = () => {
    return (
      "TXN" +
      Date.now() +
      Math.random().toString(36).substr(2, 9).toUpperCase()
    );
  };

  // --- PROCESS PAYMENT ---
  const processPayment = async () => {
    if (!selectedFee) {
      showToast({ type: "warning", message: "Please select a fee to pay" });
      return;
    }

    if (paymentMethod === "card") {
      if (
        !cardDetails.number ||
        !cardDetails.name ||
        !cardDetails.expiry ||
        !cardDetails.cvv
      ) {
        showToast({ type: "warning", message: "Please fill all card details" });
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upiId) {
        showToast({ type: "warning", message: "Please enter UPI ID" });
        return;
      }
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const transaction = {
      id: generateTransactionId(),
      date: new Date().toISOString(),
      amount: selectedFee?.amount || 0,
      method: paymentMethod,
      status: "success",
      feeType: selectedFee?.type || "",
    };

    try {
      if (selectedFee?._id) {
        await apiClient.put(`/api/fees/${selectedFee._id}`, {
          status: "paid",
          paidDate: new Date().toISOString(),
          transactionId: transaction.id,
        });
      }
      const res = await apiClient.get(
        `/api/fees?studentId=${encodeURIComponent(selectedStudent)}`
      );
      setFees(res.data || []);
    } catch (error) {
      console.error("Error updating fee payment:", error);
      showToast({ type: "error", message: "Failed to update fee status" });
    }

    setTransactionDetails(transaction);
    setPaymentSuccess(true);
    showToast({ type: "success", message: "Payment successful" });
    setProcessing(false);
  };

  const downloadReceipt = () => {
    if (!transactionDetails) {
      showToast({ type: "warning", message: "No transaction available" });
      return;
    }
    const doc = new jsPDF();
    const student =
      studentsList.find((s) => s._id === selectedStudent) || {
        name: "",
        _id: selectedStudent,
      };

    doc.setFontSize(20);
    doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(projectName, 105, 28, { align: "center" });
    doc.text("123 Education Street, Springfield", 105, 34, {
      align: "center",
    });

    doc.line(20, 40, 190, 40);

    doc.setFontSize(12);
    doc.text("Transaction Details", 20, 50);

    const details = [
      ["Transaction ID:", String(transactionDetails.id || "")],
      ["Date:", new Date(transactionDetails.date || Date.now()).toLocaleString()],
      ["Student Name:", String(student.name || "")],
      ["Student ID:", String(student._id || "")],
      ["Fee Type:", String(transactionDetails.feeType || "")],
      ["Amount Paid:", `$${Number(transactionDetails.amount || 0)}`],
      ["Payment Method:", String((transactionDetails.method || "").toUpperCase())],
      ["Status:", "SUCCESS"],
    ];

    let y = 60;
    details.forEach(([label, value]) => {
      doc.text(label, 20, y);
      doc.text(value, 90, y);
      y += 8;
    });

    doc.line(20, y + 5, 190, y + 5);

    doc.setFontSize(12);
    doc.text(`Total Paid: $${Number(transactionDetails.amount || 0)}`, 20, y + 15);

    doc.text(
      "This is a computer-generated receipt.",
      105,
      y + 35,
      { align: "center" }
    );

    doc.save(`Receipt_${transactionDetails.id}.pdf`);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedFee(null);
    setPaymentMethod("card");
    setCardDetails({ number: "", name: "", expiry: "", cvv: "" });
    setUpiId("");
    setPaymentSuccess(false);
    setTransactionDetails(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>

        {role !== "student" && (
          <div className="flex items-center gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {classesList.map((cls) => (
                <option value={cls} key={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {filteredStudents.map((student) => (
                <option value={student._id} key={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex justify-between">
            <DollarSign className="w-8 h-8" />
            <p className="text-3xl font-bold">${totalFees}</p>
          </div>
          <p className="text-blue-100">Total Fees</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex justify-between">
            <CheckCircle className="w-8 h-8" />
            <p className="text-3xl font-bold">${paidFees}</p>
          </div>
          <p className="text-emerald-100">Paid</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex justify-between">
            <Clock className="w-8 h-8" />
            <p className="text-3xl font-bold">${pendingFees}</p>
          </div>
          <p className="text-orange-100">Pending</p>
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Fee Details
          </h2>
          {role !== "student" && (
            <form
              className="flex flex-col md:flex-row gap-3 md:items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedClass || !newFeeType || !newFeeAmount || !newFeeDueDate) {
                  showToast({
                    type: "warning",
                    message: "Please fill all fee fields",
                  });
                  return;
                }
                const amountNumber = Number(newFeeAmount);
                if (Number.isNaN(amountNumber) || amountNumber <= 0) {
                  showToast({
                    type: "warning",
                    message: "Amount must be a positive number",
                  });
                  return;
                }
                try {
                  setCreatingFee(true);
                  await apiClient.post("/api/fees", {
                    className: selectedClass,
                    type: newFeeType,
                    amount: amountNumber,
                    dueDate: newFeeDueDate,
                    applyToClass: true,
                  });
                  showToast({
                    type: "success",
                    message: "Fees assigned to class students",
                  });
                  setNewFeeType("");
                  setNewFeeAmount("");
                  setNewFeeDueDate("");
                  if (selectedStudent) {
                    const res = await apiClient.get(
                      `/api/fees?studentId=${encodeURIComponent(selectedStudent)}`
                    );
                    setFees(res.data || []);
                  }
                } catch (error) {
                  console.error("Error assigning class fees:", error);
                  showToast({
                    type: "error",
                    message: "Failed to assign fees to class",
                  });
                } finally {
                  setCreatingFee(false);
                }
              }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Class
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-lg min-w-[120px] text-sm bg-gray-50">
                  {selectedClass || "Select class"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Fee Type
                </label>
                <input
                  type="text"
                  value={newFeeType}
                  onChange={(e) => setNewFeeType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. Tuition Fee"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Amount"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newFeeDueDate}
                  onChange={(e) => setNewFeeDueDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={creatingFee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingFee ? "Assigning..." : "Assign to Class"}
              </button>
            </form>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Fee Type</th>
                <th className="px-4 py-3 text-center">Amount</th>
                <th className="px-4 py-3 text-center">Due Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                {role === "student" && (
                  <th className="px-4 py-3 text-center">Action</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y">
              {studentFees.map((fee, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {fee.type}
                  </td>
                  <td className="px-4 py-3 text-center">${fee.amount}</td>
                  <td className="px-4 py-3 text-center">{fee.dueDate}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fee.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {fee.status}
                    </span>
                  </td>

                  {role === "student" && (
                    <td className="px-4 py-3 text-center">
                      {fee.status === "pending" ? (
                        <button
                          onClick={() => handlePayNow(fee)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg flex items-center gap-2 mx-auto"
                        >
                          <CreditCard className="w-4 h-4" /> Pay Now
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600">
                          Paid on {fee.paidDate}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {role === "student" && showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {!paymentSuccess ? (
                <div className="p-6">
                  <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">Payment Gateway</h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Amount Box */}
                  <div className="bg-blue-600 text-white p-4 rounded-xl mb-6">
                    <p className="text-blue-100 text-sm">Amount to Pay</p>
                    <p className="text-3xl font-bold">
                      ${selectedFee?.amount}
                    </p>
                    <p className="text-sm text-blue-100 mt-1">
                      {selectedFee?.type}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <p className="text-sm font-semibold mb-2">
                    Select Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border-2 rounded-lg text-center ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <CreditCard
                        className={`w-8 h-8 mx-auto mb-2 ${
                          paymentMethod === "card"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`font-medium ${
                          paymentMethod === "card"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        Card
                      </p>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-4 border-2 rounded-lg text-center ${
                        paymentMethod === "upi"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Smartphone
                        className={`w-8 h-8 mx-auto mb-2 ${
                          paymentMethod === "upi"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`font-medium ${
                          paymentMethod === "upi"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        UPI
                      </p>
                    </button>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            number: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />

                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          maxLength={5}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiry: e.target.value,
                            })
                          }
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          maxLength={3}
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value,
                            })
                          }
                          className="px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI Form */}
                  {paymentMethod === "upi" && (
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  )}

                  {/* Pay Button */}
                  <button
                    onClick={processPayment}
                    disabled={processing}
                    className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {processing ? "Processing..." : `Pay $${selectedFee?.amount}`}
                  </button>
                </div>
              ) : (
                // SUCCESS SCREEN
                <div className="p-6 text-center">
                  <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-4" />

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Successful!
                  </h2>

                  <p className="text-gray-600 mb-4">
                    Your payment has been processed successfully.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
                    <p className="text-sm">
                      <strong>Transaction ID:</strong>{" "}
                      {transactionDetails?.id}
                    </p>
                    <p className="text-sm">
                      <strong>Amount:</strong> $
                      {transactionDetails?.amount}
                    </p>
                    <p className="text-sm">
                      <strong>Method:</strong>{" "}
                      {transactionDetails?.method.toUpperCase()}
                    </p>
                    <p className="text-sm">
                      <strong>Date:</strong>{" "}
                      {new Date(
                        transactionDetails?.date
                      ).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={downloadReceipt}
                    className="w-full py-3 mb-3 bg-emerald-600 text-white rounded-lg flex justify-center items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </button>

                  <button
                    onClick={closeModal}
                    className="w-full py-3 bg-gray-200 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Fees;
