import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreatePaymentDto } from "./dto/create-payment.dto";

type IfthenpayMbwayResponse = {
  Amount: number;
  Message: string;
  orderId: number | string;
  RequestId: string;
  Status: string;
};

@Injectable()
export class PaymentsService {
  private readonly mbwayUrl = "https://api.ifthenpay.com/spg/payment";

  constructor(private readonly prisma: PrismaService) { }

  async create(userId: number, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: dto.orderId,
        userId,
      },

      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.paymentStatus === "PAID") {
      throw new BadRequestException("Order is already paid");
    }

    if (order.status === "CANCELLED") {
      throw new BadRequestException(
        "Cancelled orders cannot be paid"
      );
    }

    if (dto.method === "MBWAY") {
      return this.createMbwayPayment(order, dto.mobileNumber!);
    }

    if (dto.method === "CARD") {
      throw new BadRequestException("Card payment is not configured yet");
    }

    throw new BadRequestException("Unsupported payment method");
  }

  private async createMbwayPayment(order: any, mobileNumber: string) {
    const mbWayKey = process.env.IFTHENPAY_MBWAY_KEY;

    if (!mbWayKey) {
      throw new BadRequestException("IFTHENPAY_MBWAY_KEY is not configured");
    }

    const formattedMobile = this.formatMobileNumber(mobileNumber);

    const response = await fetch(`${this.mbwayUrl}/mbway`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",
      },

      body: JSON.stringify({
        mbWayKey,

        orderId: String(order.id),

        amount: Number(order.total).toFixed(2),

        mobileNumber: formattedMobile,

        email: order.user.email,

        description: `Order ${order.id}`,
      }),
    });

    let data: IfthenpayMbwayResponse;

    try {
      data = await response.json();
    } catch {
      throw new BadGatewayException("Invalid response from Ifthenpay");
    }

    if (!response.ok) {
      throw new BadGatewayException(
        data?.Message || "Ifthenpay request failed"
      );
    }

    if (!data.RequestId) {
      throw new BadGatewayException(
        data.Message || "Ifthenpay did not return a payment reference"
      );
    }

    await this.prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        paymentProvider: "IFTHENPAY",

        paymentMethod: "MBWAY",

        paymentReference: data.RequestId,

        paymentStatus: "PENDING",
      },
    });

    return {
      orderId: order.id,

      provider: "IFTHENPAY",

      method: "MBWAY",

      reference: data.RequestId,

      amount: Number(order.total),

      status: "PENDING",

      providerStatus: data.Status,

      providerMessage: data.Message,
    };
  }

  private formatMobileNumber(mobile: string) {
    let number = mobile.replace(/\s/g, "").replace(/^\+/, "");

    if (number.startsWith("351")) {
      number = number.substring(3);
    }

    if (!/^9\d{8}$/.test(number)) {
      throw new BadRequestException("Invalid Portuguese mobile number");
    }

    return `351#${number}`;
  }

  async findByOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },

      select: {
        id: true,
        total: true,

        paymentProvider: true,

        paymentMethod: true,

        paymentReference: true,

        paymentStatus: true,

        paidAt: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async handleMbwayCallback(
    key: string,
    orderIdValue: string,
    amountValue: string,
    requestId: string
  ) {
    const expectedKey = process.env.IFTHENPAY_CALLBACK_KEY;

    if (!expectedKey || key !== expectedKey) {
      throw new BadRequestException("Invalid callback key");
    }

    const orderId = Number(orderIdValue);

    if (!Number.isInteger(orderId)) {
      throw new BadRequestException("Invalid order id");
    }

    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    /*
     * Callback retries can happen.
     * Make it idempotent.
     */
    if (order.paymentStatus === "PAID") {
      return {
        success: true,
      };
    }

    if (
      order.paymentProvider !== "IFTHENPAY" ||
      order.paymentMethod !== "MBWAY"
    ) {
      throw new BadRequestException("Invalid payment provider");
    }

    if (order.paymentReference !== requestId) {
      throw new BadRequestException("Invalid payment reference");
    }

    const callbackAmount = new Prisma.Decimal(amountValue);

    if (!callbackAmount.equals(order.total)) {
      throw new BadRequestException(
        "Payment amount does not match order total"
      );
    }

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentStatus: "PAID",

          status: "PAID",

          paidAt: new Date(),
        },
      }),
    ]);

    return {
      success: true,
    };
  }
}
