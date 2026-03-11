import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import MenuItem from '@/lib/db/models/MenuItem';
import { withAuth, withCafeAccess } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';
import mongoose from 'mongoose';

// Get orders for a cafe
export const GET = async (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: any = { cafeSlug: params.slug };

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.createdAt = {
        $gte: targetDate,
        $lt: nextDate,
      };
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    // Get counts
    const pendingCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'pending',
    });

    const preparingCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'preparing',
    });

    const readyCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'ready',
    });

    const servedCount = await Order.countDocuments({
      cafeSlug: params.slug,
      orderStatus: 'served',
    });

    const completedCount = await Order.countDocuments({
      cafeSlug: params.slug,
      paymentStatus: 'completed',
    });

    // Calculate revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.find({
      cafeSlug: params.slug,
      createdAt: { $gte: today },
      paymentStatus: 'completed',
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({
      success: true,
      data: orders,
      stats: {
        pending: pendingCount,
        preparing: preparingCount,
        ready: readyCount,
        served: servedCount,
        completed: completedCount,
        todayRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};

// Create new order (public - no auth required)
export const POST = async (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const body = await req.json();
    const slug = params.slug;

    const itemsInput: Array<{ menuItemId: string; quantity: number }> = Array.isArray(body.items)
      ? body.items
          .map((it: any) => ({
            menuItemId: String(it.menuItemId || it.id),
            quantity: Number(it.quantity),
          }))
          .filter((i: { menuItemId: string; quantity: number }) => i.menuItemId && i.quantity > 0)
      : [];

    if (!body.tableNumber || !body.paymentMethod || itemsInput.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid order payload' },
        { status: 400 }
      );
    }

    const ids = itemsInput.map(i => i.menuItemId).filter(id => mongoose.Types.ObjectId.isValid(id));
    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid items' },
        { status: 400 }
      );
    }
    const menuItems = await MenuItem.find({ _id: { $in: ids }, cafeSlug: slug });
    const priceMap = new Map(
      menuItems.map(mi => [String(mi._id), { name: mi.name, price: mi.price }])
    );

    const items = itemsInput
      .map(i => {
        const found = priceMap.get(String(i.menuItemId));
        if (!found) return null;
        return {
          menuItemId: i.menuItemId,
          name: found.name,
          price: found.price,
          quantity: i.quantity,
        };
      })
      .filter(Boolean) as Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
    }>;

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid items' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const lastOrder = await Order.findOne({ cafeSlug: slug }).sort({ orderNumber: -1 }).select('orderNumber').lean();
    const nextOrderNumber = lastOrder && typeof lastOrder.orderNumber === 'number' ? lastOrder.orderNumber + 1 : 1000;

    const order = await Order.create({
      orderNumber: nextOrderNumber,
      tableNumber: String(body.tableNumber),
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || 'pending',
      items,
      cafeSlug: slug,
      subtotal,
      tax,
      total,
      orderStatus: 'pending',
      upiId: body.upiId,
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};

// Update order status
export const PATCH = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get('id');
    const { orderStatus, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, cafeSlug: params.slug },
      updateData,
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
