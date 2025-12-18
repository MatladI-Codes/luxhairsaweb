// api/payments/notify.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    try {
        const pfData = req.body;
        const orderId = pfData.custom_str1;
        const paymentStatus = pfData.payment_status;
        
        console.log('PayFast notification:', orderId, paymentStatus);
        
        let dbStatus = 'pending';
        if (paymentStatus === 'COMPLETE') dbStatus = 'completed';
        if (paymentStatus === 'FAILED') dbStatus = 'failed';
        
        await supabase
            .from('orders')
            .update({
                payment_status: dbStatus,
                paid_at: dbStatus === 'completed' ? new Date().toISOString() : null
            })
            .eq('order_id', orderId);
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Notify error:', error);
        res.status(500).send('Error');
    }
};