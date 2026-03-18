import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import BookingForm from './components/BookingForm';
import FindFixer from './components/FindFixer';
import WaitingConfirmation from './components/WaitingConfirmation';
import BookingAgreement from './components/BookingAgreement';
import FixerArrival from './components/FixerArrival';
import FixingInProgress from './components/FixingInProgress';
import ServiceCompleted from './components/ServiceCompleted';
import PaymentScreen from './components/PaymentScreen';
import PaymentSuccess from './components/PaymentSuccess';
import FeedbackSuccess from './components/FeedbackSuccess';

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  const MotionDiv = Motion.div;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookingForm onNext={() => setCurrentStep(2)} />;
      case 2:
        return <FindFixer onBook={() => setCurrentStep(3)} />;
      case 3:
        return <WaitingConfirmation onConfirmed={() => setCurrentStep(3.5)} />;
      case 3.5:
        return (
          <BookingAgreement
            onConfirm={() => setCurrentStep(4)}
            onReject={() => setCurrentStep(2)}
          />
        );
      case 4:
        return <FixerArrival onArrived={() => setCurrentStep(5)} />;
      case 5:
        return <FixingInProgress onComplete={() => setCurrentStep(6)} />;
      case 6:
        return <ServiceCompleted onPayment={() => setCurrentStep(7)} />;
      case 7:
        return <PaymentScreen onPaymentComplete={() => setCurrentStep(8)} />;
      case 8:
        return <PaymentSuccess onSubmitReview={() => setCurrentStep(9)} />;
      case 9:
        return <FeedbackSuccess onGoToHistory={() => setCurrentStep(1)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <Header />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 py-8 scroll-smooth">
          <div className="max-w-5xl mx-auto">
            {/* Progress Bar for steps 1-6 */}
            {currentStep < 7 && <ProgressBar currentStep={currentStep} />}

            {/* Step content with smooth transitions */}
            <AnimatePresence mode="wait">
              <MotionDiv
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderStep()}
              </MotionDiv>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}