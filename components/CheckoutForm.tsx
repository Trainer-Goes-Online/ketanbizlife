"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { load, type Cashfree } from "@cashfreepayments/cashfree-js";
import type { ClientConfig, CheckoutBump } from "@/client.config";
import { setMetaAdvancedMatching } from "@/lib/analytics";
import { readCookie, readUtmFromStorage, utmToQueryString } from "@/lib/utm";
import type {
  CashfreeMode,
  CreateOrderResponse,
  VerifyPaymentResponse,
} from "@/lib/types";
import { Icon } from "./Icon";
import styles from "./CheckoutForm.module.css";

interface Props {
  config: ClientConfig;
  mode: CashfreeMode;
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

export function CheckoutForm({ config, mode }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, setState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  /** Selected bump IDs. Bundle bump deselects individual bumps and vice versa. */
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());

  /** Which bump card is currently expanded. Only one open at a time. */
  const [expandedBump, setExpandedBump] = useState<string | null>(null);

  function toggleBump(bumpId: string, isBundle: boolean) {
    setSelectedBumps((prev) => {
      const next = new Set(prev);
      if (next.has(bumpId)) {
        next.delete(bumpId);
        return next;
      }
      if (isBundle) {
        return new Set([bumpId]);
      }
      const bundleId = config.checkout.bumps.find((b) => b.isBundle)?.id;
      if (bundleId) next.delete(bundleId);
      next.add(bumpId);
      return next;
    });
  }

  function toggleExpanded(bumpId: string) {
    setExpandedBump((prev) => (prev === bumpId ? null : bumpId));
  }

  /**
   * Sort bumps so selected items appear first, in selection order.
   * Bundle is pinned to the bottom of unselected list as a "value upsell".
   */
  const orderedBumps = useMemo(() => {
    const all = config.checkout.bumps;
    const selected: CheckoutBump[] = [];
    const unselected: CheckoutBump[] = [];
    for (const b of all) {
      if (selectedBumps.has(b.id)) selected.push(b);
      else unselected.push(b);
    }
    // Push bundle to the end of unselected so it reads as the "go big" option.
    unselected.sort((a, b) => Number(!!a.isBundle) - Number(!!b.isBundle));
    return [...selected, ...unselected];
  }, [config.checkout.bumps, selectedBumps]);

  const bumpsTotal = useMemo(() => {
    return config.checkout.bumps
      .filter((b) => selectedBumps.has(b.id))
      .reduce((sum, b) => sum + b.price, 0);
  }, [config.checkout.bumps, selectedBumps]);

  const grandTotal = config.pricing.price + bumpsTotal;

  // Lazy-load the Cashfree v3 SDK once on mount. `load()` injects the
  // sdk.cashfree.com script tag and resolves with the Cashfree factory; we
  // call it with our mode to get back the instance used to open the modal.
  const cashfreeRef = useRef<Cashfree | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      try {
        const cashfree = await load({ mode });
        if (cancelled || !cashfree) return;
        cashfreeRef.current = cashfree;
        setSdkReady(true);
      } catch (err) {
        console.error("[checkout] Cashfree SDK load failed", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

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
    if (Object.keys(fieldErrors).length > 0) {
      // Scroll first invalid field into view for better mobile UX
      const firstInvalid = Object.keys(fieldErrors)[0];
      const el = document.querySelector(`[data-field="${firstInvalid}"]`);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input) input.focus();
      }
      return;
    }

    if (!sdkReady || !cashfreeRef.current) {
      setGlobalError(
        "Payment is loading — please wait a moment and try again.",
      );
      return;
    }

    setSubmitting(true);

    const fullPhone = `${state.countryCode}${state.phone.trim()}`;
    const customer = {
      firstName: state.firstName.trim(),
      lastName: state.lastName.trim(),
      email: state.email.trim().toLowerCase(),
      phone: fullPhone,
      countryCode: "IN",
      city: state.city.trim(),
    };
    const selectedBumpIds = Array.from(selectedBumps);
    const utm = readUtmFromStorage(config.funnel.sessionStorageKey);
    const fbc = readCookie("_fbc");
    const fbp = readCookie("_fbp");

