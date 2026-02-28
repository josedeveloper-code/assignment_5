// 1. IMPORTS (Always at the top)
const express = require('express');
const { body, validationResult } = require('express-validator');

// 2. INITIALIZE APP and SET PORT
const app = express();
const PORT = 3000;

// 3. MIDDLEWARE
app.use(express.json());

// Request Logger Middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
};
app.use(requestLogger);

// Validation Error Handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// 4. DATA (The Menu)
const menuItems = [{
        id: 1,
        name: "Classic Burger",
        description: "Juicy beef patty with fresh toppings",
        price: 12.99,
        category: "entree",
        ingredients: ["beef", "lettuce", "tomato", "cheese"],
        available: true
    },
    {
        id: 2,
        name: "Chicken Caesar Salad",
        description: "Crisp romaine lettuce with grilled chicken",
        price: 11.50,
        category: "entree",
        ingredients: ["chicken", "romaine", "parmesan", "croutons"],
        available: true
    },
    {
        id: 3,
        name: "Mozzarella Sticks",
        description: "Golden fried mozzarella with marinara sauce",
        price: 8.99,
        category: "appetizer",
        ingredients: ["mozzarella", "breading", "marinara"],
        available: true
    },
    {
        id: 4,
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center",
        price: 7.99,
        category: "dessert",
        ingredients: ["chocolate", "flour", "eggs", "butter"],
        available: true
    },
    {
        id: 5,
        name: "Fresh Lemonade",
        description: "Refreshing homemade lemonade",
        price: 3.99,
        category: "beverage",
        ingredients: ["lemon juice", "water", "sugar"],
        available: true
    },
    {
        id: 6,
        name: "Apple Pie",
        description: "Classic apple pie with cinnamon spice",
        price: 4.50,
        category: "dessert",
        ingredients: ["apples", "cinnamon", "flour", "sugar"],
        available: true
    },
    {
        id: 7, // Fixed ID from 6 to 7
        name: "Chicken Over Rice",
        description: "Grilled chicken served over seasoned yellow rice with white sauce",
        price: 10.50,
        category: "entree",
        ingredients: ["Chicken", "Rice", "White Sauce", "Pita"],
        available: true
    },
    {
        id: 8, // fish over rice
        name: "Fish over Rice",
        description: "Grilled fish of fry served over white sauces and Hot sauces",
        price: 18.00,
        category: "entree",
        ingredients: ["Fry Fish", "Rice", "Shrimp", "lettuces", "white sauces", ]
    }
];

// 5. VALIDATION RULES
const menuValidation = [
    body('name').isString().isLength({ min: 3 }).withMessage('Name must be at least 3 chars'),
    body('description').isString().isLength({ min: 10 }).withMessage('Description must be at least 10 chars'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('category').isIn(['appetizer', 'entree', 'dessert', 'beverage']).withMessage('Invalid category'),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient required'),
    body('available').optional().isBoolean()
];

// 6. ROUTES

// Root route (so http://localhost:3000 shows something)
app.get('/', (req, res) => {
    res.send('<h1>Server is working!</h1><p>Navigate to /api/menu to see the data.</p>');
});

// POST: Add new item(Auto-Increments ID))
app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
    const newItem = {
        id: menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1,
        ...req.body,
        available: req.body.available !== undefined ? req.body.available : true
    };
    menuItems.push(newitem);
    res.status(201).json(newItem);
});

// DELETE The Remote of the items 
app.delete('/api/menu/:id', (req, res) => {})

// GET: Retrieve all menu items
app.get('/api/menu', (req, res) => {
    res.status(200).json(menuItems);
});

// GET: Retrieve a specific item
app.get('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = menuItems.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.status(200).json(item);
});

// POST: Add a new item
app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
    const newItem = {
        id: menuItems.length + 1,
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

// 7. START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});