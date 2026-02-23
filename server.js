// I Must to IMPORTS of express and express-validator (for validation)

const express = require('express');
const { body, validationResult } = require('express-validator');

// 2. I INITIALIZE APP and SET PORT NUMBER 3000
const app = express();
const PORT = 3000;

// 3. (Make sure that MIDDLEWARE always Must come before routes!)
app.use(express.json());

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
};
app.use(requestLogger);

// This handles the 400 status code requirement for validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// 4. DATA (The Menu)
const menuItems = [
    { id: 1, name: "Classic Burger", price: 12.99, category: "entree", available: true },
    { id: 2, name: "Chicken Caesar Salad", price: 11.50, category: "entree", available: true },
    { id: 3, name: "Mozzarella Sticks", price: 8.99, category: "appetizer", available: true },
    { id: 4, name: "Chocolate Lava Cake", price: 7.99, category: "dessert", available: true },
    { id: 5, name: "Fresh Lemonade", price: 3.99, category: "beverage", available: true }
];

// 5. VALIDATION RULES (Checking the "Box")
const menuValidation = [
    body('name').isString().isLength({ min: 3 }).withMessage('Name must be at least 3 chars'),
    body('description').isString().isLength({ min: 10 }).withMessage('Description must be at least 10 chars'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('category').isIn(['appetizer', 'entree', 'dessert', 'beverage']).withMessage('Invalid category'),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient required'),
    body('available').optional().isBoolean()
];

// 6. ROUTES

// GET: Retrieve all menu items (Status Code: 200)
app.get('/api/menu', (req, res) => {
    res.status(200).json(menuItems);
});

// GET: Retrieve a specific menu item (Status Code: 200 or 404)
app.get('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = menuItems.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json(item);
});

// POST: Add a new item (Status Code: 201)
app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
    const newItem = {
        id: menuItems.length + 1,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        ingredients: req.body.ingredients,
        available: req.body.available !== undefined ? req.body.available : true
    };

    menuItems.push(newItem);
    res.status(201).json(newItem);
});

// PUT: Update an item (Status Code: 200 or 404)
app.put('/api/menu/:id', menuValidation, handleValidationErrors, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = menuItems.findIndex(i => i.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    const updated = {
        id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        ingredients: req.body.ingredients,
        available: req.body.available !== undefined ? req.body.available : true
    };

    menuItems[index] = updated;
    res.status(200).json(updated);
});

// DELETE: Remove an item (Status Code: 200 or 404)
app.delete('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = menuItems.findIndex(i => i.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    menuItems.splice(index, 1);
    res.status(200).json({ message: "Successfully deleted" });
});

// 7. START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});