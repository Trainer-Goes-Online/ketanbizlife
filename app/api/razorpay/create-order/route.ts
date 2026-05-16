import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import type {
  ApiErrorResponse,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_CURRENCIES = new Set(["INR"]);

export async function POST(
  request: Request,
): Promise<NextResponse<CreateOrderResponse | ApiErrorResponse>> {
  let body: CreateOrderRequest;
  try {
    body = (await request.json()) as CreateOrderRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);
  const currency = body.currency;

  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid amount" },
      { status: 400 },
    );
  }

  if (typeof currency !== "string" || !SUPPORTED_CURRENCIES.has(currency)) {
    return NextResponse.json(
      { success: false, error: "Unsupported currency" },
      { status: 400 },
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    return NextResponse.json(
      {
        success: false,
        error: "Server is missing Razorpay credentials",
        code: "MISSING_KEY_ID",
      },
      { status: 500 },
    );
  }

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { source: "ketan-bizlife-lp" },
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency,
      keyId,
    });
  } catch (err) {
    console.error("[create-order] Razorpay order creation failed", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create Razorpay order",
        code: "RAZORPAY_ORDER_FAILED",
      },
      { status: 500 },
    );
  }
}
