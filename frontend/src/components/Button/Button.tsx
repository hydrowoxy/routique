"use client";

import React from "react";
import styles from "./Button.module.scss";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...rest }, ref) => {
    const classes = [styles.button, className].filter(Boolean).join(" ");
    return (
      <button ref={ref} className={classes} {...rest}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
