// server.js
import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();

// Allow requests from http://localhost:5173
app.use(cors({ origin: 'http://localhost:5173' }));

const stripe = new Stripe('''''''''''''''''); // Replace with your actual secret key

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Endpoint to Create a Customer
app.post('/create-customer', async (req, res) => {
    try {
        const { email, name } = req.body;
        const customer = await stripe.customers.create({ email, name });
        res.status(200).json({ success: true, customer });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Endpoint to Create a Payment Intent (for card payments)
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, customer } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer,
            payment_method_types: ['card'],
        });
        res.status(200).json({ success: true, paymentIntent });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Endpoint to Create a Subscription (recurring payments)
app.post('/create-subscription', async (req, res) => {
    try {
        const { customerId, priceId } = req.body;
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });
        res.status(200).json({ success: true, subscription });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Endpoint to Create a Product and Price (used for subscriptions or items)
app.post('/create-product', async (req, res) => {
    try {
        const { name, description, amount, currency } = req.body;
        const product = await stripe.products.create({ name, description });
        const price = await stripe.prices.create({
            unit_amount: amount,
            currency,
            product: product.id,
        });
        res.status(200).json({ success: true, product, price });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Endpoint to Retrieve a Customer’s Payment Methods
app.get('/list-payment-methods/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        res.status(200).json({ success: true, paymentMethods });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Endpoint to Process a Refund
app.post('/refund', async (req, res) => {
    try {
        const { paymentIntentId, amount } = req.body;
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount,
        });
        res.status(200).json({ success: true, refund });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. Endpoint to Retrieve a Customer's Subscriptions
app.get('/subscriptions/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
        });
        res.status(200).json({ success: true, subscriptions });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. Endpoint to Update Customer Details
app.post('/update-customer', async (req, res) => {
    try {
        const { customerId, name, email } = req.body;
        const customer = await stripe.customers.update(customerId, { name, email });
        res.status(200).json({ success: true, customer });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
