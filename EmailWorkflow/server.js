const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.json({ error: 'User already exists' });
        }

        const user = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName: lastName || ''
            }
        });

        try {
            await axios.post('http://localhost:5678/webhook-test/8e271cff-8423-4f7e-a73a-968eba5b2b69', {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            });
        } catch (error) {
            console.log('Webhook failed:', error.message);
        }

        res.json({ success: true, user });

    } catch (error) {
        console.log('Error:', error.message);
        res.json({ error: 'Something went wrong' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.json({ error: 'Failed to get users' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});