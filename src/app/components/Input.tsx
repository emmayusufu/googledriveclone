import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorText?: string;
  helperText?: string;
  required?: boolean;
  formatNumber?: boolean;
}

const Input: React.FC<FormInputProps> = ({
  type = "text",
  label,
  required,
  error,
  errorText,
  helperText,
  onChange,
  value,
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPassword = type === "password";
  const finalType = isPassword ? (passwordVisible ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs font-[450] text-gray-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={finalType}
          value={value}
          onChange={onChange}
          className={`w-full h-10 px-3 pr-10 rounded border text-sm transition-all 
            ${
              error
                ? "border-red-500"
                : "border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-[0.5px]"
            }
            focus:outline-none bg-gray-50 placeholder:text-gray-400`}
          placeholder={props.placeholder}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {passwordVisible ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {(errorText || helperText) && (
        <p
          className={`text-xs pl-1 ${
            errorText ? "text-red-500" : "text-gray-500"
          }`}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
