import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { logoutUser } from "@/lib/session";
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

    const handleLogout = async () => {
        await logoutUser({ navigate, redirectTo: ROUTES.home });
    };

    const handleBookingDraftNext = (draft) => {
        setBookingDraft(draft);
        setBookingError("");
        setCurrentStep(2);
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

            await httpClient.post("/user/bookings", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setCurrentStep(3);
        } catch (error) {
            console.error(error);
            setBookingError(error.response?.data?.message || "Failed to create booking.");
        } finally {
            setSubmittingBooking(false);
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
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Process</h1>
                            <p className="text-slate-500 font-medium">Follow the steps to complete your service request.</p>
                        </div>

                        {currentStep <= 7 && <ProgressBar currentStep={getProgressBarStep()} />}

                        <div className="mt-8">
                            {currentStep === 1 && (
                                <BookingForm
                                    initialData={bookingDraft}
                                    onNext={handleBookingDraftNext}
                                />
                            )}

                            {currentStep === 2 && (
                                <FindFixer
                                    bookingDraft={bookingDraft}
                                    error={bookingError}
                                    submitting={submittingBooking}
                                    onBook={handleCreateBooking}
                                />
                            )}

                            {currentStep === 3 && (
                                <WaitingConfirmation onConfirmed={() => setCurrentStep(4)} />
                            )}

                            {currentStep === 4 && (
                                <BookingAgreement 
                                    onConfirm={() => setCurrentStep(5)} 
                                    onReject={() => setCurrentStep(2)} 
                                />
                            )}

                            {currentStep === 5 && (
                                <FixerArrival onArrived={() => setCurrentStep(6)} />
                            )}

                            {currentStep === 6 && (
                                <FixingInProgress onComplete={() => setCurrentStep(7)} />
                            )}

                            {currentStep === 7 && (
                                <ServiceCompleted onPayment={() => setCurrentStep(8)} />
                            )}

                            {currentStep === 8 && (
                                <PaymentScreen onPaymentComplete={() => setCurrentStep(9)} />
                            )}

                            {currentStep === 9 && (
                                <PaymentSuccess onSubmitReview={() => setCurrentStep(10)} />
                            )}

                            {currentStep === 10 && (
                                <FeedbackSuccess onGoToHistory={() => navigate(ROUTES.dashboardCustomerHistory)} />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
