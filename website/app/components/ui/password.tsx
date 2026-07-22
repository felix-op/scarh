"use client";

import { useState } from "react";
import { TextField, TextFieldProps } from "./textfield";
import { IconifyIcon } from "./iconify-icon";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "leftIcon" | "rightAction">;

export function PasswordField(props: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      {...props}
      type={showPassword ? "text" : "password"}
      leftIcon={<IconifyIcon variant="perfilPassword" className="text-xl text-primary" />}
      rightAction={{
        icon: (
          <IconifyIcon
            variant={showPassword ? "ocultar" : "ver"}
            className="text-xl"
          />
        ),
        handler: () => setShowPassword((prev) => !prev),
      }}
    />
  );
}

export default PasswordField;
