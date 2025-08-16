"use client";

import React from "react";
import styles from "./AccentButton.module.scss";

export type AccentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

const AccentButton = React.forwardRef<HTMLButtonElement, AccentButtonProps>(
  ({ className, children, ...rest }, ref) => {
    const classes = [styles.button, className].filter(Boolean).join(" ");
    return (
      <button ref={ref} className={classes} {...rest}>
        {children}
      </button>
    );
  }
);

AccentButton.displayName = "AccentButton";
export default AccentButton;
