import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LoaderCircle, X } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { logoutUser } from "@/lib/session";
import { createAppSocket } from "@/lib/socket";
import httpClient from "@/api/httpClient";
import { Sidebar, Header } from "../components/navbar";
import ProgressBar from "../components/ProgressBar";

// Import actual components
import BookingForm from "../components/BookingForm";
import FixerRejectNotice from "../components/FixerRejectNotice";
import FindFixer from "../components/FindFixer";
import WaitingConfirmation from "../components/WaitingConfirmation";
import BookingAgreement from "../components/BookingAgreement";
import FixerArrival from "../components/FixerArrival";
import FixingInProgress from "../components/FixingInProgress";
import ServiceCompleted from "../components/ServiceCompleted";
import PaymentScreen from "../components/PaymentScreen";
import PaymentSuccess from "../components/PaymentSuccess";
import FeedbackSuccess from "../components/FeedbackSuccess";

export default function CustomerBooking() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingDraft, setBookingDraft] = useState(null);
    const [bookingError, setBookingError] = useState("");
    const [submittingBooking, setSubmittingBooking] = useState(false);
    const [activeBooking, setActiveBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    const [refreshingBooking, setRefreshingBooking] = useState(false);
    const [confirmingBooking, setConfirmingBooking] = useState(false);
    const [rejectingBooking, setRejectingBooking] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState(null);
    const [loadingReceipt, setLoadingReceipt] = useState(false);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [completingPayment, setCompletingPayment] = useState(false);
    const [fixerRejectMessage, setFixerRejectMessage] = useState("");
    const activeBookingRef = useRef(null);

    const syncStepWithBooking = useCallback((booking) => {
        if (!booking) {
            setCurrentStep((step) => (step >= 3 ? 1 : step));
            return;
        }

        if (booking.status === "pending") {
            setCurrentStep(3);
            return;
        }

        if (booking.status === "fixer_accept") {
            setCurrentStep(4);
            return;
        }

        if (booking.status === "customer_accept") {
            setCurrentStep((step) => (step < 5 ? 5 : step));
            return;
        }

        if (booking.status === "arrived") {
            setCurrentStep((step) => (step < 6 ? 6 : step));
            return;
        }

        if (booking.status === "complete") {
            setCurrentStep((step) => (step < 7 ? 7 : step));
        }
    }, []);

    const handleFixerReject = useCallback(() => {
        setActiveBooking(null);
        setCurrentStep(11);
        setBookingError("");
        setFixerRejectMessage("The fixer did not respond in time, so this booking was automatically rejected. Please go back and choose another fixer.");
        window.alert("Fixer rejected the booking request.");
    }, []);

    const handleBackToDescribeIssue = useCallback(() => {
        setFixerRejectMessage("");
        setBookingError("");
        setActiveBooking(null);
        setCurrentStep(1);
    }, []);

    useEffect(() => {
        activeBookingRef.current = activeBooking;
    }, [activeBooking]);

    const loadLatestActiveBooking = useCallback(async ({ silent = false } = {}) => {
        if (silent) {
            setRefreshingBooking(true);
        } else {
            setLoadingBooking(true);
        }

        try {
            const { data } = await httpClient.get("/user/bookings/latest-active");
            const nextBooking = data?.booking ?? null;
            const previousBooking = activeBookingRef.current;

            if (
                !nextBooking &&
                String(previousBooking?.status || "").toLowerCase() === "pending"
            ) {
                handleFixerReject();
                return;
            }

            if (String(nextBooking?.status || "").toLowerCase() === "fixer_reject") {
                handleFixerReject();
                return;
            }

            setActiveBooking(nextBooking);
            syncStepWithBooking(nextBooking);
            setBookingError("");
        } catch (error) {
            console.error(error);
            if (!silent) {
                setBookingError(error.response?.data?.message || "Failed to load your current booking.");
            }
        } finally {
            if (silent) {
                setRefreshingBooking(false);
            } else {
                setLoadingBooking(false);
            }
        }
    }, [handleFixerReject, syncStepWithBooking]);

    useEffect(() => {
        loadLatestActiveBooking();
    }, [loadLatestActiveBooking]);

    useEffect(() => {
        if (!activeBooking?.id) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            loadLatestActiveBooking({ silent: true });
        }, 10000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [activeBooking?.id, loadLatestActiveBooking]);

    useEffect(() => {
        const socket = createAppSocket();

        socket.on("booking:updated", (booking) => {
            setActiveBooking(booking);
            syncStepWithBooking(booking);
            if (String(booking?.status || "").toLowerCase() === "fixer_reject") {
                handleFixerReject();
                return;
            }

            setBookingError("");
            setRefreshingBooking(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [handleFixerReject, syncStepWithBooking]);

    useEffect(() => {
        let isMounted = true;

        if (activeBooking?.status !== "complete" || !activeBooking?.id) {
            setReceiptDetails(null);
            setLoadingReceipt(false);
            return undefined;
        }

        setLoadingReceipt(true);

        httpClient
            .get(`/user/bookings/${activeBooking.id}/receipt`)
            .then((response) => {
                if (!isMounted) {
                    return;
                }

                setReceiptDetails(response?.data?.data ?? null);
            })
            .catch((error) => {
                if (!isMounted) {
                    return;
                }

                console.error(error);
                setReceiptDetails(null);
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingReceipt(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [activeBooking?.id, activeBooking?.status]);

    const loadLatestPayment = useCallback(async ({ silent = false } = {}) => {
        if (!activeBooking?.id || activeBooking?.status !== "complete") {
            setPaymentDetails(null);
            setLoadingPayment(false);
            return null;
        }

        if (!silent) {
            setLoadingPayment(true);
        }

        try {
            const response = await httpClient.get(`/user/bookings/${activeBooking.id}/payments/latest`);
            const payment = response?.data?.data ?? null;
            setPaymentDetails(payment);
            return payment;
        } catch (error) {
            console.error(error);
            if (!silent) {
                setBookingError(error.response?.data?.message || "Failed to load payment.");
            }
            return null;
        } finally {
            if (!silent) {
                setLoadingPayment(false);
            }
        }
    }, [activeBooking?.id, activeBooking?.status]);

    useEffect(() => {
        const bookingStatus = String(activeBooking?.status || '').toLowerCase();
        const paymentStatus = String(paymentDetails?.status || '').toLowerCase();

        if (bookingStatus !== 'complete') {
            return;
        }

        if (['success', 'paid'].includes(paymentStatus)) {
            setCurrentStep((step) => (step < 9 ? 9 : step));
            return;
        }

        if (paymentStatus === 'pending') {
            setCurrentStep((step) => (step < 8 ? 8 : step));
        }
    }, [activeBooking?.status, paymentDetails?.status]);

    useEffect(() => {
        const bookingStatus = String(activeBooking?.status || '').toLowerCase();
        const paymentStatus = String(paymentDetails?.status || '').toLowerCase();

        if (bookingStatus === 'complete' && paymentStatus === 'completed' && currentStep < 10) {
            setActiveBooking(null);
            setReceiptDetails(null);
            setPaymentDetails(null);
            setBookingError('');
            setCurrentStep(1);
        }
    }, [activeBooking?.status, currentStep, paymentDetails?.status]);

    useEffect(() => {
        let intervalId;

        if (activeBooking?.status === "complete" && activeBooking?.id) {
            loadLatestPayment();

            intervalId = window.setInterval(() => {
                loadLatestPayment({ silent: true });
            }, 5000);
        }

        return () => {
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, [activeBooking?.id, activeBooking?.status, currentStep, loadLatestPayment]);

    const handleLogout = async () => {
        await logoutUser({ navigate, redirectTo: ROUTES.home });
    };

    const handleBookingDraftNext = (draft) => {
        setBookingDraft(draft);
        setBookingError("");
        setFixerRejectMessage("");
        setCurrentStep(2);
    };

    const handleCancelDraftBooking = () => {
        setBookingDraft(null);
        setBookingError("");
        setFixerRejectMessage("");
        setSubmittingBooking(false);
        setActiveBooking(null);
        setCurrentStep(1);
    };

    const handleCreateBooking = async (fixer) => {
        if (!bookingDraft?.categoryId) {
            setBookingError("Please complete the booking form first.");
            setCurrentStep(1);
            return;
        }

        setSubmittingBooking(true);
        setBookingError("");

        try {
            const formData = new FormData();
            setFixerRejectMessage("");
            formData.append("service_id", String(fixer.service_id));
            formData.append("issue_description", bookingDraft.issueDescription);
            formData.append("service_address", bookingDraft.serviceAddress || "");
            formData.append("latitude", String(bookingDraft.latitude));
            formData.append("longitude", String(bookingDraft.longitude));
            formData.append("urgent_level", bookingDraft.urgentLevel);

            if (bookingDraft.scheduledAt) {
                formData.append("scheduled_at", bookingDraft.scheduledAt);
            }

            (bookingDraft.photoFiles || []).forEach((file) => {
                formData.append("images", file);
            });

            const { data } = await httpClient.post("/user/bookings", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const apiBooking = data?.data ?? null;
            const nextBooking = {
                ...(apiBooking || {}),
                id: apiBooking?.id ?? apiBooking?.bookingId ?? null,
                category_name: apiBooking?.category_name || bookingDraft.categoryName,
                category_image: apiBooking?.category_image || bookingDraft.categoryImage || "",
                issue_description: apiBooking?.issue_description || bookingDraft.issueDescription,
                service_address: apiBooking?.service_address || bookingDraft.serviceAddress,
                fixer_name: apiBooking?.fixer_name || fixer.name,
                fixer_avatar: apiBooking?.fixer_avatar || fixer.image,
                fixer_company_name: apiBooking?.fixer_company_name || fixer.companyName,
                status: apiBooking?.status || "pending",
                created_at: apiBooking?.created_at || new Date().toISOString(),
            };
            setActiveBooking(nextBooking);
            syncStepWithBooking(nextBooking);
        } catch (error) {
            console.error(error);
            setBookingError(error.response?.data?.message || "Failed to create booking.");
        } finally {
            setSubmittingBooking(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!activeBooking?.id) {
            return;
        }

        setConfirmingBooking(true);
        setBookingError("");

        try {
            const { data } = await httpClient.post(`/user/bookings/${activeBooking.id}/confirm`);
            const nextBooking = data?.booking ?? null;
            setActiveBooking(nextBooking);
            syncStepWithBooking(nextBooking);
        } catch (error) {
            console.error(error);
            setBookingError(error.response?.data?.message || "Failed to confirm booking.");
        } finally {
            setConfirmingBooking(false);
        }
    };

    const handleRejectBooking = async () => {
        if (!activeBooking?.id) {
            return;
        }

        const reason = window.prompt("Please enter the reason for rejecting this booking:");

        if (reason === null) {
            return;
        }

        const trimmedReason = reason.trim();

        if (!trimmedReason) {
            window.alert("Rejection reason is required.");
            return;
        }

        setRejectingBooking(true);
        setBookingError("");

        try {
            await httpClient.post(`/user/bookings/${activeBooking.id}/reject`, {
                reason: trimmedReason,
                service_id: activeBooking.service_id,
            });
            window.alert("Booking rejected successfully.");
            setActiveBooking(null);
            setBookingDraft(null);
            setCurrentStep(1);
            navigate(ROUTES.dashboardCustomer);
        } catch (error) {
            console.error(error);
            setBookingError(error.response?.data?.message || "Failed to reject booking.");
        } finally {
            setRejectingBooking(false);
        }
    };

    const handleSidebarChange = (tab) => {
        if (tab === 'services') {
            navigate(ROUTES.dashboardCustomer);
            return;
        }
        if (tab === 'booking') {
            setCurrentStep(1); 
            return;
        }
        if (tab === 'history') {
            navigate(ROUTES.dashboardCustomerHistory);
            return;
        }
        if (tab === 'settings') {
            navigate(ROUTES.dashboardCustomerSettings);
            return;
        }
    };

    const handleGoToPayment = useCallback(async () => {
        if (!activeBooking?.id || creatingPayment) {
            return;
        }

        try {
            setCreatingPayment(true);
            setBookingError("");

            await httpClient.post(`/user/bookings/${activeBooking.id}/payments`);
            await loadLatestPayment();
            setCurrentStep(8);
        } catch (error) {
            console.error(error);
            setBookingError(error.response?.data?.message || "Failed to start payment.");
        } finally {
            setCreatingPayment(false);
        }
    }, [activeBooking?.id, creatingPayment, loadLatestPayment]);

    const handleCompletePayment = useCallback(async () => {
        if (!activeBooking?.id || completingPayment) {
            return;
        }

        try {
            setCompletingPayment(true);
            setBookingError("");

            const response = await httpClient.post(`/user/bookings/${activeBooking.id}/payments/complete`);
            const payment = response?.data?.data ?? null;
            setPaymentDetails(payment);
        } catch (error) {
            console.error(error);
            setBookingError(error.response?.data?.message || "Failed to complete payment.");
        } finally {
            setCompletingPayment(false);
        }
    }, [activeBooking?.id, completingPayment]);

    const handleSubmitReview = useCallback(async (payload) => {
        if (!activeBooking?.id) {
            throw new Error('Missing booking id');
        }

        setBookingError('');

        await httpClient.post(`/user/bookings/${activeBooking.id}/review`, payload);

        const normalizedPaymentStatus = String(paymentDetails?.status || '').toLowerCase();

        if (normalizedPaymentStatus !== 'completed') {
            try {
                const response = await httpClient.post(
                    `/user/bookings/${activeBooking.id}/payments/complete`
                );
                setPaymentDetails(response?.data?.data ?? paymentDetails);
            } catch (paymentError) {
                console.error(paymentError);
                setBookingError(
                    paymentError.response?.data?.message ||
                    'Review submitted, but failed to complete payment.'
                );
            }
        }

        setCurrentStep(10);
    }, [activeBooking?.id, paymentDetails]);

    const isCompletedServiceFlow = activeBooking?.status === "complete";
    const activeFixerName =
        activeBooking?.fixer_name ||
        activeBooking?.fixer_company_name ||
        "Your fixer";

    // Calculate progress bar step
    const getProgressBarStep = () => {
        if (currentStep === 1) return 1;
        if (currentStep === 2 || currentStep === 3) return 2;
        if (currentStep === 4) return 3;
        if (currentStep === 5 || currentStep === 6) return 4;
        return 5;
    };

    if (loadingBooking) {
        return (
            <div className="flex h-screen flex-col overflow-hidden">
                <Header />

                <div className="mt-16 flex min-h-0 flex-1 overflow-hidden">
                    <Sidebar
                        activeTab="booking"
                        onChange={handleSidebarChange}
                        onLogout={handleLogout}
                        sticky={false}
                        scrollNav={false}
                        fixed
                    />

                    <main className="ml-64 flex flex-1 items-center justify-center p-10">
                        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 text-slate-500 shadow-sm">
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                            <span>Loading your current booking...</span>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Header />

            <div className="mt-16 flex min-h-0 flex-1 overflow-hidden">
                <Sidebar
                    activeTab="booking"
                    onChange={handleSidebarChange}
                    onLogout={handleLogout}
                    sticky={false}
                    scrollNav={false}
                    fixed
                />

                <main className="ml-64 flex-1 overflow-y-auto p-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div className="flex-1 text-center">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Process</h1>
                                <p className="text-slate-500 font-medium">Follow the steps to complete your service request.</p>
                            </div>
                            {(bookingDraft || currentStep > 1) && currentStep <= 2 && (
                                <button
                                    type="button"
                                    onClick={handleCancelDraftBooking}
                                    aria-label="Cancel draft booking"
                                    title="Cancel draft booking"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {currentStep <= 7 && <ProgressBar currentStep={getProgressBarStep()} />}

                        {bookingError ? (
                            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                                {bookingError}
                            </div>
                        ) : null}

                        <div className="mt-8">
                            {activeBooking?.status === "pending" ? (
                                <WaitingConfirmation
                                    booking={activeBooking}
                                    refreshing={refreshingBooking}
                                    onRefresh={() => loadLatestActiveBooking({ silent: true })}
                                    onTimeout={() => loadLatestActiveBooking({ silent: true })}
                                />
                            ) : activeBooking?.status === "fixer_accept" ? (
                                <BookingAgreement
                                    booking={activeBooking}
                                    submitting={confirmingBooking || rejectingBooking}
                                    onConfirm={handleConfirmBooking}
                                    onReject={handleRejectBooking}
                                />
                            ) : currentStep === 11 ? (
                                <FixerRejectNotice
                                    message={fixerRejectMessage}
                                    onGoBack={handleBackToDescribeIssue}
                                />
                            ) : currentStep === 1 && (
                                <BookingForm
                                    initialData={bookingDraft}
                                    onNext={handleBookingDraftNext}
                                />
                            )}

                            {!activeBooking && currentStep === 2 && (
                                <FindFixer
                                    bookingDraft={bookingDraft}
                                    error={bookingError}
                                    submitting={submittingBooking}
                                    onBook={handleCreateBooking}
                                />
                            )}

                            {!activeBooking && currentStep === 5 && (
                                <FixerArrival booking={bookingDraft} onArrived={() => setCurrentStep(6)} />
                            )}

                            {activeBooking?.status === "customer_accept" && currentStep === 5 && (
                                <FixerArrival booking={activeBooking} onArrived={() => setCurrentStep(6)} />
                            )}

                            {!activeBooking && currentStep === 6 && (
                                <FixingInProgress onComplete={() => setCurrentStep(7)} />
                            )}

                            {activeBooking?.status === "arrived" && currentStep === 6 && (
                                <FixingInProgress fixerName={activeFixerName} />
                            )}

                            {!activeBooking && currentStep === 7 && (
                                <ServiceCompleted onPayment={handleGoToPayment} />
                            )}

                            {isCompletedServiceFlow && currentStep === 7 && (
                                <ServiceCompleted
                                    onPayment={handleGoToPayment}
                                    receipt={receiptDetails}
                                    loading={loadingReceipt}
                                    booking={activeBooking}
                                    submittingPayment={creatingPayment}
                                />
                            )}

                            {!activeBooking && currentStep === 8 && (
                                <PaymentScreen onPaymentComplete={() => setCurrentStep(9)} />
                            )}

                            {isCompletedServiceFlow && currentStep === 8 && (
                                <PaymentScreen
                                    payment={paymentDetails}
                                    booking={activeBooking}
                                    refreshing={loadingPayment}
                                />
                            )}

                            {!activeBooking && currentStep === 9 && (
                                <PaymentSuccess onSubmitReview={() => setCurrentStep(10)} />
                            )}

                            {isCompletedServiceFlow && currentStep === 9 && (
                                <PaymentSuccess
                                    onSubmitReview={handleSubmitReview}
                                    onDone={handleCompletePayment}
                                    booking={activeBooking}
                                    receipt={receiptDetails}
                                    payment={paymentDetails}
                                    completingPayment={completingPayment}
                                />
                            )}

                            {!activeBooking && currentStep === 10 && (
                                <FeedbackSuccess onGoToHistory={() => navigate(ROUTES.dashboardCustomerHistory)} />
                            )}

                            {isCompletedServiceFlow && currentStep === 10 && (
                                <FeedbackSuccess onGoToHistory={() => navigate(ROUTES.dashboardCustomerHistory)} />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
