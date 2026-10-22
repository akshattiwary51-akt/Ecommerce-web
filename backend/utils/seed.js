require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Product = require('../models/Product')

// ─── Image helpers ───────────────────────────────────────────────────────────
// Pexels CDN: direct public URLs, no API key needed, never 404
// Pattern: https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg
//          ?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop
const PX = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`

// Open Library: real book cover by ISBN
const OL = (isbn) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

const p3 = (a, b, c) => [
  { url: PX(a), isPrimary: true  },
  { url: PX(b), isPrimary: false },
  { url: PX(c), isPrimary: false },
]

const users = [
  { name: 'Admin User', email: 'admin@shopease.com', password: 'admin123', role: 'admin' },
  { name: 'Jane Doe',   email: 'jane@example.com',   password: 'user1234', role: 'user'  },
]

const products = [

  // ═══════════════════════════════════════════════════════
  // ELECTRONICS  (14)   — Pexels tech/gadget photo IDs
  // ═══════════════════════════════════════════════════════
  {
    name: 'Wireless Noise-Cancelling Headphones Pro',
    description: 'Premium over-ear headphones with 40 dB ANC, 30-hour battery, multipoint Bluetooth 5.3. Hi-Res Audio certified with 40 mm drivers. Includes hard-shell travel case.',
    price: 12999, discountPrice: 8999, brand: 'SoundCore', category: 'electronics',
    stockQty: 45, avgRating: 4.7, reviewCount: 312, isFeatured: true,
    images: p3(3394650, 1649771, 577769),   // headphones, headphones, headphones
  },
  {
    name: 'Mechanical Gaming Keyboard TKL RGB',
    description: 'Tenkeyless board with Cherry MX Red switches, per-key RGB, aluminium top plate, N-key rollover, detachable USB-C cable.',
    price: 6999, discountPrice: 4999, brand: 'TechForce', category: 'electronics',
    stockQty: 38, avgRating: 4.6, reviewCount: 178, isFeatured: true,
    images: p3(1933570, 2115257, 3937276),  // keyboard, keyboard, keyboard RGB
  },
  {
    name: '27" 4K IPS Monitor 144 Hz',
    description: '4K UHD IPS panel, 144 Hz, 1 ms MPRT, HDR 400, 99% sRGB, height-adjustable stand. DisplayPort 1.4 + 2 × HDMI 2.1.',
    price: 34999, discountPrice: 27999, brand: 'ViewMax', category: 'electronics',
    stockQty: 20, avgRating: 4.8, reviewCount: 95, isFeatured: true,
    images: p3(1714208, 777001, 4974038),   // monitor desk, monitor, monitor setup
  },
  {
    name: 'True Wireless Earbuds ANC',
    description: 'TWS earbuds with ANC, 8 hr playback (32 hr with case), IPX5, touch controls, transparency mode. aptX & AAC supported.',
    price: 4999, discountPrice: 3499, brand: 'SoundCore', category: 'electronics',
    stockQty: 90, avgRating: 4.4, reviewCount: 441,
    images: p3(3780681, 4112842, 8534452),  // earbuds, earbuds case, wireless earbuds
  },
  {
    name: 'Portable Bluetooth Speaker 30 W',
    description: '30 W 360° stereo, dual passive radiators, IPX7, 18 hr playtime, built-in 10 000 mAh powerbank.',
    price: 5499, discountPrice: 3999, brand: 'BoomBox', category: 'electronics',
    stockQty: 55, avgRating: 4.5, reviewCount: 267,
    images: p3(1706694, 4065890, 7256859),  // bluetooth speaker, speaker outdoor, speaker
  },
  {
    name: 'Precision Gaming Mouse 26 000 DPI',
    description: '26 000 DPI optical sensor, 8 programmable buttons, 16.8 M RGB, 1000 Hz polling, braided cable, PTFE feet.',
    price: 2999, discountPrice: 1999, brand: 'TechForce', category: 'electronics',
    stockQty: 70, avgRating: 4.5, reviewCount: 213,
    images: p3(5082581, 2582928, 3937276),  // gaming mouse, mouse, gaming peripherals
  },
  {
    name: 'Smart LED Desk Lamp with Wireless Charging',
    description: '5 colour temps 2700–6500 K, 10 brightness levels, 15 W Qi wireless charging base, memory function. Flicker-free, anti-glare.',
    price: 2499, discountPrice: 1799, brand: 'LumiDesk', category: 'electronics',
    stockQty: 80, avgRating: 4.3, reviewCount: 134,
    images: p3(1112598, 3757738, 4050315),  // desk lamp, table lamp, study lamp
  },
  {
    name: '65 W GaN USB-C Charger (4-Port)',
    description: '2 × USB-C (65 W + 30 W PD) + 2 × USB-A (22.5 W QC 4.0). Charges laptop, phone, tablet, earbuds simultaneously. 100–240 V.',
    price: 2999, discountPrice: 1999, brand: 'PowerPulse', category: 'electronics',
    stockQty: 110, avgRating: 4.7, reviewCount: 389,
    images: p3(4526422, 4219654, 3657051),  // USB charger, power adapter, charging
  },
  {
    name: 'Smart WiFi Security Camera 4 MP',
    description: '4 MP indoor/outdoor, colour night vision, AI human detection, two-way audio, IP66. Works with Alexa & Google Home.',
    price: 3499, discountPrice: 2499, brand: 'SafeView', category: 'electronics',
    stockQty: 40, avgRating: 4.2, reviewCount: 156,
    images: p3(430544, 1557658, 3783696),   // security camera, cctv, surveillance
  },
  {
    name: 'Graphic Tablet A5 — 8192 Pressure Levels',
    description: '8 × 5 in active area, 8192 pressure levels, ±60° tilt, battery-free stylus, 8 express keys. Photoshop, Illustrator, Clip Studio compatible.',
    price: 5999, discountPrice: 4499, brand: 'DrawPad', category: 'electronics',
    stockQty: 28, avgRating: 4.6, reviewCount: 88,
    images: p3(1092644, 6039063, 4050315),  // drawing tablet, digital pen, stylus
  },
  {
    name: 'Smart Plug with Energy Monitoring',
    description: 'Wi-Fi smart plug with real-time energy monitoring, scheduling, voice control. Max 16 A / 3680 W. Alexa, Google Home, SmartThings.',
    price: 999, discountPrice: 699, brand: 'HomeIQ', category: 'electronics',
    stockQty: 200, avgRating: 4.4, reviewCount: 502,
    images: p3(4219654, 3657051, 4526422),  // smart plug, power socket, charger
  },
  {
    name: '1 TB NVMe SSD M.2 Gen 4',
    description: 'PCIe Gen 4 NVMe — reads 7 400 MB/s, writes 6 800 MB/s. DRAM cache, 1.5 M hr MTBF, 5-year warranty.',
    price: 7999, discountPrice: 5999, brand: 'DataSpeed', category: 'electronics',
    stockQty: 55, avgRating: 4.8, reviewCount: 221,
    images: p3(2582928, 1779487, 4050315),  // storage hardware, SSD, computer parts
  },
  {
    name: '4K Webcam with Ring Light',
    description: '4K 30 fps / 1080p 60 fps, built-in ring light (3 temperatures), dual stereo mics with ANC, autofocus, 90° FOV. Plug-and-play USB-C.',
    price: 4499, discountPrice: 3299, brand: 'StreamCam', category: 'electronics',
    stockQty: 35, avgRating: 4.3, reviewCount: 167,
    images: p3(4050315, 3937276, 1714208),  // webcam setup, streaming, camera desk
  },
  {
    name: 'Digital Kitchen Scale 5 kg Precision',
    description: '1 g accuracy up to 5 kg, large LCD backlit display, tare, 4 unit modes, auto-off. Batteries included.',
    price: 799, discountPrice: 549, brand: 'PreciseWeigh', category: 'electronics',
    stockQty: 130, avgRating: 4.5, reviewCount: 318,
    images: p3(3483908, 3857740, 4397286),  // kitchen scale, scale weighing, food scale
  },

  // ═══════════════════════════════════════════════════════
  // CLOTHING  (14)   — Pexels fashion photo IDs
  // ═══════════════════════════════════════════════════════
  {
    name: "Men's Slim-Fit Oxford Shirt",
    description: 'Slim-fit 100% combed cotton Oxford shirt. Spread collar, button-down placket, single chest pocket. Machine washable.',
    price: 1499, discountPrice: 999, brand: 'StyleHub', category: 'clothing',
    stockQty: 120, avgRating: 4.3, reviewCount: 89,
    images: p3(3860640, 1598507, 2897531),  // man in dress shirt, oxford shirt, men shirt
  },
  {
    name: "Women's High-Waist Straight Jeans",
    description: 'High-rise straight-leg jeans, 5-pocket styling, stretch denim (98% cotton 2% elastane). Indigo and black.',
    price: 2499, discountPrice: 1799, brand: 'DenimCo', category: 'clothing',
    stockQty: 95, avgRating: 4.4, reviewCount: 143, isFeatured: true,
    images: p3(1542085, 1346187, 3622596),  // high waist jeans, straight jeans, denim
  },
  {
    name: 'Unisex Oversized Graphic Tee',
    description: '100% ring-spun cotton boxy tee, dropped shoulder, crew neck, original screen-print graphic. Pre-washed. Sizes XS–3XL.',
    price: 799, discountPrice: 599, brand: 'UrbanThreads', category: 'clothing',
    stockQty: 200, avgRating: 4.2, reviewCount: 256,
    images: p3(5384423, 1192671, 996329),   // oversized tshirt, graphic tee, streetwear tee
  },
  {
    name: "Women's Floral Wrap Midi Dress",
    description: 'Wrap-style midi in lightweight chiffon, floral print, adjustable tie waist, V-neckline, flutter sleeves. Fully lined.',
    price: 2999, discountPrice: 1999, brand: 'BloomWear', category: 'clothing',
    stockQty: 75, avgRating: 4.6, reviewCount: 118, isFeatured: true,
    images: p3(1536619, 4100130, 2983464),  // floral dress, midi dress, wrap dress
  },
  {
    name: "Men's Slim Chino Trousers",
    description: 'Slim-fit chinos, cotton-twill blend, mid-rise, zip fly. Wrinkle-resistant. Smart-casual from desk to dinner. 6 colours.',
    price: 1999, discountPrice: 1399, brand: 'StyleHub', category: 'clothing',
    stockQty: 85, avgRating: 4.3, reviewCount: 72,
    images: p3(1300550, 1598507, 2220316),  // chino trousers, men casual pants, smart trousers
  },
  {
    name: "Women's Ribbed Turtleneck Sweater",
    description: 'Slim-fit turtleneck in wool-acrylic blend, fine ribbing, drop-shoulder fit. Hand wash cold. Cream, charcoal, and camel.',
    price: 2299, discountPrice: 1599, brand: 'KnitCo', category: 'clothing',
    stockQty: 60, avgRating: 4.5, reviewCount: 97,
    images: p3(3622606, 3785132, 4100130),  // turtleneck sweater, ribbed knit, knitwear
  },
  {
    name: 'Unisex Zip-Up Hoodie Fleece',
    description: 'Mid-weight French terry hoodie, full-zip, kangaroo pocket, adjustable drawstring hood. 80% cotton / 20% polyester.',
    price: 1899, discountPrice: 1299, brand: 'UrbanThreads', category: 'clothing',
    stockQty: 140, avgRating: 4.4, reviewCount: 204,
    images: p3(2897531, 5384423, 3622596),  // zip hoodie, hoodie worn, hoodie flatlay
  },
  {
    name: "Women's Pleated Palazzo Pants",
    description: 'Wide-leg palazzo in flowy viscose crepe, front pleats, elasticated waist, side pockets. Black, ivory, and sage green.',
    price: 1699, discountPrice: 1099, brand: 'BloomWear', category: 'clothing',
    stockQty: 88, avgRating: 4.3, reviewCount: 61,
    images: p3(3622608, 4100130, 2983464),  // palazzo pants, wide leg pants, women trousers
  },
  {
    name: "Men's Quilted Puffer Jacket",
    description: 'Lightweight channel-stitch puffer, water-repellent shell, stand-up collar, two zip pockets. Packs into own pocket.',
    price: 3999, discountPrice: 2799, brand: 'NorthLayer', category: 'clothing',
    stockQty: 50, avgRating: 4.6, reviewCount: 132, isFeatured: true,
    images: p3(6311392, 5384423, 3622613),  // puffer jacket, men winter jacket, quilted coat
  },
  {
    name: "Women's High-Impact Sports Bra",
    description: 'Wide padded racerback sports bra, moisture-wicking fabric, removable padding, hook-and-eye back. Rated for running and HIIT.',
    price: 1299, discountPrice: 899, brand: 'ActiveFit', category: 'clothing',
    stockQty: 110, avgRating: 4.5, reviewCount: 188,
    images: p3(3775566, 1552242, 4162438),  // sports bra, activewear, workout bra
  },
  {
    name: "Men's Cotton Jogger Pants",
    description: 'Relaxed-fit French terry joggers, elastic waistband, drawstring, tapered leg, ribbed ankle cuffs, two deep pockets.',
    price: 1399, discountPrice: 999, brand: 'ActiveFit', category: 'clothing',
    stockQty: 150, avgRating: 4.2, reviewCount: 177,
    images: p3(3622603, 3775566, 1552242),  // jogger pants, athletic trousers, casual joggers
  },
  {
    name: "Women's Linen Blazer",
    description: 'Single-button linen-blend blazer, notched lapels, flap pockets, half-lined interior. 60% linen, 40% viscose.',
    price: 3499, discountPrice: 2499, brand: 'StyleHub', category: 'clothing',
    stockQty: 42, avgRating: 4.7, reviewCount: 54,
    images: p3(2220316, 3860640, 1598507),  // women blazer, linen jacket, smart blazer
  },
  {
    name: 'Unisex Classic Canvas Sneakers',
    description: 'Low-top canvas sneakers, vulcanised rubber outsole, OrthoLite insole, padded collar. 8 colours, UK 4–12. Vegan-friendly.',
    price: 1999, discountPrice: 1499, brand: 'StreetStep', category: 'clothing',
    stockQty: 180, avgRating: 4.4, reviewCount: 319,
    images: p3(19090, 2529148, 1464613),    // white canvas sneakers, classic trainers, low-top shoes
  },
  {
    name: "Women's Chunky Knit Beanie",
    description: 'Ribbed acrylic-wool blend beanie, double-layered brim. One size fits most. 10 colours.',
    price: 599, discountPrice: 399, brand: 'KnitCo', category: 'clothing',
    stockQty: 220, avgRating: 4.3, reviewCount: 143,
    images: p3(3622611, 3785132, 3622606),  // knit beanie hat, winter beanie, wool hat
  },

  // ═══════════════════════════════════════════════════════
  // HOME & KITCHEN  (14)   — Pexels kitchen/home photo IDs
  // ═══════════════════════════════════════════════════════
  {
    name: 'Non-Stick Cookware Set (7 Piece)',
    description: 'Hard-anodised aluminium: 20 & 24 cm pans, 18 & 22 cm saucepans, 26 cm casserole + lid. PFOA-free granite coating, induction-safe, oven-safe 200 °C.',
    price: 5999, discountPrice: 3999, brand: 'KitchenPro', category: 'home-kitchen',
    stockQty: 45, avgRating: 4.5, reviewCount: 187, isFeatured: true,
    images: p3(2988606, 1279330, 4397286),  // cookware pots pans, non-stick pan, kitchen set
  },
  {
    name: '5.5 L Digital Air Fryer',
    description: 'Family-sized, digital touchscreen, 8 presets, 360° rapid air circulation, dishwasher-safe basket. Up to 85% less oil.',
    price: 6999, discountPrice: 4999, brand: 'CrispMaster', category: 'home-kitchen',
    stockQty: 60, avgRating: 4.7, reviewCount: 534, isFeatured: true,
    images: p3(5865552, 4397286, 3857740),  // air fryer appliance, kitchen air fryer, countertop fryer
  },
  {
    name: 'Cold Press Slow Juicer',
    description: 'Masticating cold-press at 80 RPM. Preserves enzymes and vitamins. Juices leafy greens, fruits, wheatgrass. BPA-free.',
    price: 8999, discountPrice: 6499, brand: 'NutriPress', category: 'home-kitchen',
    stockQty: 30, avgRating: 4.6, reviewCount: 112,
    images: p3(3026803, 2988606, 1028714),  // juicer machine, cold press juicer, fresh juice
  },
  {
    name: 'Stand Mixer 1000 W — 5 L Bowl',
    description: '1000 W, 5 L stainless steel bowl, 6-speed + pulse, planetary mixing, tilt-head. Includes dough hook, flat beater, balloon whisk.',
    price: 12999, discountPrice: 9499, brand: 'BakePro', category: 'home-kitchen',
    stockQty: 22, avgRating: 4.8, reviewCount: 93, isFeatured: true,
    images: p3(3743962, 2988606, 4397286),  // kitchen stand mixer, baking mixer, countertop mixer
  },
  {
    name: 'Bamboo Cutting Board Set (3 Piece)',
    description: '3 sustainably sourced bamboo boards (S/M/L). Juice grooves one side, smooth the other. Naturally antibacterial. Wall-mount rack included.',
    price: 1299, discountPrice: 899, brand: 'EcoChop', category: 'home-kitchen',
    stockQty: 140, avgRating: 4.4, reviewCount: 278,
    images: p3(3769146, 1279330, 4397286),  // bamboo cutting board, wooden chopping board, kitchen board
  },
  {
    name: 'Forged Steel Knife Set (6 Piece)',
    description: 'High-carbon stainless: chef, bread, santoku, utility, paring + honing steel. Full-tang, pakkawood handles, acacia block.',
    price: 4999, discountPrice: 3299, brand: 'SharpEdge', category: 'home-kitchen',
    stockQty: 50, avgRating: 4.6, reviewCount: 215,
    images: p3(1024359, 3616956, 2988606),  // knife set, kitchen knives on block, chef knife
  },
  {
    name: 'French Press Coffee Maker 1 L',
    description: 'Double-wall insulated stainless French press, 4-stage plunger, borosilicate glass inner. Keeps coffee hot 1+ hr. 1 L (8 cups).',
    price: 1999, discountPrice: 1399, brand: 'BrewMaster', category: 'home-kitchen',
    stockQty: 75, avgRating: 4.5, reviewCount: 301,
    images: p3(312418, 4109743, 1544740),   // french press coffee, pour over coffee, coffee maker
  },
  {
    name: 'Ceramic Dinner Set (16 Piece)',
    description: '16-piece for 4: dinner plates 27 cm, salad plates 21 cm, soup bowls, mugs. Microwave & dishwasher safe, chip-resistant glaze.',
    price: 3999, discountPrice: 2799, brand: 'TableCraft', category: 'home-kitchen',
    stockQty: 38, avgRating: 4.4, reviewCount: 146,
    images: p3(1395967, 4397286, 3857740),  // ceramic dinner set, white plates, dinnerware
  },
  {
    name: 'Vacuum Food Sealer with Rolls',
    description: 'Auto vacuum sealer, moist & dry modes, pulse function, built-in cutter. Includes 2 × 3 m rolls. Extends freshness 5×.',
    price: 2999, discountPrice: 1999, brand: 'FreshLock', category: 'home-kitchen',
    stockQty: 55, avgRating: 4.3, reviewCount: 189,
    images: p3(3857740, 2988606, 4397286),  // vacuum sealer, food storage, kitchen appliance
  },
  {
    name: 'Pre-Seasoned Cast Iron Skillet 26 cm',
    description: 'Pre-seasoned 26 cm cast iron skillet, superior heat retention, all hob types including induction. Oven & campfire safe.',
    price: 2499, discountPrice: 1799, brand: 'IronCook', category: 'home-kitchen',
    stockQty: 65, avgRating: 4.7, reviewCount: 393,
    images: p3(3984566, 2988606, 1279330),  // cast iron skillet, iron pan, skillet cooking
  },
  {
    name: 'Over-Door Pantry Organiser (5 Tier)',
    description: '5-tier powder-coated steel rack, adjustable baskets, non-slip hooks, 25 kg rated. Fits doors 2–4 cm thick.',
    price: 1899, discountPrice: 1299, brand: 'SpaceSmart', category: 'home-kitchen',
    stockQty: 80, avgRating: 4.2, reviewCount: 167,
    images: p3(4173890, 4397286, 3857740),  // kitchen organiser rack, pantry storage, door shelf
  },
  {
    name: 'Glass Meal Prep Containers (10 Set)',
    description: '10 borosilicate glass containers: 2 × 1100 ml, 4 × 700 ml, 4 × 450 ml. Airtight snap-lock lids. Microwave, oven (lid-off), freezer, dishwasher safe.',
    price: 2299, discountPrice: 1599, brand: 'FreshLock', category: 'home-kitchen',
    stockQty: 90, avgRating: 4.6, reviewCount: 422,
    images: p3(1640774, 4397286, 3857740),  // glass containers meal prep, food storage jars, prep bowls
  },
  {
    name: 'Temperature Control Electric Kettle 1.7 L',
    description: '5 presets (70/80/85/90/100 °C), 30-min keep-warm, 1500 W rapid boil, 360° cordless base, double-wall insulation. BPA-free.',
    price: 2799, discountPrice: 1999, brand: 'BrewMaster', category: 'home-kitchen',
    stockQty: 68, avgRating: 4.5, reviewCount: 258,
    images: p3(1544740, 312418, 4109743),   // electric kettle, kettle on counter, kitchen kettle
  },
  {
    name: 'LiDAR Robot Vacuum Cleaner 2700 Pa',
    description: '2700 Pa suction, LiDAR navigation, auto room mapping, selective cleaning, 180-min runtime, auto-return charging, HEPA filtration.',
    price: 19999, discountPrice: 14999, brand: 'CleanBot', category: 'home-kitchen',
    stockQty: 18, avgRating: 4.6, reviewCount: 204, isFeatured: true,
    images: p3(4108715, 4173890, 3857740),  // robot vacuum, robovac, smart home cleaner
  },

  // ═══════════════════════════════════════════════════════
  // SPORTS  (8)   — Pexels sports/fitness photo IDs
  // ═══════════════════════════════════════════════════════
  {
    name: 'Running Shoes — Lightweight Mesh',
    description: 'Engineered mesh upper, responsive foam midsole, multi-directional rubber grip. Drop: 8 mm. Road running, gym, daily wear. UK 6–12.',
    price: 4999, discountPrice: 3499, brand: 'SwiftStride', category: 'sports',
    stockQty: 80, avgRating: 4.6, reviewCount: 347, isFeatured: true,
    images: p3(2529148, 19090, 1464613),    // running shoes, athletic shoes, trainers road
  },
  {
    name: 'Adjustable Dumbbell Set 5–25 kg',
    description: 'Selectorized set replacing 9 pairs. Dial-adjust in 2.5 kg steps 5–25 kg. ABS casing, chrome handle. Storage tray included.',
    price: 12999, discountPrice: 9499, brand: 'IronFlex', category: 'sports',
    stockQty: 30, avgRating: 4.7, reviewCount: 189, isFeatured: true,
    images: p3(1334196, 1552242, 4162438),  // dumbbells, adjustable weights, gym dumbbell
  },
  {
    name: 'Grade 1 English Willow Cricket Bat',
    description: 'Grade 1 English willow, short handle, 38 mm edges, pronounced spine, pre-knocked face. Leather grip + anti-scuff sheet. 1.19–1.22 kg.',
    price: 5499, discountPrice: 3999, brand: 'CricketPro', category: 'sports',
    stockQty: 40, avgRating: 4.5, reviewCount: 112,
    images: p3(3628912, 2906408, 1552242),  // cricket bat, cricket equipment, bat and ball
  },
  {
    name: 'Official Size 5 Match Football',
    description: 'FIFA Inspected, thermally bonded 32-panel construction, butyl bladder. Grass, turf, and futsal ready.',
    price: 1999, discountPrice: 1399, brand: 'GoalKing', category: 'sports',
    stockQty: 95, avgRating: 4.4, reviewCount: 231,
    images: p3(47730, 3621603, 1552242),    // football soccer ball, match ball, soccer
  },
  {
    name: 'Yoga Block & Strap Set',
    description: 'High-density EVA foam block (23 × 15 × 10 cm) + 2.5 m adjustable cotton strap. Beginner to advanced.',
    price: 699, discountPrice: 499, brand: 'ZenFit', category: 'sports',
    stockQty: 150, avgRating: 4.3, reviewCount: 278,
    images: p3(3822356, 4162438, 1552242),  // yoga block, yoga strap set, yoga props
  },
  {
    name: 'Resistance Band Set (5 Levels)',
    description: '5 latex bands, progressive resistance 5–45 kg: yellow, red, green, blue, black. Physiotherapy, strength, pull-up assist.',
    price: 999, discountPrice: 699, brand: 'ElastiForce', category: 'sports',
    stockQty: 200, avgRating: 4.5, reviewCount: 412,
    images: p3(4162438, 1552242, 3822356),  // resistance bands, exercise bands, workout bands
  },
  {
    name: 'Speed Jump Rope — Ball-Bearing Handles',
    description: 'Pro speed rope: 360° ball-bearing handles, 3 m adjustable PVC cable, foam grips. 200 skips/min. HIIT, boxing, CrossFit.',
    price: 599, discountPrice: 399, brand: 'SpeedSkip', category: 'sports',
    stockQty: 170, avgRating: 4.4, reviewCount: 334,
    images: p3(3775164, 1552242, 4162438),  // jump rope skipping, speed rope, cardio rope
  },
  {
    name: 'Anti-Fog UV Swimming Goggles',
    description: 'Wide-angle silicone goggles, UV400 lenses, dual-seal gaskets, split strap, 3 nose bridge sizes. Pool and open water.',
    price: 799, discountPrice: 549, brand: 'AquaVision', category: 'sports',
    stockQty: 120, avgRating: 4.5, reviewCount: 197,
    images: p3(863988, 3822356, 1552242),   // swimming goggles, pool goggles, swim gear
  },

  // ═══════════════════════════════════════════════════════
  // BOOKS  (8)   — Open Library real covers + Pexels reading
  // ═══════════════════════════════════════════════════════
  {
    name: 'Atomic Habits — James Clear',
    description: "#1 NYT bestseller. Clear's Four Laws of Behaviour Change has helped millions rewire routines one tiny step at a time. Paperback, 320 pages.",
    price: 699, discountPrice: 499, brand: 'Penguin Random House', category: 'books',
    stockQty: 200, avgRating: 4.9, reviewCount: 1423, isFeatured: true,
    images: [
      { url: OL('0735211299'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },   // reading books
      { url: PX(4170387),      isPrimary: false },   // book lifestyle
    ],
  },
  {
    name: 'The Psychology of Money — Morgan Housel',
    description: '19 short stories on how behaviour determines financial success. Essential personal finance reading. Paperback, 256 pages.',
    price: 599, discountPrice: 429, brand: 'Harriman House', category: 'books',
    stockQty: 180, avgRating: 4.8, reviewCount: 987,
    images: [
      { url: OL('0857197681'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },
      { url: PX(4170387),      isPrimary: false },
    ],
  },
  {
    name: "Hitchhiker's Guide to the Galaxy — Douglas Adams",
    description: "The comedic sci-fi classic following Arthur Dent's intergalactic adventures. Witty, absurdist, endlessly quotable. Paperback, 193 pages.",
    price: 499, discountPrice: 349, brand: 'Pan Books', category: 'books',
    stockQty: 140, avgRating: 4.8, reviewCount: 762,
    images: [
      { url: OL('0330258648'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },
      { url: PX(4170387),      isPrimary: false },
    ],
  },
  {
    name: 'Sapiens — Yuval Noah Harari',
    description: 'A sweeping narrative of human history from the Stone Age to the 21st century. Paperback, 443 pages.',
    price: 799, discountPrice: 549, brand: 'Vintage Books', category: 'books',
    stockQty: 160, avgRating: 4.7, reviewCount: 1102,
    images: [
      { url: OL('0062316095'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },
      { url: PX(4170387),      isPrimary: false },
    ],
  },
  {
    name: 'Think and Grow Rich — Napoleon Hill',
    description: '13 principles of success from 500 legendary achievers. Remains as relevant now as ever. Paperback, 238 pages.',
    price: 399, discountPrice: 279, brand: 'Fingerprint Publishing', category: 'books',
    stockQty: 220, avgRating: 4.6, reviewCount: 834,
    images: [
      { url: OL('1585424331'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },
      { url: PX(4170387),      isPrimary: false },
    ],
  },
  {
    name: 'Rich Dad Poor Dad — Robert T. Kiyosaki',
    description: 'The personal finance classic revealing mindset shifts separating the wealthy from everyone else. Paperback, 336 pages.',
    price: 499, discountPrice: 349, brand: 'Plata Publishing', category: 'books',
    stockQty: 190, avgRating: 4.6, reviewCount: 1045,
    images: [
      { url: OL('1612680194'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },
      { url: PX(4170387),      isPrimary: false },
    ],
  },
  {
    name: 'The Alchemist — Paulo Coelho',
    description: "A magical fable about following your dreams. Santiago's journey has moved millions worldwide. Paperback, 208 pages.",
    price: 399, discountPrice: 299, brand: 'HarperOne', category: 'books',
    stockQty: 250, avgRating: 4.7, reviewCount: 1287,
    images: [
      { url: OL('0062315007'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },
      { url: PX(4170387),      isPrimary: false },
    ],
  },
  {
    name: 'Deep Work — Cal Newport',
    description: 'Rules for focused success in a distracted world. Deep focus is the most valuable skill in our economy. Paperback, 304 pages.',
    price: 649, discountPrice: 449, brand: 'Grand Central Publishing', category: 'books',
    stockQty: 130, avgRating: 4.7, reviewCount: 678,
    images: [
      { url: OL('1455586692'), isPrimary: true  },
      { url: PX(1148998),      isPrimary: false },
      { url: PX(4170387),      isPrimary: false },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // TOYS  (8)   — Pexels kids/toys photo IDs
  // ═══════════════════════════════════════════════════════
  {
    name: 'LEGO Classic Creative Brick Box 1500 pcs',
    description: '1500-piece classic set in 33 colours with windows, doors, and wheels. 11 starter building ideas. Ages 4+.',
    price: 4999, discountPrice: 3799, brand: 'LEGO', category: 'toys',
    stockQty: 55, avgRating: 4.9, reviewCount: 543, isFeatured: true,
    images: p3(298825, 1148998, 3661948),   // lego bricks, coloured building blocks, toy play
  },
  {
    name: 'Premium Plush Teddy Bear 45 cm',
    description: 'Hypoallergenic plush bear with poly-pellet weighted fill. Embroidered eyes for safety. Machine washable. Suitable from birth.',
    price: 999, discountPrice: 699, brand: 'CuddleCo', category: 'toys',
    stockQty: 120, avgRating: 4.8, reviewCount: 389,
    images: p3(3662667, 1148998, 298825),   // teddy bear plush, stuffed toy, soft bear
  },
  {
    name: 'Natural Hardwood Building Blocks 100 pcs',
    description: '100 hardwood geometric blocks (cubes, cylinders, arches, triangles), smooth edges, non-toxic finish. Ages 1–8.',
    price: 1299, discountPrice: 899, brand: 'WoodPlay', category: 'toys',
    stockQty: 85, avgRating: 4.7, reviewCount: 224,
    images: p3(1148998, 298825, 3661948),   // wooden building blocks, stacking blocks, child play
  },
  {
    name: '4WD RC Monster Truck 1:12 Scale',
    description: '2.4 GHz remote, all-terrain rubber tyres, independent shock absorbers, 25 km/h. 40-min charge for 20-min runtime.',
    price: 2499, discountPrice: 1799, brand: 'TurboRace', category: 'toys',
    stockQty: 60, avgRating: 4.5, reviewCount: 312,
    images: p3(3714988, 1148998, 298825),   // RC monster truck, remote control car, toy truck
  },
  {
    name: '1000-Piece Jigsaw Puzzle — Vintage World Map',
    description: 'Precision-cut linen-finish puzzle. Assembled: 68 × 48 cm. Ages 12+. Poster guide included.',
    price: 799, discountPrice: 549, brand: 'PuzzleWorks', category: 'toys',
    stockQty: 95, avgRating: 4.6, reviewCount: 187,
    images: p3(3862132, 3661948, 1148998),  // jigsaw puzzle, puzzle pieces, puzzle activity
  },
  {
    name: 'STEM Science Experiment Kit — 50+ Experiments',
    description: 'Volcano eruptions, crystal growing, pH strips, polymer slime and more. Pre-measured child-safe chemicals. Ages 8–14.',
    price: 1999, discountPrice: 1399, brand: 'BrainSpark', category: 'toys',
    stockQty: 70, avgRating: 4.7, reviewCount: 256,
    images: p3(2280571, 1148998, 3661948),  // science experiment kit, chemistry set, STEM kit
  },
  {
    name: 'Catan Board Game — Standard Edition',
    description: "World's best-selling strategy game. 3–4 players, modular board, resource trading. Ages 10+. ~75 min play time.",
    price: 2999, discountPrice: 2199, brand: 'Catan Studio', category: 'toys',
    stockQty: 45, avgRating: 4.8, reviewCount: 471, isFeatured: true,
    images: p3(3661948, 3862132, 1148998),  // board game playing, catan game, table game
  },
  {
    name: 'Kids Art & Craft Supply Set — 143 Pieces',
    description: 'Watercolours, coloured pencils, oil pastels, acrylic paints, brushes, canvas boards, stencils in portable organiser. Non-toxic. Ages 5–14.',
    price: 1499, discountPrice: 999, brand: 'ArtSpark', category: 'toys',
    stockQty: 100, avgRating: 4.6, reviewCount: 318,
    images: p3(1148998, 2280571, 3661948),  // art craft supplies, kids painting, children art
  },

  // ═══════════════════════════════════════════════════════
  // GROCERY  (8)   — Pexels food photo IDs
  // ═══════════════════════════════════════════════════════
  {
    name: 'Cold-Pressed Extra Virgin Olive Oil 1 L',
    description: 'Single-origin Spanish EVOO, cold-pressed within 24 hr. Acidity <0.3%. Rich, fruity, peppery finish. Perfect for dressings and dipping.',
    price: 999, discountPrice: 749, brand: 'TerraOliva', category: 'grocery',
    stockQty: 120, avgRating: 4.7, reviewCount: 289,
    images: p3(33783, 1028714, 2733918),    // olive oil bottle, extra virgin olive, oil pour
  },
  {
    name: 'Organic Raw Wildflower Honey 500 g',
    description: 'Unfiltered, unpasteurised honey from Nilgiri hills. Rich in enzymes, antioxidants, and pollen. Glass jar with wooden dipper.',
    price: 799, discountPrice: 599, brand: 'HiveGold', category: 'grocery',
    stockQty: 150, avgRating: 4.8, reviewCount: 412,
    images: p3(1638660, 2733918, 1028714),  // honey jar, raw honey, golden honey
  },
  {
    name: 'Darjeeling First Flush Loose-Leaf Tea 100 g',
    description: 'Award-winning first flush from Makaibari estate. Light, floral, muscatel. Handpicked March at 2000 m. Resealable pouch. ~50 cups.',
    price: 899, discountPrice: 649, brand: 'LeafLore', category: 'grocery',
    stockQty: 90, avgRating: 4.8, reviewCount: 203, isFeatured: true,
    images: p3(230477, 1028714, 1638660),   // loose leaf tea, darjeeling tea, tea cup
  },
  {
    name: 'Premium Mixed Nuts & Dry Fruits 500 g',
    description: 'California almonds, cashews, walnuts, pistachios, dried cranberries, golden raisins. No salt, oil, or preservatives. Resealable zip pouch.',
    price: 1299, discountPrice: 949, brand: 'NutHaven', category: 'grocery',
    stockQty: 110, avgRating: 4.6, reviewCount: 378,
    images: p3(1295572, 2733918, 1028714),  // mixed nuts bowl, dry fruits, assorted nuts
  },
  {
    name: 'Organic Rolled Oats 1 kg',
    description: 'Certified organic whole grain oats, stone-milled. Gluten tested <5 ppm. Porridge, overnight oats, granola, and baking. Resealable bag.',
    price: 499, discountPrice: 349, brand: 'GrainField', category: 'grocery',
    stockQty: 200, avgRating: 4.5, reviewCount: 267,
    images: p3(3756345, 1028714, 2733918),  // rolled oats bowl, oatmeal, oats breakfast
  },
  {
    name: 'Artisan Spice Collection — 6 Jars',
    description: 'Hand-blended: Biryani Masala, Chaat Masala, Garam Masala, Tandoori Rub, Chole Masala, Pav Bhaji Masala. 50 g per jar.',
    price: 899, discountPrice: 649, brand: 'SpiceCraft', category: 'grocery',
    stockQty: 85, avgRating: 4.7, reviewCount: 334,
    images: p3(2802527, 1028714, 1638660),  // colourful spice jars, indian spices, spice collection
  },
  {
    name: 'Himalayan Pink Salt Grinder 200 g',
    description: 'Coarse Himalayan pink salt with refillable adjustable ceramic grinder. 84+ trace minerals. Khewra mine, Pakistan. No anti-caking agents.',
    price: 349, discountPrice: 249, brand: 'MountainMine', category: 'grocery',
    stockQty: 250, avgRating: 4.4, reviewCount: 198,
    images: p3(2877545, 2802527, 1028714),  // himalayan pink salt, salt grinder, pink salt
  },
  {
    name: 'Virgin Cold-Pressed Coconut Oil 500 ml',
    description: 'Extracted from fresh coconuts within 2 hr. Unrefined, unbleached, undeodorised. Cooking, hair care, and skincare. Glass jar.',
    price: 599, discountPrice: 429, brand: 'CocoNative', category: 'grocery',
    stockQty: 140, avgRating: 4.6, reviewCount: 312,
    images: p3(725991, 1028714, 2733918),   // coconut oil jar, organic oil, coconut product
  },

  // ═══════════════════════════════════════════════════════
  // BEAUTY  (8)   — Pexels beauty/skincare photo IDs
  // ═══════════════════════════════════════════════════════
  {
    name: 'Vitamin C Brightening Serum 30 ml',
    description: '20% stabilised L-ascorbic acid + hyaluronic acid + ferulic acid. Brightens skin, fades dark spots, stimulates collagen in 4 weeks. Fragrance-free.',
    price: 1499, discountPrice: 999, brand: 'GlowLab', category: 'beauty',
    stockQty: 95, avgRating: 4.7, reviewCount: 512, isFeatured: true,
    images: p3(3685523, 4041392, 4050315),  // serum skincare bottle, vitamin c serum, dropper
  },
  {
    name: 'Eau de Parfum — Oud & Sandalwood 50 ml',
    description: 'Top: bergamot & cardamom. Heart: oud & rose. Base: sandalwood, amber, musk. 12+ hr projection. Faceted glass bottle with magnetic cap.',
    price: 3999, discountPrice: 2999, brand: 'AromaHouse', category: 'beauty',
    stockQty: 50, avgRating: 4.8, reviewCount: 234, isFeatured: true,
    images: p3(965989, 3685523, 4041392),   // luxury perfume bottle, fragrance, oud perfume
  },
  {
    name: 'Matte Liquid Lipstick — 12 Shade Set',
    description: 'Transfer-proof, long-wear liquid lipstick. Micro-pigment formula, velvety matte finish. Vitamin E + castor oil. 12 shades. Cruelty-free.',
    price: 1999, discountPrice: 1399, brand: 'ColorBold', category: 'beauty',
    stockQty: 70, avgRating: 4.6, reviewCount: 387,
    images: p3(8145764, 3685523, 4041392),  // matte lipstick set, lip colour, cosmetics
  },
  {
    name: 'Niacinamide 10% + Zinc 1% Serum 30 ml',
    description: 'Reduces pore size, controls sebum, improves skin texture in 4 weeks. Fragrance-free, alcohol-free, non-comedogenic. AM & PM safe.',
    price: 999, discountPrice: 699, brand: 'SkinScience', category: 'beauty',
    stockQty: 130, avgRating: 4.7, reviewCount: 623,
    images: p3(4041392, 3685523, 4050315),  // niacinamide serum, pore serum, skincare
  },
  {
    name: 'Professional Makeup Brush Set — 15 Piece',
    description: '15 synthetic vegan brushes: foundation, powder, contour, blush, highlight, eyeshadow, liner, brow. Cruelty-free, shed-resistant. Rose gold zip roll case.',
    price: 1799, discountPrice: 1199, brand: 'BrushPro', category: 'beauty',
    stockQty: 80, avgRating: 4.6, reviewCount: 291,
    images: p3(4620873, 4502987, 7290669),  // makeup brush set, professional brushes, cosmetic tools
  },
  {
    name: 'Keratin Repair Shampoo & Conditioner Set',
    description: 'Sulphate-free, paraben-free with hydrolysed keratin, argan oil, biotin. Repairs damage, reduces frizz, boosts shine. Colour-safe. 400 ml each.',
    price: 1299, discountPrice: 899, brand: 'TressiLux', category: 'beauty',
    stockQty: 110, avgRating: 4.5, reviewCount: 347,
    images: p3(3621263, 4041392, 3685523),  // shampoo conditioner bottles, hair care set, salon products
  },
  {
    name: 'Korean Purifying Clay Face Mask 100 ml',
    description: 'Kaolin + bentonite clay with tea tree, centella asiatica, salicylic acid. Deep-cleanses pores, calms redness in 10 min. Vegan & cruelty-free.',
    price: 799, discountPrice: 549, brand: 'GlowLab', category: 'beauty',
    stockQty: 140, avgRating: 4.5, reviewCount: 418,
    images: p3(3762874, 3685523, 4041392),  // clay face mask, skin mask, korean skincare
  },
  {
    name: 'SPF 50 Tinted Mineral Sunscreen 50 ml',
    description: 'Broad-spectrum SPF 50 PA++++ with zinc oxide + titanium dioxide. Lightweight tinted formula, non-whitening, reef-safe. Doubles as makeup primer.',
    price: 1099, discountPrice: 799, brand: 'SunGuard', category: 'beauty',
    stockQty: 100, avgRating: 4.7, reviewCount: 289,
    images: p3(4050315, 3685523, 4041392),  // sunscreen spf, sun protection, mineral sunscreen
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅  MongoDB connected')

    await User.deleteMany({})
    await Product.deleteMany({})
    console.log('🗑   Cleared existing data')

    for (const u of users) await User.create(u)
    console.log(`👤  Seeded ${users.length} users`)

    await Product.insertMany(products)

    const byCategory = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})

    console.log(`\n📦  Seeded ${products.length} products  |  ${products.length * 3} Pexels/OpenLibrary images\n`)
    Object.entries(byCategory).forEach(([cat, n]) =>
      console.log(`    ${cat.padEnd(15)} ${n} products × 3 images`)
    )
    console.log('\n🔑  Admin : admin@shopease.com  /  admin123')
    console.log('🔑  User  : jane@example.com   /  user1234')
    process.exit(0)
  } catch (err) {
    console.error('❌  Seed failed:', err.message)
    process.exit(1)
  }
}

seed()