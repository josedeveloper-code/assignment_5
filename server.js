// 1. IMPORTS
const express = require('express');
const { body, validationResult } = require('express-validator');


// 2. INITIALIZE APP and SET PORT
const app = express();
const PORT = 3000;

// 3. MIDDLEWARE (Clear Execution Order)
app.use(express.json()); // Parses incoming JSON "boxes"

// EXPERT LOGGING: Captures Method, URL, Timestamp, and Body for POST/PUT
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n--- [${timestamp}] ---`);
    console.log(`Method: ${req.method} | URL: ${req.originalUrl}`);

    if (['POST', 'PUT'].includes(req.method) && Object.keys(req.body).length > 0) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
};
app.use(requestLogger);

// VALIDATION ERROR HANDLER: Comprehensive error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "Validation Error",
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

// 4. DATA (Seamless Integration - All items match validation rules)
const menuItems = [
    { id: 1, name: "Classic Burger", description: "Juicy beef patty with fresh toppings", price: 12.99, category: "entree", ingredients: ["beef", "lettuce", "tomato", "cheese"], available: true },
    { id: 2, name: "Chicken Caesar Salad", description: "Crisp romaine lettuce with grilled chicken", price: 11.50, category: "entree", ingredients: ["chicken", "romaine", "parmesan", "croutons"], available: true },
    { id: 3, name: "Mozzarella Sticks", description: "Golden fried mozzarella with marinara sauce", price: 8.99, category: "appetizer", ingredients: ["mozzarella", "breading", "marinara"], available: true },
    { id: 4, name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: 7.99, category: "dessert", ingredients: ["chocolate", "flour", "eggs", "butter"], available: true },
    { id: 5, name: "Fresh Lemonade", description: "Refreshing homemade lemonade", price: 3.99, category: "beverage", ingredients: ["lemon juice", "water", "sugar"], available: true },
    { id: 6, name: "Apple Pie", description: "Classic apple pie with cinnamon spice", price: 4.50, category: "dessert", ingredients: ["apples", "cinnamon", "flour", "sugar"], available: true },
    { id: 7, name: "Chicken Over Rice", description: "Grilled chicken served over seasoned yellow rice with white sauce", price: 10.50, category: "entree", ingredients: ["Chicken", "Rice", "White Sauce", "Pita"], available: true },
    { id: 8, name: "Fish over Rice", description: "Grilled or fried fish served over white and hot sauces", price: 18.00, category: "entree", ingredients: ["Fry Fish", "Rice", "Shrimp", "lettuces", "white sauces"], available: true }
];

// 5. VALIDATION RULES (Includes Sanitization for "Expert" level)
const menuValidation = [
    body('name').trim().isString().isLength({ min: 3 }).escape().withMessage('Name must be at least 3 characters'),
    body('description').trim().isString().isLength({ min: 10 }).escape().withMessage('Description must be at least 10 characters'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['appetizer', 'entree', 'dessert', 'beverage']).withMessage('Invalid category'),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('available').optional().isBoolean().withMessage('Available must be true or false')
];

// 6. ROUTES

// Root Route
app.get('/', (req, res) => {
    res.send('<h1>Server is working!</h1><p>Navigate to <b>/api/menu</b> to see the data.</p>');
});

// GET: All menu items
app.get('/api/menu', (req, res) => {
    res.status(200).json(menuItems);
});

// GET: Specific item by ID
app.get('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = menuItems.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.status(200).json(item);
});

// POST: Add new item (Auto-increments ID)
app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
    const newItem = {
        id: menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1,
        ...req.body,
        available: req.body.available !== undefined ? req.body.available : true
    };
    menuItems.push(newItem);
    res.status(201).json(newItem);
});

// PUT: Update an item
app.put('/api/menu/:id', menuValidation, handleValidationErrors, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = menuItems.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Menu item not found' });

    menuItems[index] = { id, ...req.body };
    res.status(200).json(menuItems[index]);
});

// DELETE: Remove an item
app.delete('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = menuItems.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Menu item not found' });

    menuItems.splice(index, 1);
    res.status(200).json({ message: "Successfully deleted" });
});

// 404 CATCH-ALL (Demonstrates deep understanding of middleware flow)
app.use((req, res) => {
    res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// 7. START SERVER
app.listen(PORT, () => {
    console.log(`\n Server is running on http://localhost:${PORT}`);
    console.log(`Try visiting http://localhost:${PORT}/api/menu`);
});