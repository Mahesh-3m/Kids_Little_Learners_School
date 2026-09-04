-- ================================================================
-- OPTIONAL SEED SCRIPT FOR LITTLE LEARNERS
-- NOTE: DO NOT EXECUTE AUTOMATICALLY IN PRODUCTION.
-- Run this script ONLY if you wish to populate demo products in the
-- Kids Store or a sample teacher account in development.
-- ================================================================

-- Sample Teacher Account (password: teacher123)
-- Hash generated using werkzeug.security: scrypt:32768:8:1$...
INSERT INTO teachers (name, email, password_hash)
VALUES (
    'Anjali Sharma',
    'teacher@littlelearners.com',
    'scrypt:32768:8:1$kXfP8yW8Qx3HkGg$87c80536ce4401bb0540e118931a7894dbe140bf16091ba81cb60d738f6b0f4fa6eebfdf43f65600c92bb944f2d7bfd5a23f46fba2b281f6d338f0d8b4c09d57'
)
ON DUPLICATE KEY UPDATE name=name;

-- Sample Kids Store Products (Books, Stationery, Toys, Kids Dresses)
INSERT INTO products (name, category, description, price, image_url, stock, is_active)
VALUES
-- 📚 Books
(
    'My First Alphabet & Phonics Picture Book',
    'books',
    'Colorful hardcover picture book filled with large letters, bright phonics illustrations, and sensory touch textures.',
    14.99,
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
    25,
    1
),
(
    'Bedtime Fairy Tales & Animal Adventures',
    'books',
    'Delightful collection of 15 short moral bedtime stories designed for early readers and parent-child reading time.',
    12.50,
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60',
    18,
    1
),
(
    'Big Numbers & Math Activity Workbook',
    'books',
    'Fun tracing, counting, and pattern matching workbook for Nursery, LKG, and UKG learners.',
    9.99,
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60',
    30,
    1
),

-- ✏️ Stationery
(
    'Jumbo Washable Triangular Crayons (24 Pack)',
    'stationery',
    'Non-toxic, break-resistant jumbo crayons ergonomically designed for tiny toddler hands. Easily washes off walls and clothes.',
    7.99,
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=60',
    40,
    1
),
(
    'Kids Safety Scissors & Craft Paper Kit',
    'stationery',
    'Blunt-tip safety scissors that cut paper but cannot cut skin or hair, paired with 50 sheets of vibrant craft paper.',
    6.49,
    'https://images.unsplash.com/photo-1588072432836-e10032774350?w=500&auto=format&fit=crop&q=60',
    15,
    1
),
(
    'Smiley Face Personalized School Backpack',
    'stationery',
    'Lightweight, water-resistant ergonomic backpack with padded shoulder straps and dual bottle holders.',
    22.00,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
    12,
    1
),

-- 🧸 Toys
(
    'Wooden Geometric Shape Sorter & Stacker',
    'toys',
    'Eco-friendly natural wood puzzle featuring circles, triangles, rectangles, and stars to build fine motor skills.',
    16.99,
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60',
    20,
    1
),
(
    'Magnetic Alphabet & Number Fishing Game',
    'toys',
    'Interactive wooden board game where kids catch letters and fish using magnetic rods to learn spellings and counting.',
    19.95,
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&auto=format&fit=crop&q=60',
    8,
    1
),
(
    'Super Soft Plush Cuddle Bear',
    'toys',
    'Hypoallergenic, ultra-cuddly stuffed teddy bear that provides comforting companionship for little learners.',
    15.00,
    'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=500&auto=format&fit=crop&q=60',
    0, -- Out of Stock demo
    1
),

-- 👕 Kids Dresses
(
    'Rainbow Splash Cotton T-Shirt & Shorts Set',
    'dresses',
    '100% breathable organic cotton summer outfit featuring cheery rainbow prints. Soft on sensitive young skin.',
    18.50,
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=60',
    25,
    1
),
(
    'Little Learners School Uniform Polo (Navy/White)',
    'dresses',
    'Durable, stain-resistant pique cotton polo shirt with embroidered Little Learners logo badge.',
    14.00,
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop&q=60',
    35,
    1
),
(
    'Sunny Day Floral Play Dress',
    'dresses',
    'Soft twirl-ready cotton dress with vibrant floral motifs, perfect for preschool activities and school picnics.',
    21.00,
    'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=500&auto=format&fit=crop&q=60',
    14,
    1
);
