// api/auth/orders.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        // Get user's orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get order items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const { data: items } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', order.order_id);

                return {
                    ...order,
                    items: items || []
                };
            })
        );

        res.json({
            success: true,
            orders: ordersWithItems
        });
        
    } catch (error) {
        console.error('Orders fetch error:', error);
        res.status(500).json({ error: error.message });
    }
};