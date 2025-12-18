// api/payments/eft/create.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { order, customer } = req.body;
        
        if (!order || !customer) {
            return res.status(400).json({ error: 'Missing order or customer data' });
        }

        const orderId = 'ORD-' + Date.now();
        const reference = 'LUX' + Date.now();
        
        // Save to Supabase
        await supabase.from('orders').insert({
            order_id: orderId,
            customer_email: customer.email,
            customer_first_name: customer.firstName,
            customer_last_name: customer.lastName,
            customer_phone: customer.phone,
            shipping_address: customer.address || '',
            shipping_city: customer.city || '',
            shipping_province: customer.province || '',
            shipping_postal_code: customer.postalCode || '',
            payment_method: 'eft',
            payment_status: 'pending',
            subtotal: order.subtotal,
            shipping_cost: order.shipping || 0,
            total: order.total,
            created_at: new Date().toISOString()
        });

        // Save order items
        if (order.items) {
            const items = order.items.map(item => ({
                order_id: orderId,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }));
            await supabase.from('order_items').insert(items);
        }

        res.json({
            success: true,
            orderId,
            paymentMethod: 'eft',
            bankDetails: {
                orderId,
                reference,
                bank: 'Standard Bank',
                accountName: 'LuxHair ZA',
                accountNumber: 'XXXXXXXXXX',
                branchCode: '051001',
                amount: order.total,
                instructions: [
                    '1. Make EFT payment using reference: ' + reference,
                    '2. Email proof to: payments@luxhairza.co.za',
                    '3. Order processes once verified'
                ]
            }
        });
        
    } catch (error) {
        console.error('EFT error:', error);
        res.status(500).json({ error: error.message });
    }
};