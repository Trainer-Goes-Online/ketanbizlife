"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { ClientConfig } from "@/client.config";
import { readCookie, readUtmFromStorage, utmToQueryString } from "@/lib/utm";
import type {
  CreateOrderResponse,
  VerifyPaymentResponse,
} from "@/lib/types";
import styles from "./CheckoutForm.module.css";

interface Props {
  config: ClientConfig;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  city: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+91",
  phone: "",
  city: "",
};

function validate(state: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!state.firstName.trim()) errors.firstName = "First name is required";
  if (!state.lastName.trim()) errors.lastName = "Last name is required";

  if (!state.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(state.email)) {
    errors.email = "Please enter a valid email";
  }

  const fullPhone = `${state.countryCode}${state.phone.trim()}`;
  if (!state.phone.trim()) {
    errors.phone = "Phone is required";
  } else {
    const parsed = parsePhoneNumberFromString(fullPhone);
    if (!parsed || !parsed.isValid()) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  if (!state.city.trim()) errors.city = "City is required";

  return errors;
}

export function CheckoutForm({ config }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Ensure Razorpay SDK is on window before submit
  const [sdkReady, setSdkReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      if (window.Razorpay) {
        setSdkReady(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    const id = window.setInterval(() => {
      if (check()) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function handleBlur(field: keyof FieldErrors) {
    const fieldErrors = validate(state);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);

    const fieldErrors = validate(state);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    if (!sdkReady || !window.Razorpay) {
      setGlobalError(
        "Payment is loading — please wait a moment and try again.",
      );
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: config.pricing.price,
          currency: config.pricing.currency,
        }),
      });

      if (!orderRes.ok) {
        throw new Error(`create-order failed: ${orderRes.status}`);
      }

      const order: CreateOrderResponse = await orderRes.json();

      // 2. Open Razorpay modal
      const fullPhone = `${state.countryCode}${state.phone.trim()}`;
      const utm = readUtmFromStorage(config.funnel.sessionStorageKey);
      const fbc = readCookie("_fbc");
      const fbp = readCookie("_fbp");

      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        throw new Error("Razorpay SDK unavailable");
      }

      const rzp = new RazorpayCtor({
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: config.razorpayModal.brandName,
        description: config.razorpayModal.description,
        image: config.razorpayModal.logoUrl || undefined,
        order_id: order.orderId,
        prefill: {
          name: `${state.firstName} ${state.lastName}`.trim(),
          email: state.email,
          contact: fullPhone,
        },
        notes: {
          city: state.city,
          country_code: "IN",
        },
        theme: { color: config.razorpayModal.themeColor },
        modal: {
          escape: true,
          ondismiss: () => {
            setSubmitting(false);
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                customer: {
                  firstName: state.firstName.trim(),
                  lastName: state.lastName.trim(),
                  email: state.email.trim().toLowerCase(),
                  phone: fullPhone,
                  countryCode: "IN",
                  city: state.city.trim(),
                },
                utm,
                fbc,
                fbp,
              }),
            });

            if (!verifyRes.ok) {
              const data = (await verifyRes.json().catch(() => null)) as
                | { error?: string }
                | null;
              throw new Error(
                data?.error ?? `verify-payment failed: ${verifyRes.status}`,
              );
            }

            const result: VerifyPaymentResponse = await verifyRes.json();
            if (!result.success) {
              throw new Error(result.message ?? "Payment verification failed");
            }

            const utmQs = utmToQueryString(utm);
            router.push(
              `/thank-you?slug=${encodeURIComponent(config.funnel.slug)}${utmQs}`,
            );
          } catch (err) {
            console.error("[checkout] verify-payment error", err);
            setGlobalError(
              "Payment received but verification failed. Please contact support with payment ID " +
                response.razorpay_payment_id,
            );
            setSubmitting(false);
          }
        },
      });

      rzp.open();
    } catch (err) {
      console.error("[checkout] order error", err);
      setGlobalError(
        "Could not start checkout. Please check your internet connection and try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <Field
          label="First name"
          value={state.firstName}
          error={errors.firstName}
          onChange={(v) => update("firstName", v)}
          onBlur={() => handleBlur("firstName")}
          autoComplete="given-name"
          required
        />
        <Field
          label="Last name"
          value={state.lastName}
          error={errors.lastName}
          onChange={(v) => update("lastName", v)}
          onBlur={() => handleBlur("lastName")}
          autoComplete="family-name"
          required
        />
      </div>

      <Field
        label="Email"
        type="email"
        value={state.email}
        error={errors.email}
        onChange={(v) => update("email", v)}
        onBlur={() => handleBlur("email")}
        autoComplete="email"
        inputMode="email"
        required
      />

      <div className={`${styles.row} ${styles.phoneRow}`}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="countryCode">
            Code
          </label>
          <select
            id="countryCode"
            className={styles.select}
            value={state.countryCode}
            onChange={(e) => update("countryCode", e.target.value)}
          >
            <option value="+91">+91 (IN)</option>
            <option value="+971">+971 (AE)</option>
            <option value="+1">+1 (US)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+65">+65 (SG)</option>
          </select>
        </div>
        <div className={styles.phoneField}>
          <Field
            label="Phone (WhatsApp)"
            type="tel"
            value={state.phone}
            error={errors.phone}
            onChange={(v) => update("phone", v)}
            onBlur={() => handleBlur("phone")}
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </div>
      </div>

      <Field
        label="City"
        value={state.city}
        error={errors.city}
        onChange={(v) => update("city", v)}
        onBlur={() => handleBlur("city")}
        autoComplete="address-level2"
        required
      />

      {globalError ? (
        <div role="alert" className={styles.alert}>
          {globalError}
        </div>
      ) : null}

      <button
        type="submit"
        className={styles.submit}
        disabled={submitting || !sdkReady}
      >
        {submitting ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : null}
        <span>
          {submitting
            ? "Opening payment…"
            : `Pay ${config.hero.priceActual} & Reserve My Seat`}
        </span>
      </button>

      <p className={styles.disclaimer}>
        Secure payment by Razorpay · UPI, Cards, Net Banking, Wallets
      </p>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  required?: boolean;
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  autoComplete,
  inputMode,
  required,
}: FieldProps) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={id}
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
      />
      {error ? (
        <p id={`${id}-error`} className={styles.errorMsg}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
