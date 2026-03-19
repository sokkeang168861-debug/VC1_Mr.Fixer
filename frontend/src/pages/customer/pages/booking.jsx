import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { logoutUser } from "@/lib/session";
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

    const handleLogout = async () => {
        await logoutUser({ navigate, redirectTo: ROUTES.home });
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
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <Sidebar
                    activeTab="booking"
                    onChange={handleSidebarChange}
                    onLogout={handleLogout}
                    sticky={false}
                    scrollNav={false}
                />

                <main className="flex-1 min-h-0 overflow-y-auto p-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Process</h1>
                            <p className="text-slate-500 font-medium">Follow the steps to complete your service request.</p>
                        </div>

                        {currentStep <= 7 && <ProgressBar currentStep={getProgressBarStep()} />}

                        <div className="mt-8">
                            {currentStep === 1 && (
                                <BookingForm onNext={() => setCurrentStep(2)} />
                            )}

                            {currentStep === 2 && (
                                <FindFixer onBook={() => setCurrentStep(3)} />
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
