import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { withCafeAccess } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';

export const GET = withCafeAccess(async (
  req: AuthRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const period = searchParams.get('period') || 'today';
    const date = searchParams.get('date');
    const slug = params.slug;

    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (period === 'yesterday') {
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'custom' && date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    }

    const query = {
      cafeSlug: slug,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const orders = await Order.find(query).lean();

    const stats = {
      total: orders.length,
      pending: orders.filter((o: any) => o.orderStatus === 'pending').length,
      preparing: orders.filter((o: any) => o.orderStatus === 'preparing' || o.orderStatus === 'ready').length,
      served: orders.filter((o: any) => o.orderStatus === 'served').length,
      completed: orders.filter((o: any) => o.paymentStatus === 'completed').length,
      cancelled: orders.filter((o: any) => o.orderStatus === 'cancelled').length,
    };

    // Generate chart data (group by hour if today/yesterday, or by day if 7d/30d)
    let chartData: any[] = [];
    if (period === 'today' || period === 'yesterday' || (period === 'custom' && date)) {
      // Group by 2-hour intervals for a cleaner look
      const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
      chartData = hours.map(h => {
        const count = orders.filter((o: any) => {
          const orderHour = new Date(o.createdAt).getHours();
          return orderHour >= h && orderHour < h + 2;
        }).length;
        
        // Format to 12-hour am/pm with dots as requested
         const periodSuffix = h >= 12 ? 'pm' : 'am';
         const displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
         return { name: `${displayHour}.00 ${periodSuffix}`, orders: count };
      });
    } else {
      // Group by day
      const days = period === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = orders.filter((o: any) => 
          new Date(o.createdAt).toISOString().split('T')[0] === dateStr
        ).length;
        chartData.push({ 
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
          orders: count 
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      chartData
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
