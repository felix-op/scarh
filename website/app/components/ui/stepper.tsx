import React from "react";
import { IconifyIcon } from "./iconify-icon";

export interface StepperProps {
  currentStep: number;
  steps: string[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-10 px-4">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={idx}>
            {/* Círculo de Paso */}
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 z-10
                  ${isCompleted ? "bg-success text-success-contrast" : ""}
                  ${isActive ? "bg-primary text-primary-contrast ring-4 ring-primary-light/35 scale-110" : ""}
                  ${!isActive && !isCompleted ? "bg-background-paper border border-input-border text-foreground-disabled" : ""}
                `}
              >
                {isCompleted ? (
                  <span className="icon-[material-symbols--check] text-lg" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium transition-colors duration-300 absolute top-10 whitespace-nowrap
                  ${isActive ? "text-primary font-bold" : "text-foreground-disabled"}
                  ${isCompleted ? "text-success" : ""}
                `}
              >
                {step}
              </span>
            </div>

            {/* Línea Conectora */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-input-border relative -mt-4">
                <div
                  className="absolute top-0 left-0 h-full bg-success transition-all duration-500"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;
