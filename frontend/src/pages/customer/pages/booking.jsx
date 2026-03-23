import React, { useCallback, useEffect, useState } from 'react';
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
            setCurrentStep(5);
        }
    }, []);

    const loadLatestActiveBooking = useCallback(async ({ silent = false } = {}) => {
        if (silent) {
            setRefreshingBooking(true);
        } else {
            setLoadingBooking(true);
        }

        try {
            const { data } = await httpClient.get("/user/bookings/latest-active");
            const nextBooking = data?.booking ?? null;
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
    }, [syncStepWithBooking]);

    useEffect(() => {
        loadLatestActiveBooking();
    }, [loadLatestActiveBooking]);

    useEffect(() => {
        const socket = createAppSocket();

        socket.on("booking:updated", (booking) => {
            setActiveBooking(booking);
            syncStepWithBooking(booking);
            setBookingError("");
            setRefreshingBooking(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [syncStepWithBooking]);

    const handleLogout = async () => {
        await logoutUser({ navigate, redirectTo: ROUTES.home });
    };

    const handleBookingDraftNext = (draft) => {
        setBookingDraft(draft);
        setBookingError("");
        setCurrentStep(2);
    };

    const handleCancelDraftBooking = () => {
        setBookingDraft(null);
        setBookingError("");
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

            const nextBooking = {
                id: data?.bookingId,
                category_name: bookingDraft.categoryName,
                issue_description: bookingDraft.issueDescription,
                service_address: bookingDraft.serviceAddress,
                status: "pending",
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

        setRejectingBooking(true);
        setBookingError("");

        try {
            await httpClient.post(`/user/bookings/${activeBooking.id}/reject`);
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

                <div className="flex flex-1 overflow-hidden">
                    <Sidebar
                        activeTab="booking"
                        onChange={handleSidebarChange}
                        onLogout={handleLogout}
                        sticky={false}
                        scrollNav={false}
                    />

                    <main className="flex flex-1 items-center justify-center p-10">
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

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    activeTab="booking"
                    onChange={handleSidebarChange}
                    onLogout={handleLogout}
                    sticky={false}
                    scrollNav={false}
                />

                <main className="flex-1 overflow-y-auto p-10">
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

                        <div className="mt-8">
                            {activeBooking?.status === "pending" ? (
                                <WaitingConfirmation
                                    booking={activeBooking}
                                    refreshing={refreshingBooking}
                                    onRefresh={() => loadLatestActiveBooking({ silent: true })}
                                />
                            ) : activeBooking?.status === "fixer_accept" ? (
                                <BookingAgreement
                                    booking={activeBooking}
                                    submitting={confirmingBooking || rejectingBooking}
                                    onConfirm={handleConfirmBooking}
                                    onReject={handleRejectBooking}
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
                                <FixerArrival onArrived={() => setCurrentStep(6)} />
                            )}

                            {activeBooking?.status === "customer_accept" && currentStep === 5 && (
                                <FixerArrival onArrived={() => setCurrentStep(6)} />
                            )}

                            {!activeBooking && currentStep === 6 && (
                                <FixingInProgress onComplete={() => setCurrentStep(7)} />
                            )}

                            {activeBooking?.status === "customer_accept" && currentStep === 6 && (
                                <FixingInProgress onComplete={() => setCurrentStep(7)} />
                            )}

                            {!activeBooking && currentStep === 7 && (
                                <ServiceCompleted onPayment={() => setCurrentStep(8)} />
                            )}

                            {activeBooking?.status === "customer_accept" && currentStep === 7 && (
                                <ServiceCompleted onPayment={() => setCurrentStep(8)} />
                            )}

                            {!activeBooking && currentStep === 8 && (
                                <PaymentScreen onPaymentComplete={() => setCurrentStep(9)} />
                            )}

                            {activeBooking?.status === "customer_accept" && currentStep === 8 && (
                                <PaymentScreen onPaymentComplete={() => setCurrentStep(9)} />
                            )}

                            {!activeBooking && currentStep === 9 && (
                                <PaymentSuccess onSubmitReview={() => setCurrentStep(10)} />
                            )}

                            {activeBooking?.status === "customer_accept" && currentStep === 9 && (
                                <PaymentSuccess onSubmitReview={() => setCurrentStep(10)} />
                            )}

                            {!activeBooking && currentStep === 10 && (
                                <FeedbackSuccess onGoToHistory={() => navigate(ROUTES.dashboardCustomerHistory)} />
                            )}

                            {activeBooking?.status === "customer_accept" && currentStep === 10 && (
                                <FeedbackSuccess onGoToHistory={() => navigate(ROUTES.dashboardCustomerHistory)} />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
