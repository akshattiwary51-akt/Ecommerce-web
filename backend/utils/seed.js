require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Product = require('../models/Product')

const users = [
  { name: 'Admin User',   email: 'admin@shopease.com', password: 'admin123', role: 'admin' },
  { name: 'Jane Doe',     email: 'jane@example.com',   password: 'user1234', role: 'user' },
]

const products = [

  // ─────────────────────────────────────────
  // ELECTRONICS (14 products)
  // ─────────────────────────────────────────
  {
    name: 'Wireless Noise-Cancelling Headphones Pro',
    description: 'Premium over-ear headphones with 40dB active noise cancellation, 30-hour battery life, multipoint Bluetooth 5.3, and foldable design. Hi-Res Audio certified with 40mm drivers. Includes hard-shell travel case.',
    price: 12999, discountPrice: 8999, brand: 'SoundCore', category: 'electronics',
    stockQty: 45, avgRating: 4.7, reviewCount: 312, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/1e3a8a/white?text=Headphones+Pro', isPrimary: true }],
  },
  {
    name: 'Mechanical Gaming Keyboard TKL RGB',
    description: 'Tenkeyless mechanical keyboard with Cherry MX Red linear switches, per-key RGB backlighting, aircraft-grade aluminium top plate, and N-key rollover. Detachable USB-C cable included.',
    price: 6999, discountPrice: 4999, brand: 'TechForce', category: 'electronics',
    stockQty: 38, avgRating: 4.6, reviewCount: 178, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/312e81/white?text=Gaming+Keyboard', isPrimary: true }],
  },
  {
    name: '27" 4K IPS Monitor 144Hz',
    description: '27-inch 4K UHD (3840×2160) IPS panel with 144Hz refresh rate, 1ms MPRT response, HDR400, 99% sRGB coverage, and height-adjustable stand. DisplayPort 1.4 + 2× HDMI 2.1 ports.',
    price: 34999, discountPrice: 27999, brand: 'ViewMax', category: 'electronics',
    stockQty: 20, avgRating: 4.8, reviewCount: 95, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/0c4a6e/white?text=4K+Monitor', isPrimary: true }],
  },
  {
    name: 'True Wireless Earbuds ANC',
    description: 'Compact TWS earbuds with active noise cancellation, 8-hour playback (32hr with case), IPX5 water resistance, touch controls, and transparency mode. Supports aptX and AAC codecs.',
    price: 4999, discountPrice: 3499, brand: 'SoundCore', category: 'electronics',
    stockQty: 90, avgRating: 4.4, reviewCount: 441,
    images: [{ url: 'https://placehold.co/600x400/1e40af/white?text=TWS+Earbuds', isPrimary: true }],
  },
  {
    name: 'Portable Bluetooth Speaker 30W',
    description: '30W 360° stereo speaker with dual passive radiators, IPX7 waterproof rating, 18-hour playtime, and built-in powerbank (10,000mAh). Party mode links up to 100 compatible speakers.',
    price: 5499, discountPrice: 3999, brand: 'BoomBox', category: 'electronics',
    stockQty: 55, avgRating: 4.5, reviewCount: 267,
    images: [{ url: 'https://placehold.co/600x400/0369a1/white?text=BT+Speaker', isPrimary: true }],
  },
  {
    name: 'Mechanical Wired Gaming Mouse',
    description: 'Ergonomic gaming mouse with 26,000 DPI optical sensor, 8 programmable buttons, 16.8M RGB lighting, 1000Hz polling rate, and braided cable. PTFE feet for ultra-smooth glide.',
    price: 2999, discountPrice: 1999, brand: 'TechForce', category: 'electronics',
    stockQty: 70, avgRating: 4.5, reviewCount: 213,
    images: [{ url: 'https://placehold.co/600x400/4c1d95/white?text=Gaming+Mouse', isPrimary: true }],
  },
  {
    name: 'Smart LED Desk Lamp with Wireless Charging',
    description: 'Eye-care LED desk lamp with 5 colour temperatures (2700–6500K), 10 brightness levels, USB-A port, 15W Qi wireless charging pad base, and memory function. Flicker-free, anti-glare.',
    price: 2499, discountPrice: 1799, brand: 'LumiDesk', category: 'electronics',
    stockQty: 80, avgRating: 4.3, reviewCount: 134,
    images: [{ url: 'https://placehold.co/600x400/0e7490/white?text=Desk+Lamp', isPrimary: true }],
  },
  {
    name: '65W GaN USB-C Charger (4-Port)',
    description: 'Compact GaN charger with 2× USB-C (65W + 30W PD) and 2× USB-A (22.5W QC 4.0) ports. Charges a laptop, phone, tablet, and earbuds simultaneously. Universal voltage (100–240V).',
    price: 2999, discountPrice: 1999, brand: 'PowerPulse', category: 'electronics',
    stockQty: 110, avgRating: 4.7, reviewCount: 389,
    images: [{ url: 'https://placehold.co/600x400/164e63/white?text=GaN+Charger', isPrimary: true }],
  },
  {
    name: 'Smart WiFi Security Camera 4MP',
    description: '4MP indoor/outdoor camera with colour night vision, AI human detection, two-way audio, IP66 weatherproofing, and local/cloud storage. Works with Alexa and Google Home.',
    price: 3499, discountPrice: 2499, brand: 'SafeView', category: 'electronics',
    stockQty: 40, avgRating: 4.2, reviewCount: 156,
    images: [{ url: 'https://placehold.co/600x400/1c1917/white?text=Security+Cam', isPrimary: true }],
  },
  {
    name: 'Graphic Tablet A5 with Stylus',
    description: '8×5 inch active drawing area with 8192 pressure levels, ±60° tilt recognition, battery-free stylus, and 8 customisable express keys. Compatible with Photoshop, Illustrator, Clip Studio.',
    price: 5999, discountPrice: 4499, brand: 'DrawPad', category: 'electronics',
    stockQty: 28, avgRating: 4.6, reviewCount: 88,
    images: [{ url: 'https://placehold.co/600x400/3b0764/white?text=Drawing+Tablet', isPrimary: true }],
  },
  {
    name: 'Smart Plug with Energy Monitoring',
    description: 'Wi-Fi smart plug with real-time energy monitoring, scheduling, countdown timer, and voice control support. Max 16A / 3680W. Works with Alexa, Google Home, and SmartThings.',
    price: 999, discountPrice: 699, brand: 'HomeIQ', category: 'electronics',
    stockQty: 200, avgRating: 4.4, reviewCount: 502,
    images: [{ url: 'https://placehold.co/600x400/052e16/white?text=Smart+Plug', isPrimary: true }],
  },
  {
    name: '1TB NVMe SSD M.2 Gen4',
    description: 'PCIe Gen 4.0 NVMe SSD with read speeds up to 7,400 MB/s and write up to 6,800 MB/s. DRAM cache, MTBF 1.5M hours, 5-year warranty. Ideal for gaming and creative workloads.',
    price: 7999, discountPrice: 5999, brand: 'DataSpeed', category: 'electronics',
    stockQty: 55, avgRating: 4.8, reviewCount: 221,
    images: [{ url: 'https://placehold.co/600x400/172554/white?text=NVMe+SSD', isPrimary: true }],
  },
  {
    name: 'Webcam 4K with Ring Light',
    description: '4K 30fps / 1080p 60fps webcam with built-in ring light (3 temperatures), dual stereo microphones with noise cancellation, autofocus, and 90° FOV. Plug-and-play USB-C.',
    price: 4499, discountPrice: 3299, brand: 'StreamCam', category: 'electronics',
    stockQty: 35, avgRating: 4.3, reviewCount: 167,
    images: [{ url: 'https://placehold.co/600x400/1e3a8a/white?text=4K+Webcam', isPrimary: true }],
  },
  {
    name: 'Digital Kitchen Scale 5kg Precision',
    description: 'High-precision kitchen scale with 1g accuracy up to 5kg, large LCD backlit display, tare function, 4 unit modes (g/oz/lb/ml), low battery indicator, and auto-off. Includes batteries.',
    price: 799, discountPrice: 549, brand: 'PreciseWeigh', category: 'electronics',
    stockQty: 130, avgRating: 4.5, reviewCount: 318,
    images: [{ url: 'https://placehold.co/600x400/134e4a/white?text=Kitchen+Scale', isPrimary: true }],
  },

  // ─────────────────────────────────────────
  // CLOTHING (14 products)
  // ─────────────────────────────────────────
  {
    name: "Men's Slim-Fit Oxford Shirt",
    description: "Classic slim-fit Oxford shirt in 100% combed cotton. Spread collar, button-down placket, single chest pocket. Machine washable. Available in white, light blue, and navy.",
    price: 1499, discountPrice: 999, brand: 'StyleHub', category: 'clothing',
    stockQty: 120, avgRating: 4.3, reviewCount: 89,
    images: [{ url: 'https://placehold.co/600x400/0f766e/white?text=Oxford+Shirt', isPrimary: true }],
  },
  {
    name: "Women's High-Waist Straight Jeans",
    description: "Classic straight-leg jeans with high-rise waist, 5-pocket styling, and zip fly. Crafted from stretch denim (98% cotton, 2% elastane) for all-day comfort. Available in indigo and black.",
    price: 2499, discountPrice: 1799, brand: 'DenimCo', category: 'clothing',
    stockQty: 95, avgRating: 4.4, reviewCount: 143, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/1e3a5f/white?text=Straight+Jeans', isPrimary: true }],
  },
  {
    name: "Unisex Oversized Graphic Tee",
    description: "100% ring-spun cotton boxy-fit tee with a dropped shoulder, crew neck, and original screen-printed graphic. Pre-washed for a soft, broken-in feel from day one. Sizes XS–3XL.",
    price: 799, discountPrice: 599, brand: 'UrbanThreads', category: 'clothing',
    stockQty: 200, avgRating: 4.2, reviewCount: 256,
    images: [{ url: 'https://placehold.co/600x400/374151/white?text=Graphic+Tee', isPrimary: true }],
  },
  {
    name: "Women's Floral Wrap Midi Dress",
    description: "Elegant wrap-style midi dress in lightweight chiffon with a floral print, adjustable tie waist, V-neckline, and flutter sleeves. Fully lined. Perfect for brunch, events, and vacations.",
    price: 2999, discountPrice: 1999, brand: 'BloomWear', category: 'clothing',
    stockQty: 75, avgRating: 4.6, reviewCount: 118, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/9d174d/white?text=Wrap+Dress', isPrimary: true }],
  },
  {
    name: "Men's Slim Chino Trousers",
    description: "Slim-fit chinos in a cotton-twill blend with a mid-rise waist, zip fly, and two side pockets. Wrinkle-resistant fabric. Smart-casual look from desk to dinner. Available in 6 colours.",
    price: 1999, discountPrice: 1399, brand: 'StyleHub', category: 'clothing',
    stockQty: 85, avgRating: 4.3, reviewCount: 72,
    images: [{ url: 'https://placehold.co/600x400/78350f/white?text=Chino+Trousers', isPrimary: true }],
  },
  {
    name: "Women's Ribbed Turtleneck Sweater",
    description: "Cosy slim-fit turtleneck in a premium wool-acrylic blend with fine ribbing throughout, drop-shoulder fit, and ribbed cuffs and hem. Hand wash cold. Available in cream, charcoal, and camel.",
    price: 2299, discountPrice: 1599, brand: 'KnitCo', category: 'clothing',
    stockQty: 60, avgRating: 4.5, reviewCount: 97,
    images: [{ url: 'https://placehold.co/600x400/57534e/white?text=Turtleneck', isPrimary: true }],
  },
  {
    name: "Unisex Zip-Up Hoodie Fleece",
    description: "Mid-weight fleece hoodie with full-zip closure, kangaroo pocket, ribbed cuffs, and adjustable drawstring hood. 80% cotton / 20% polyester. Pre-shrunk, pill-resistant fabric.",
    price: 1899, discountPrice: 1299, brand: 'UrbanThreads', category: 'clothing',
    stockQty: 140, avgRating: 4.4, reviewCount: 204,
    images: [{ url: 'https://placehold.co/600x400/1c1917/white?text=Zip+Hoodie', isPrimary: true }],
  },
  {
    name: "Women's Pleated Palazzo Pants",
    description: "Wide-leg palazzo pants in flowy viscose crepe with front pleats, an elasticated waistband, and side pockets. Pairs with fitted tops or blazers. Available in black, ivory, and sage green.",
    price: 1699, discountPrice: 1099, brand: 'BloomWear', category: 'clothing',
    stockQty: 88, avgRating: 4.3, reviewCount: 61,
    images: [{ url: 'https://placehold.co/600x400/064e3b/white?text=Palazzo+Pants', isPrimary: true }],
  },
  {
    name: "Men's Quilted Puffer Jacket",
    description: "Lightweight quilted puffer with a channel-stitch design, water-repellent shell, stand-up collar, two zip pockets, and an inner chest pocket. Packs into its own pocket. Wind-resistant.",
    price: 3999, discountPrice: 2799, brand: 'NorthLayer', category: 'clothing',
    stockQty: 50, avgRating: 4.6, reviewCount: 132, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/0c4a6e/white?text=Puffer+Jacket', isPrimary: true }],
  },
  {
    name: "Women's Sports Bra High Impact",
    description: "High-support sports bra with wide padded straps, a racerback silhouette, moisture-wicking fabric, removable padding, and a hook-and-eye back closure. Rated for running and HIIT.",
    price: 1299, discountPrice: 899, brand: 'ActiveFit', category: 'clothing',
    stockQty: 110, avgRating: 4.5, reviewCount: 188,
    images: [{ url: 'https://placehold.co/600x400/4c1d95/white?text=Sports+Bra', isPrimary: true }],
  },
  {
    name: "Men's Cotton Jogger Pants",
    description: "Relaxed-fit joggers in French terry cotton with an elastic waistband, adjustable drawstring, tapered leg, ribbed ankle cuffs, and two deep side pockets. Ideal for lounging or light workouts.",
    price: 1399, discountPrice: 999, brand: 'ActiveFit', category: 'clothing',
    stockQty: 150, avgRating: 4.2, reviewCount: 177,
    images: [{ url: 'https://placehold.co/600x400/292524/white?text=Jogger+Pants', isPrimary: true }],
  },
  {
    name: "Women's Linen Blazer",
    description: "Single-button linen-blend blazer with notched lapels, flap pockets, a chest pocket, and a half-lined interior. Relaxed yet polished. Ideal for the office, brunch, or travel. 60% linen, 40% viscose.",
    price: 3499, discountPrice: 2499, brand: 'StyleHub', category: 'clothing',
    stockQty: 42, avgRating: 4.7, reviewCount: 54,
    images: [{ url: 'https://placehold.co/600x400/713f12/white?text=Linen+Blazer', isPrimary: true }],
  },
  {
    name: "Unisex Canvas Sneakers",
    description: "Classic low-top canvas sneakers with a vulcanised rubber outsole, OrthoLite insole, padded collar, and reinforced toe cap. Available in 8 colours and sizes UK 4–12. Vegan-friendly materials.",
    price: 1999, discountPrice: 1499, brand: 'StreetStep', category: 'clothing',
    stockQty: 180, avgRating: 4.4, reviewCount: 319,
    images: [{ url: 'https://placehold.co/600x400/374151/white?text=Canvas+Sneakers', isPrimary: true }],
  },
  {
    name: "Women's Knit Beanie Hat",
    description: "Chunky ribbed beanie in a soft acrylic-wool blend with a double-layered brim for extra warmth. One size fits most. Available in 10 colours including camel, burgundy, forest green, and black.",
    price: 599, discountPrice: 399, brand: 'KnitCo', category: 'clothing',
    stockQty: 220, avgRating: 4.3, reviewCount: 143,
    images: [{ url: 'https://placehold.co/600x400/7f1d1d/white?text=Beanie+Hat', isPrimary: true }],
  },

  // ─────────────────────────────────────────
  // HOME & KITCHEN (14 products)
  // ─────────────────────────────────────────
  {
    name: 'Non-Stick Cookware Set (7 Piece)',
    description: 'Hard-anodised aluminium cookware set including 20cm and 24cm frying pans, 18cm and 22cm saucepans, and a 26cm casserole with lid. PFOA-free granite coating, induction-compatible, oven-safe to 200°C.',
    price: 5999, discountPrice: 3999, brand: 'KitchenPro', category: 'home-kitchen',
    stockQty: 45, avgRating: 4.5, reviewCount: 187, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/92400e/white?text=Cookware+Set', isPrimary: true }],
  },
  {
    name: 'Air Fryer 5.5L Digital',
    description: '5.5L family-sized air fryer with digital touchscreen, 8 preset modes (fry, roast, bake, grill, dehydrate + more), 360° rapid air circulation, and dishwasher-safe basket. Up to 85% less oil.',
    price: 6999, discountPrice: 4999, brand: 'CrispMaster', category: 'home-kitchen',
    stockQty: 60, avgRating: 4.7, reviewCount: 534, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/422006/white?text=Air+Fryer', isPrimary: true }],
  },
  {
    name: 'Cold Press Slow Juicer',
    description: 'Masticating cold-press juicer with 80 RPM slow squeeze motor that preserves enzymes and vitamins. Juices leafy greens, fruits, and wheatgrass. BPA-free parts, reverse function, easy-clean design.',
    price: 8999, discountPrice: 6499, brand: 'NutriPress', category: 'home-kitchen',
    stockQty: 30, avgRating: 4.6, reviewCount: 112,
    images: [{ url: 'https://placehold.co/600x400/365314/white?text=Slow+Juicer', isPrimary: true }],
  },
  {
    name: 'Stand Mixer 1000W 5L Bowl',
    description: 'Professional 1000W stand mixer with 5L stainless steel bowl, 6-speed settings + pulse, planetary mixing action, tilt-head design, and 3 attachments: dough hook, flat beater, and balloon whisk.',
    price: 12999, discountPrice: 9499, brand: 'BakePro', category: 'home-kitchen',
    stockQty: 22, avgRating: 4.8, reviewCount: 93, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/7f1d1d/white?text=Stand+Mixer', isPrimary: true }],
  },
  {
    name: 'Bamboo Cutting Board Set (3 Piece)',
    description: 'Set of 3 sustainably sourced bamboo cutting boards in small, medium, and large sizes. Juice grooves on one side, smooth surface on the other. Naturally antibacterial and knife-friendly. Includes wall-mount rack.',
    price: 1299, discountPrice: 899, brand: 'EcoChop', category: 'home-kitchen',
    stockQty: 140, avgRating: 4.4, reviewCount: 278,
    images: [{ url: 'https://placehold.co/600x400/713f12/white?text=Cutting+Boards', isPrimary: true }],
  },
  {
    name: 'Stainless Steel Knife Set (6 Piece)',
    description: 'Forged high-carbon stainless steel knife set including chef, bread, santoku, utility, paring knives, and honing steel. Full-tang construction, ergonomic pakkawood handles, and acacia wood block.',
    price: 4999, discountPrice: 3299, brand: 'SharpEdge', category: 'home-kitchen',
    stockQty: 50, avgRating: 4.6, reviewCount: 215,
    images: [{ url: 'https://placehold.co/600x400/1c1917/white?text=Knife+Set', isPrimary: true }],
  },
  {
    name: 'French Press Coffee Maker 1L',
    description: 'Double-wall insulated stainless steel French press with a 4-stage filtration plunger, heat-safe borosilicate glass inner, and heat-retaining outer. Keeps coffee hot for 1+ hour. 1 litre (8 cups).',
    price: 1999, discountPrice: 1399, brand: 'BrewMaster', category: 'home-kitchen',
    stockQty: 75, avgRating: 4.5, reviewCount: 301,
    images: [{ url: 'https://placehold.co/600x400/292524/white?text=French+Press', isPrimary: true }],
  },
  {
    name: 'Ceramic Dinner Set (16 Piece)',
    description: 'Complete 16-piece ceramic dinner set for 4: 4 dinner plates (27cm), 4 salad plates (21cm), 4 soup bowls, and 4 mugs. Microwave and dishwasher safe, chip-resistant glaze. Available in white and sage.',
    price: 3999, discountPrice: 2799, brand: 'TableCraft', category: 'home-kitchen',
    stockQty: 38, avgRating: 4.4, reviewCount: 146,
    images: [{ url: 'https://placehold.co/600x400/d6d3d1/1c1917?text=Dinner+Set', isPrimary: true }],
  },
  {
    name: 'Vacuum Food Sealer with Rolls',
    description: 'Automatic vacuum sealer with one-touch operation, moist and dry modes, pulse function, and built-in cutter. Includes 2× 3m bag rolls. Extends food freshness up to 5× longer. Compact and countertop-friendly.',
    price: 2999, discountPrice: 1999, brand: 'FreshLock', category: 'home-kitchen',
    stockQty: 55, avgRating: 4.3, reviewCount: 189,
    images: [{ url: 'https://placehold.co/600x400/0c4a6e/white?text=Vacuum+Sealer', isPrimary: true }],
  },
  {
    name: 'Cast Iron Skillet 26cm Pre-Seasoned',
    description: 'Pre-seasoned 26cm cast iron skillet for superior heat retention and even cooking. Works on all hob types including induction. Oven and campfire safe. Includes silicone handle cover and care guide.',
    price: 2499, discountPrice: 1799, brand: 'IronCook', category: 'home-kitchen',
    stockQty: 65, avgRating: 4.7, reviewCount: 393,
    images: [{ url: 'https://placehold.co/600x400/1c1917/white?text=Cast+Iron+Pan', isPrimary: true }],
  },
  {
    name: 'Over-Door Pantry Organiser (5 Tier)',
    description: '5-tier over-door storage rack in powder-coated steel with adjustable basket heights, non-slip hooks, and a 25kg load rating. Fits doors 2–4cm thick. Ideal for pantry, bathroom, or laundry rooms.',
    price: 1899, discountPrice: 1299, brand: 'SpaceSmart', category: 'home-kitchen',
    stockQty: 80, avgRating: 4.2, reviewCount: 167,
    images: [{ url: 'https://placehold.co/600x400/292524/white?text=Door+Organiser', isPrimary: true }],
  },
  {
    name: 'Glass Meal Prep Containers (10 Set)',
    description: 'Set of 10 borosilicate glass containers in 3 sizes (2× 1100ml, 4× 700ml, 4× 450ml) with airtight snap-lock lids. Microwave, oven (without lid), freezer, and dishwasher safe. BPA-free lids.',
    price: 2299, discountPrice: 1599, brand: 'FreshLock', category: 'home-kitchen',
    stockQty: 90, avgRating: 4.6, reviewCount: 422,
    images: [{ url: 'https://placehold.co/600x400/0e7490/white?text=Glass+Containers', isPrimary: true }],
  },
  {
    name: 'Electric Kettle 1.7L Temperature Control',
    description: 'Variable temperature electric kettle with 5 presets (70°C, 80°C, 85°C, 90°C, 100°C), 30-min keep-warm, 1500W rapid boil, 360° cordless base, and double-wall insulation. BPA-free food-grade stainless interior.',
    price: 2799, discountPrice: 1999, brand: 'BrewMaster', category: 'home-kitchen',
    stockQty: 68, avgRating: 4.5, reviewCount: 258,
    images: [{ url: 'https://placehold.co/600x400/134e4a/white?text=Smart+Kettle', isPrimary: true }],
  },
  {
    name: 'Robot Vacuum Cleaner 2700Pa',
    description: 'Smart robot vacuum with 2700Pa suction, LiDAR navigation, auto room mapping, selective room cleaning, 180-min runtime, auto-return charging, and HEPA filtration. Works with Alexa and Google Assistant.',
    price: 19999, discountPrice: 14999, brand: 'CleanBot', category: 'home-kitchen',
    stockQty: 18, avgRating: 4.6, reviewCount: 204, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/172554/white?text=Robot+Vacuum', isPrimary: true }],
  },

  // ─────────────────────────────────────────
  // SPORTS (8 products)
  // ─────────────────────────────────────────
  {
    name: 'Running Shoes — Lightweight Mesh',
    description: 'Engineered mesh upper for maximum breathability, responsive foam midsole, and durable rubber outsole with multi-directional grip. Drop: 8mm. Ideal for road running, gym training, and daily wear. Sizes UK 6–12.',
    price: 4999, discountPrice: 3499, brand: 'SwiftStride', category: 'sports',
    stockQty: 80, avgRating: 4.6, reviewCount: 347, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Adjustable Dumbbell Set 5–25kg',
    description: 'Space-saving selectorized dumbbell set that replaces 9 pairs of dumbbells. Turn the dial to adjust weight in 2.5kg increments from 5 to 25kg. Durable ABS casing with chrome handle. Includes storage tray.',
    price: 12999, discountPrice: 9499, brand: 'IronFlex', category: 'sports',
    stockQty: 30, avgRating: 4.7, reviewCount: 189, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Professional Cricket Bat — English Willow Grade 1',
    description: 'Grade 1 English willow cricket bat with a short handle, thick edges (38mm), pronounced spine, and pre-knocked face. Supplied with full grain leather grip and anti-scuff sheet. Weight: 1.19–1.22kg.',
    price: 5499, discountPrice: 3999, brand: 'CricketPro', category: 'sports',
    stockQty: 40, avgRating: 4.5, reviewCount: 112,
    images: [{ url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Official Size 5 Football — Match Pro',
    description: 'FIFA Inspected match football with thermally bonded 32-panel construction, butyl bladder for optimal air retention, and textured surface for consistent flight. Suitable for grass, turf, and futsal surfaces.',
    price: 1999, discountPrice: 1399, brand: 'GoalKing', category: 'sports',
    stockQty: 95, avgRating: 4.4, reviewCount: 231,
    images: [{ url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Yoga Block & Strap Set',
    description: 'High-density EVA foam yoga block (23×15×10cm) with bevelled edges paired with a 2.5m adjustable cotton yoga strap. Supports deeper stretches, improves alignment, and is perfect for beginners and advanced practitioners alike.',
    price: 699, discountPrice: 499, brand: 'ZenFit', category: 'sports',
    stockQty: 150, avgRating: 4.3, reviewCount: 278,
    images: [{ url: 'https://images.unsplash.com/photo-1545389336-cf090694435a?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Resistance Band Set (5 Levels)',
    description: 'Set of 5 latex resistance bands in progressive resistance levels (5–45kg): yellow, red, green, blue, and black. Suitable for physiotherapy, strength training, pull-up assist, and stretching. Anti-snap tested to 5,000+ reps.',
    price: 999, discountPrice: 699, brand: 'ElastiForce', category: 'sports',
    stockQty: 200, avgRating: 4.5, reviewCount: 412,
    images: [{ url: 'https://images.unsplash.com/photo-1598971638856-b10c7f3c2e49?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Speed Jump Rope — Bearings Handle',
    description: 'Professional speed rope with 360° ball-bearing handles, adjustable 3m PVC cable (trimmable), and ergonomic foam grips. Supports up to 200 skips/min. Ideal for HIIT, boxing, and CrossFit training.',
    price: 599, discountPrice: 399, brand: 'SpeedSkip', category: 'sports',
    stockQty: 170, avgRating: 4.4, reviewCount: 334,
    images: [{ url: 'https://images.unsplash.com/photo-1624804807293-c92a7e285cac?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Swimming Goggles Anti-Fog UV',
    description: 'Wide-angle silicone swimming goggles with anti-fog UV400 polycarbonate lenses, leak-proof dual-seal gaskets, split strap for stable fit, and included nose bridge sizes (S/M/L). Suitable for pool and open water.',
    price: 799, discountPrice: 549, brand: 'AquaVision', category: 'sports',
    stockQty: 120, avgRating: 4.5, reviewCount: 197,
    images: [{ url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },

  // ─────────────────────────────────────────
  // BOOKS (8 products)
  // ─────────────────────────────────────────
  {
    name: 'Atomic Habits — James Clear',
    description: "The #1 New York Times bestseller on building good habits and breaking bad ones. Clear's practical framework — the Four Laws of Behaviour Change — has helped millions rewire routines one tiny step at a time. Paperback, 320 pages.",
    price: 699, discountPrice: 499, brand: 'Penguin Random House', category: 'books',
    stockQty: 200, avgRating: 4.9, reviewCount: 1423, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'The Psychology of Money — Morgan Housel',
    description: "Timeless lessons on wealth, greed, and happiness. Housel explores how people think about money through 19 short stories, arguing that doing well financially has more to do with behaviour than intelligence. Paperback, 256 pages.",
    price: 599, discountPrice: 429, brand: 'Harriman House', category: 'books',
    stockQty: 180, avgRating: 4.8, reviewCount: 987,
    images: [{ url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: "The Hitchhiker's Guide to the Galaxy — Douglas Adams",
    description: "The comedic sci-fi classic that follows Arthur Dent's intergalactic adventures after Earth is demolished. Witty, absurdist, and endlessly quotable — a must-read for any book lover. Paperback, 193 pages.",
    price: 499, discountPrice: 349, brand: 'Pan Books', category: 'books',
    stockQty: 140, avgRating: 4.8, reviewCount: 762,
    images: [{ url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: "Sapiens: A Brief History of Humankind — Yuval Noah Harari",
    description: "A sweeping narrative of human history from the Stone Age to the 21st century. Harari challenges everything we thought we knew about being human — our biology, communities, cultures, and impact on the planet. Paperback, 443 pages.",
    price: 799, discountPrice: 549, brand: 'Vintage Books', category: 'books',
    stockQty: 160, avgRating: 4.7, reviewCount: 1102,
    images: [{ url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Think and Grow Rich — Napoleon Hill',
    description: "The all-time bestselling personal development book. Hill's 13 principles of success — drawn from interviews with 500 of the most successful people of the early 20th century — remain as relevant today as ever. Paperback, 238 pages.",
    price: 399, discountPrice: 279, brand: 'Fingerprint Publishing', category: 'books',
    stockQty: 220, avgRating: 4.6, reviewCount: 834,
    images: [{ url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: "Rich Dad Poor Dad — Robert T. Kiyosaki",
    description: "The personal finance classic that has changed the way millions think about money. Kiyosaki shares the contrasting financial philosophies of his two 'dads' to reveal the key mindset shifts that separate the wealthy from everyone else. Paperback, 336 pages.",
    price: 499, discountPrice: 349, brand: 'Plata Publishing', category: 'books',
    stockQty: 190, avgRating: 4.6, reviewCount: 1045,
    images: [{ url: 'https://images.unsplash.com/photo-1524995997946-a1ac8c5dae10?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: "The Alchemist — Paulo Coelho",
    description: "A magical fable about following your dreams. The story of Santiago, an Andalusian shepherd boy, has touched the hearts of millions around the world. A beautifully simple yet profoundly moving novel. Paperback, 208 pages.",
    price: 399, discountPrice: 299, brand: 'HarperOne', category: 'books',
    stockQty: 250, avgRating: 4.7, reviewCount: 1287,
    images: [{ url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: "Deep Work — Cal Newport",
    description: "Newport argues that the ability to focus without distraction is the most valuable skill in our economy. Packed with rules and rituals for cultivating a deep work habit, this book is essential for anyone in a knowledge-based career. Paperback, 304 pages.",
    price: 649, discountPrice: 449, brand: 'Grand Central Publishing', category: 'books',
    stockQty: 130, avgRating: 4.7, reviewCount: 678,
    images: [{ url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },

  // ─────────────────────────────────────────
  // TOYS (8 products)
  // ─────────────────────────────────────────
  {
    name: 'LEGO Classic Creative Brick Box 1500pcs',
    description: '1500-piece LEGO classic brick set in 33 colours with special elements including windows, doors, and wheels. Comes with 11 starter building ideas to spark creativity. Suitable for ages 4+. Box dimensions: 47×37×17cm.',
    price: 4999, discountPrice: 3799, brand: 'LEGO', category: 'toys',
    stockQty: 55, avgRating: 4.9, reviewCount: 543, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Stuffed Teddy Bear 45cm — Premium Plush',
    description: 'Irresistibly soft and huggable 45cm teddy bear made from hypoallergenic premium plush fabric with a weighted poly pellet fill for a satisfying hug. Embroidered eyes for child safety. Suitable from birth. Machine washable.',
    price: 999, discountPrice: 699, brand: 'CuddleCo', category: 'toys',
    stockQty: 120, avgRating: 4.8, reviewCount: 389,
    images: [{ url: 'https://images.unsplash.com/photo-1562040506-a9bda4f15d78?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Wooden Building Blocks Set — 100 Pieces',
    description: '100-piece natural hardwood building blocks in geometric shapes — cubes, cylinders, arches, and triangles — with smooth sanded edges and a non-toxic finish. Develops fine motor skills and STEM thinking. Suitable for ages 1–8. Includes storage bag.',
    price: 1299, discountPrice: 899, brand: 'WoodPlay', category: 'toys',
    stockQty: 85, avgRating: 4.7, reviewCount: 224,
    images: [{ url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Remote Control Monster Truck 4WD',
    description: '1:12 scale 4WD RC monster truck with 2.4GHz anti-interference remote, all-terrain rubber tyres, independent shock absorbers, 25km/h top speed, and 40-min charge for 20-min runtime. Works on sand, grass, and dirt.',
    price: 2499, discountPrice: 1799, brand: 'TurboRace', category: 'toys',
    stockQty: 60, avgRating: 4.5, reviewCount: 312,
    images: [{ url: 'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Jigsaw Puzzle 1000 Pieces — World Map',
    description: 'Premium 1000-piece jigsaw puzzle featuring a beautifully illustrated vintage world map. Precision-cut pieces with linen finish to reduce glare. Assembled size: 68×48cm. Suitable for ages 12+. Includes poster guide.',
    price: 799, discountPrice: 549, brand: 'PuzzleWorks', category: 'toys',
    stockQty: 95, avgRating: 4.6, reviewCount: 187,
    images: [{ url: 'https://images.unsplash.com/photo-1606503153255-59d5e417b6b7?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Science Experiment Kit for Kids',
    description: '50+ STEM science experiments including volcano eruptions, crystal growing, pH strips, and polymer slime. All chemicals pre-measured and child-safe. Includes lab coat, goggles, and full-colour instruction booklet. Ages 8–14.',
    price: 1999, discountPrice: 1399, brand: 'BrainSpark', category: 'toys',
    stockQty: 70, avgRating: 4.7, reviewCount: 256,
    images: [{ url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Board Game — Catan (Standard Edition)',
    description: "The world's best-selling strategy board game. 3–4 players compete to build settlements, cities, and roads on the island of Catan by trading resources. Every game is different thanks to the modular board. Ages 10+. Avg play time: 75 min.",
    price: 2999, discountPrice: 2199, brand: 'Catan Studio', category: 'toys',
    stockQty: 45, avgRating: 4.8, reviewCount: 471, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Kids Art & Craft Supply Set — 143 Pieces',
    description: 'All-in-one art set with watercolours, coloured pencils, oil pastels, acrylic paints, brushes, canvas boards, stencils, glitter glue, and foam stickers in a portable organiser case. Non-toxic. Suitable for ages 5–14.',
    price: 1499, discountPrice: 999, brand: 'ArtSpark', category: 'toys',
    stockQty: 100, avgRating: 4.6, reviewCount: 318,
    images: [{ url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },

  // ─────────────────────────────────────────
  // GROCERY (8 products)
  // ─────────────────────────────────────────
  {
    name: 'Cold-Pressed Extra Virgin Olive Oil 1L',
    description: 'Single-origin Spanish extra virgin olive oil, cold-pressed within 24 hours of harvest for maximum polyphenol content. Acidity <0.3%. Rich, fruity flavour with a peppery finish. Ideal for dressings, dipping, and low-heat cooking.',
    price: 999, discountPrice: 749, brand: 'TerraOliva', category: 'grocery',
    stockQty: 120, avgRating: 4.7, reviewCount: 289,
    images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Organic Raw Honey 500g',
    description: 'Unfiltered, unpasteurised wildflower honey harvested from free-range beehives in the Nilgiri hills. Rich in natural enzymes, antioxidants, and pollen. No added sugar, preservatives, or heating. Glass jar with wooden dipper.',
    price: 799, discountPrice: 599, brand: 'HiveGold', category: 'grocery',
    stockQty: 150, avgRating: 4.8, reviewCount: 412,
    images: [{ url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Premium Darjeeling First Flush Tea 100g',
    description: 'Award-winning first flush Darjeeling loose-leaf tea from the Makaibari estate. Light, floral, and muscatel in character — the "Champagne of teas." Handpicked in March at 2,000m elevation. 100g resealable kraft pouch. ~50 cups.',
    price: 899, discountPrice: 649, brand: 'LeafLore', category: 'grocery',
    stockQty: 90, avgRating: 4.8, reviewCount: 203, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Mixed Nuts & Dry Fruits Box 500g',
    description: 'Premium mixed box of California almonds, cashews, walnuts, pistachios, dried cranberries, and golden raisins. No added salt, oil, or preservatives. Roasted in small batches. High in protein, fibre, and healthy fats. Resealable zip pouch.',
    price: 1299, discountPrice: 949, brand: 'NutHaven', category: 'grocery',
    stockQty: 110, avgRating: 4.6, reviewCount: 378,
    images: [{ url: 'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Organic Rolled Oats 1kg',
    description: 'Certified organic whole grain rolled oats — stone-milled and slow-rolled for a creamy texture. No gluten cross-contamination (tested <5ppm). Perfect for porridge, overnight oats, granola, and baking. 1kg resealable bag.',
    price: 499, discountPrice: 349, brand: 'GrainField', category: 'grocery',
    stockQty: 200, avgRating: 4.5, reviewCount: 267,
    images: [{ url: 'https://images.unsplash.com/photo-1517673132405-a56a933b2f5c?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Artisan Spice Collection — 6 Jars',
    description: 'Curated set of 6 hand-blended spice mixes: Biryani Masala, Chaat Masala, Garam Masala, Tandoori Rub, Chole Masala, and Pav Bhaji Masala. Small-batch ground and blended. No artificial colour, flavour, or fillers. 50g per jar.',
    price: 899, discountPrice: 649, brand: 'SpiceCraft', category: 'grocery',
    stockQty: 85, avgRating: 4.7, reviewCount: 334,
    images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a537d8a1aafd?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Himalayan Pink Salt Grinder 200g',
    description: 'Coarse Himalayan pink salt with a refillable adjustable ceramic grinder. Rich in 84+ trace minerals. Harvested from ancient Khewra salt mines in Pakistan. No anti-caking agents. Also available in refill packs.',
    price: 349, discountPrice: 249, brand: 'MountainMine', category: 'grocery',
    stockQty: 250, avgRating: 4.4, reviewCount: 198,
    images: [{ url: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Cold-Pressed Coconut Oil 500ml',
    description: 'Virgin cold-pressed coconut oil extracted from fresh coconuts within 2 hours of opening. Unrefined, unbleached, and undeodorised — retains natural coconut flavour and aroma. Multi-use: cooking, hair care, and skincare. Glass jar.',
    price: 599, discountPrice: 429, brand: 'CocoNative', category: 'grocery',
    stockQty: 140, avgRating: 4.6, reviewCount: 312,
    images: [{ url: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },

  // ─────────────────────────────────────────
  // BEAUTY (8 products)
  // ─────────────────────────────────────────
  {
    name: 'Vitamin C Brightening Serum 30ml',
    description: '20% stabilised L-ascorbic acid with hyaluronic acid and ferulic acid. Visibly brightens skin tone, fades dark spots, and stimulates collagen in 4 weeks. Fragrance-free, non-comedogenic, and dermatologist tested. Suitable for all skin types.',
    price: 1499, discountPrice: 999, brand: 'GlowLab', category: 'beauty',
    stockQty: 95, avgRating: 4.7, reviewCount: 512, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Eau de Parfum — Oud & Sandalwood 50ml',
    description: 'Long-lasting luxury fragrance with top notes of bergamot and cardamom, heart notes of oud and rose, and a base of sandalwood, amber, and musk. 12+ hour projection. Hand-filled in a faceted glass bottle with magnetic cap. 50ml.',
    price: 3999, discountPrice: 2999, brand: 'AromaHouse', category: 'beauty',
    stockQty: 50, avgRating: 4.8, reviewCount: 234, isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Matte Liquid Lipstick — 12 Shade Set',
    description: "Transfer-proof, long-wear liquid lipstick with a velvety matte finish. Micro-pigment formula delivers intense, buildable colour in one swipe. Infused with vitamin E and castor oil to prevent drying. 12 curated shades from nudes to bolds. Cruelty-free.",
    price: 1999, discountPrice: 1399, brand: 'ColorBold', category: 'beauty',
    stockQty: 70, avgRating: 4.6, reviewCount: 387,
    images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2b7b?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Niacinamide 10% + Zinc 1% Serum 30ml',
    description: 'Clinically proven formula to visibly reduce pore size, control sebum, and improve skin texture in 4 weeks. Suitable for oily and combination skin. Fragrance-free, alcohol-free, and non-comedogenic. Safe to use AM and PM.',
    price: 999, discountPrice: 699, brand: 'SkinScience', category: 'beauty',
    stockQty: 130, avgRating: 4.7, reviewCount: 623,
    images: [{ url: 'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Professional Makeup Brush Set — 15 Piece',
    description: '15-piece synthetic vegan brush set including foundation, powder, contour, blush, highlight, eyeshadow, blending, liner, and brow brushes. Dense, cruelty-free bristles that are ultra-soft and shed-resistant. Comes in a rose gold zip roll case.',
    price: 1799, discountPrice: 1199, brand: 'BrushPro', category: 'beauty',
    stockQty: 80, avgRating: 4.6, reviewCount: 291,
    images: [{ url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Keratin Repair Shampoo & Conditioner Set',
    description: 'Sulphate-free, paraben-free duo formulated with hydrolysed keratin, argan oil, and biotin. Repairs heat and chemical damage, reduces frizz, and boosts shine from the first wash. Suitable for colour-treated, curly, and dry hair. 400ml each.',
    price: 1299, discountPrice: 899, brand: 'TressiLux', category: 'beauty',
    stockQty: 110, avgRating: 4.5, reviewCount: 347,
    images: [{ url: 'https://images.unsplash.com/photo-1585232351009-aa87416fca2b?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'Korean Clay Face Mask — Purifying 100ml',
    description: 'Kaolin and bentonite clay mask with tea tree oil, centella asiatica, and salicylic acid. Deep-cleanses pores, absorbs excess sebum, and calms redness in a 10-minute treatment. Suitable for oily, acne-prone, and sensitive skin. Vegan & cruelty-free.',
    price: 799, discountPrice: 549, brand: 'GlowLab', category: 'beauty',
    stockQty: 140, avgRating: 4.5, reviewCount: 418,
    images: [{ url: 'https://images.unsplash.com/photo-1614249034881-3470ab8d3c78?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
  {
    name: 'SPF 50 Mineral Sunscreen — Tinted 50ml',
    description: 'Broad-spectrum SPF 50 PA++++ mineral sunscreen with zinc oxide and titanium dioxide. Lightweight tinted formula blends invisibly on all skin tones. Non-greasy, non-whitening, reef-safe, and suitable for sensitive skin. Doubles as a makeup primer.',
    price: 1099, discountPrice: 799, brand: 'SunGuard', category: 'beauty',
    stockQty: 100, avgRating: 4.7, reviewCount: 289,
    images: [{ url: 'https://images.unsplash.com/photo-1590439471355-bbbf39e69e25?w=600&h=400&fit=crop&q=80', isPrimary: true }],
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    await User.deleteMany({})
    await Product.deleteMany({})
    console.log('Cleared existing data')

    for (const u of users) {
      await User.create(u)
    }
    console.log(`Seeded ${users.length} users`)

    await Product.insertMany(products)
    console.log(`Seeded ${products.length} products`)

    console.log('\n✅ Seed complete!')
    console.log('  Electronics : 14 products')
    console.log('  Clothing    : 14 products')
    console.log('  Home&Kitchen: 14 products')
    console.log('  Sports      :  8 products')
    console.log('  Books       :  8 products')
    console.log('  Toys        :  8 products')
    console.log('  Grocery     :  8 products')
    console.log('  Beauty      :  8 products')
    console.log(`  ─────────────────────────`)
    console.log(`  Total       : ${products.length} products`)
    console.log('\nAdmin login: admin@shopease.com / admin123')
    console.log('User  login: jane@example.com  / user1234')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