    try {
      const orderRes = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: config.pricing.currency,
          customer,
          selectedBumpIds,
          utm,
        }),
      });

      if (!orderRes.ok) {
        throw new Error(`create-order failed: ${orderRes.status}`);
      }

      const order: CreateOrderResponse = await orderRes.json();

      const cashfree = cashfreeRef.current;
      if (!cashfree) {
        throw new Error("Cashfree SDK unavailable");
      }

      // Open the modal overlay. The Promise resolves when the modal closes
      // for any reason (success, failure, user dismissal). We can't trust
      // its return value to determine success — only our verify endpoint
      // (which queries Cashfree's API) is authoritative.
      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result?.error) {
        console.warn("[checkout] cashfree modal returned error", result.error);
      }

      const verifyRes = await fetch("/api/cashfree/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          customer,
          utm,
          fbc,
          fbp,
          selectedBumpIds,
          grandTotal,
          // window.location.href becomes event_source_url server-side.
          // Required by Meta CAPI for matching + diagnostic compliance.
          eventSourceUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      if (!verifyRes.ok) {
        const data = (await verifyRes.json().catch(() => null)) as
          | { error?: string; code?: string }
          | null;
        if (data?.code?.startsWith("ORDER_STATUS_")) {
          setGlobalError(
            "Payment wasn't completed. Please try again — your card was not charged.",
          );
        } else {
          setGlobalError(
            data?.error ??
              "We couldn't confirm your payment. Please contact support with order ID " +
                order.orderId,
          );
        }
        setSubmitting(false);
        return;
      }

      const verified: VerifyPaymentResponse = await verifyRes.json();
      if (!verified.success) {
        setGlobalError(verified.message ?? "Payment verification failed");
        setSubmitting(false);
        return;
      }

      // Manual Advanced Matching — set buyer identity on the pixel
      // BEFORE the route change. Meta's auto-PageView fires on every
      // SPA navigation, so MAM must be wired on the current pixel
      // context before /thank-you's PageView goes out. Helper no-ops
      // on non-production hosts because window.fbq is undefined there.
      setMetaAdvancedMatching({
        email: customer.email,
        phone: customer.phone,
        firstName: customer.firstName,
        lastName: customer.lastName,
        city: customer.city,
        country: customer.countryCode,
      });

      const utmQs = utmToQueryString(utm);
      router.push(
        `/thank-you?slug=${encodeURIComponent(config.funnel.slug)}${utmQs}`,
      );
    } catch (err) {
      console.error("[checkout] order error", err);
      setGlobalError(
        "Could not start checkout. Please check your internet connection and try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        {/* ============= YOUR DETAILS (form first for conversion) ============= */}
        <h3 className={styles.sectionLabel}>Your details</h3>

        <div className={styles.row}>
          <Field
            label="First name"
            value={state.firstName}
            error={errors.firstName}
            onChange={(v) => update("firstName", v)}
            onBlur={() => handleBlur("firstName")}
            autoComplete="given-name"
            fieldKey="firstName"
            required
          />
          <Field
            label="Last name"
            value={state.lastName}
            error={errors.lastName}
            onChange={(v) => update("lastName", v)}
            onBlur={() => handleBlur("lastName")}
            autoComplete="family-name"
            fieldKey="lastName"
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
          fieldKey="email"
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
              fieldKey="phone"
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
          fieldKey="city"
          required
        />

        {/* ============= BUMPS (collapsible, checked-first sort) ============= */}
        <div className={styles.bumpsWrap}>
          <div className={styles.bumpsHeading}>
            <h3 className={styles.sectionLabel}>Smart add-ons (optional)</h3>
            <span className={styles.bumpsCount}>
              {selectedBumps.size} selected
            </span>
          </div>
          <p className={styles.bumpsSub}>
            Tap a card to see what&apos;s inside. Check the box to add it.
          </p>

          <LayoutGroup>
            <motion.ul className={styles.bumpList} role="list" layout>
              <AnimatePresence initial={false}>
                {orderedBumps.map((bump) => {
                  const checked = selectedBumps.has(bump.id);
                  const expanded = expandedBump === bump.id;
                  return (
                    <motion.li
                      key={bump.id}
                      layout
                      initial={
                        reduceMotion ? false : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        layout: { duration: 0.32, ease: [0.23, 1, 0.32, 1] },
                        duration: 0.28,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      className={`${styles.bump} ${checked ? styles.bumpChecked : ""} ${bump.isBundle ? styles.bumpBundle : ""}`}
                    >
                      {/* Header row — always visible. Click toggles expansion.
                          Checkbox click stops propagation so it doesn't expand. */}
                      <button
                        type="button"
                        className={styles.bumpHeader}
                        onClick={() => toggleExpanded(bump.id)}
                        aria-expanded={expanded}
                        aria-controls={`bump-panel-${bump.id}`}
                      >
                        <span
                          className={styles.bumpBox}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBump(bump.id, !!bump.isBundle);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleBump(bump.id, !!bump.isBundle);
                            }
                          }}
                          role="checkbox"
                          aria-checked={checked}
                          tabIndex={0}
                        >
                          {checked ? <Icon name="check" size={14} /> : null}
                        </span>

                        <div className={styles.bumpHeaderText}>
                          <div className={styles.bumpHeaderTop}>
                            <span className={styles.bumpTagline}>
                              {bump.tagline}
                            </span>
                            <span className={styles.bumpPrice}>
                              ₹{bump.price}
                            </span>
                          </div>
                          <h4 className={styles.bumpTitle}>{bump.title}</h4>
                        </div>

                        <span
                          className={`${styles.bumpChevron} ${expanded ? styles.bumpChevronOpen : ""}`}
                          aria-hidden="true"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </span>
                      </button>

                      {/* Expanded body */}
                      <AnimatePresence initial={false}>
                        {expanded ? (
                          <motion.div
                            id={`bump-panel-${bump.id}`}
                            key="panel"
                            initial={
                              reduceMotion
                                ? false
                                : { height: 0, opacity: 0 }
                            }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={
                              reduceMotion
                                ? { opacity: 0 }
                                : { height: 0, opacity: 0 }
                            }
                            transition={{
                              duration: 0.32,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className={styles.bumpPanel}
                          >
                            <div className={styles.bumpPanelInner}>
                              <p className={styles.bumpIntro}>{bump.intro}</p>
                              <ul className={styles.bumpBullets}>
                                {bump.bullets.map((b, j) => (
                                  <li key={j}>
                                    <span
                                      className={styles.bumpTick}
                                      aria-hidden="true"
                                    >
                                      <Icon name="check" size={12} />
                                    </span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                              {bump.insight ? (
                                <p className={styles.bumpInsight}>
                                  <span
                                    className={styles.bumpInsightIcon}
                                    aria-hidden="true"
                                  >
                                    <Icon name="lightbulb" size={14} />
                                  </span>
                                  <span>{bump.insight}</span>
                                </p>
                              ) : null}
                              {bump.callToAction ? (
                                <p className={styles.bumpCta}>
                                  <span
                                    className={styles.bumpCtaIcon}
                                    aria-hidden="true"
                                  >
                                    <Icon name="arrow-right" size={14} />
                                  </span>
                                  <span>{bump.callToAction}</span>
                                </p>
                              ) : null}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>
        </div>

        {/* ============= LIVE TOTAL ============= */}
        <div className={styles.totalCard}>
          <div className={styles.totalLine}>
            <span>Webinar registration</span>
            <span className={styles.totalLineValue}>
              ₹{config.pricing.price}
            </span>
          </div>
          {bumpsTotal > 0 ? (
            <div className={styles.totalLine}>
              <span>
                Add-ons ({selectedBumps.size} selected)
              </span>
              <span className={styles.totalLineValue}>+ ₹{bumpsTotal}</span>
            </div>
          ) : null}
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalAmount}>₹{grandTotal}</span>
          </div>
        </div>

        {globalError ? (
          <div role="alert" className={styles.alert}>
            {globalError}
          </div>
        ) : null}

        <p className={styles.disclaimer}>
          Secure payment by Cashfree · UPI, Cards, Net Banking, Wallets
        </p>
      </form>

      {/* ============= STICKY BOTTOM CTA — always visible from page load ============= */}
      <div className={styles.stickyBar} role="region" aria-label="Checkout total">
        <div className={styles.stickyInner}>
          <div className={styles.stickyTotal}>
            <span className={styles.stickyTotalLabel}>Total</span>
            <span className={styles.stickyTotalValue}>₹{grandTotal}</span>
            {bumpsTotal > 0 ? (
              <span className={styles.stickyTotalNote}>
                ₹{config.pricing.price} + ₹{bumpsTotal} add-on
                {selectedBumps.size > 1 ? "s" : ""}
              </span>
            ) : (
              <span className={styles.stickyTotalNote}>
                Webinar registration
              </span>
            )}
          </div>

          <button
            type="button"
            className={styles.stickyButton}
            disabled={submitting || !sdkReady}
            onClick={() => {
              if (formRef.current) {
                formRef.current.requestSubmit();
              }
            }}
          >
            {submitting ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : null}
            <span>{submitting ? "Opening…" : `Pay ₹${grandTotal}`}</span>
            <span className={styles.stickyArrow} aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </>
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
  fieldKey?: string;
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
  fieldKey,
}: FieldProps) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={styles.field} data-field={fieldKey}>
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
