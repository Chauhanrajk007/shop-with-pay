import { getDB } from "./_db.js"

// 50 curated products — diverse categories, real Unsplash images
const products = [
  // ──── SMARTPHONES (10) ────
  { name: "Apple iPhone 15 Pro Max 256GB", description: "A17 Pro chip, titanium design, 48MP main camera, USB-C with USB 3 speeds, Action button", category: "smartphones", brand: "Apple", price: 159900, rating: 4.9, reviews: 48200, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop" },
  { name: "Samsung Galaxy S24 Ultra 5G", description: "Snapdragon 8 Gen 3, built-in S Pen, 200MP camera, 5000mAh battery, AI features", category: "smartphones", brand: "Samsung", price: 129999, rating: 4.8, reviews: 36100, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop" },
  { name: "OnePlus 12R 5G 128GB", description: "Snapdragon 8 Gen 2, 50MP triple camera, 100W SUPERVOOC charging, 120Hz AMOLED", category: "smartphones", brand: "OnePlus", price: 39999, rating: 4.6, reviews: 12200, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
  { name: "Google Pixel 8 Pro 256GB", description: "Tensor G3 chip, 50MP camera with Magic Eraser, 7 years of updates, AI powered features", category: "smartphones", brand: "Google", price: 99999, rating: 4.7, reviews: 18500, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop" },
  { name: "Xiaomi 14 Ultra 5G", description: "Leica optics, Snapdragon 8 Gen 3, 50MP quad camera, 90W HyperCharge, LTPO AMOLED", category: "smartphones", brand: "Xiaomi", price: 89999, rating: 4.5, reviews: 8700, image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop" },
  { name: "Samsung Galaxy A55 5G", description: "Super AMOLED 120Hz display, 50MP OIS camera, 5000mAh battery, IP67 water resistant", category: "smartphones", brand: "Samsung", price: 29999, rating: 4.4, reviews: 22100, image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop" },
  { name: "Apple iPhone SE (2024)", description: "A15 Bionic chip, 4.7-inch Retina HD, Touch ID, 12MP camera, compact and affordable", category: "smartphones", brand: "Apple", price: 49900, rating: 4.3, reviews: 31000, image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&h=400&fit=crop" },
  { name: "Nothing Phone (2a) 5G", description: "Dimensity 7200 Pro, unique Glyph Interface LED, 50MP camera, 120Hz AMOLED, transparent design", category: "smartphones", brand: "Nothing", price: 23999, rating: 4.4, reviews: 9800, image: "https://images.unsplash.com/photo-1580910051074-3eb694886571?w=400&h=400&fit=crop" },
  { name: "Realme GT 6T 5G", description: "Snapdragon 7 Plus Gen 3, 120W charging, 5500mAh battery, 120Hz LTPO AMOLED display", category: "smartphones", brand: "Realme", price: 27999, rating: 4.3, reviews: 7600, image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop" },
  { name: "iQOO Neo 9 Pro 5G", description: "Snapdragon 8 Gen 2, 50MP OIS camera, 120W FlashCharge, 144Hz LTPO AMOLED gaming phone", category: "smartphones", brand: "iQOO", price: 34999, rating: 4.5, reviews: 11200, image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400&h=400&fit=crop" },

  // ──── AUDIO (8) ────
  { name: "Sony WH-1000XM5 Wireless Headphones", description: "Industry-leading noise cancellation, 30hr battery life, crystal clear hands-free calling", category: "audio", brand: "Sony", price: 24999, rating: 4.8, reviews: 12400, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
  { name: "Apple AirPods Pro 2nd Generation", description: "Active noise cancellation, transparency mode, personalised spatial audio, MagSafe case", category: "audio", brand: "Apple", price: 19900, rating: 4.7, reviews: 31200, image: "https://images.unsplash.com/photo-1606741965574-a2ae6a0f71b0?w=400&h=400&fit=crop" },
  { name: "Samsung Galaxy Buds2 Pro", description: "24-bit Hi-Fi sound, intelligent ANC, ergonomic fit, IPX7 water resistant", category: "audio", brand: "Samsung", price: 10999, rating: 4.5, reviews: 8700, image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop" },
  { name: "Boat Rockerz 450 Bluetooth Headphone", description: "40hr playtime, 40mm drivers, padded earcups, foldable design, dual connectivity", category: "audio", brand: "Boat", price: 1499, rating: 4.2, reviews: 55000, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop" },
  { name: "JBL Charge 5 Portable Bluetooth Speaker", description: "IP67 waterproof, 20hr playtime, powerful JBL Pro Sound with deep bass, powerbank feature", category: "audio", brand: "JBL", price: 13999, rating: 4.6, reviews: 9800, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop" },
  { name: "Bose QuietComfort Ultra Earbuds", description: "World-class noise cancellation, immersive spatial audio, CustomTune sound calibration", category: "audio", brand: "Bose", price: 27900, rating: 4.7, reviews: 6200, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop" },
  { name: "Sony WF-1000XM5 Wireless Earbuds", description: "Smallest noise cancelling earbuds, LDAC Hi-Res Audio, 24hr battery with case, IPX4", category: "audio", brand: "Sony", price: 21990, rating: 4.6, reviews: 14800, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop" },
  { name: "Marshall Stanmore III Bluetooth Speaker", description: "Iconic design, dynamic loudness, adjustable bass and treble, multi-host functionality", category: "audio", brand: "Marshall", price: 39999, rating: 4.8, reviews: 4100, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop" },

  // ──── LAPTOPS (7) ────
  { name: "Apple MacBook Air M3 13-inch", description: "M3 chip, 18hr battery, 13.6-inch Liquid Retina display, fanless design, 8GB RAM", category: "laptops", brand: "Apple", price: 114900, rating: 4.9, reviews: 22000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop" },
  { name: "Dell XPS 15 OLED Laptop", description: "Intel Core i7-13700H, 16GB RAM, 512GB SSD, 15.6-inch 3.5K OLED touch display", category: "laptops", brand: "Dell", price: 149999, rating: 4.7, reviews: 8400, image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop" },
  { name: "Asus ROG Zephyrus G14 Gaming Laptop", description: "AMD Ryzen 9, NVIDIA RTX 4060, 14-inch QHD 165Hz display, 76Wh battery", category: "laptops", brand: "Asus", price: 119990, rating: 4.8, reviews: 6100, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop" },
  { name: "HP Pavilion 15 Laptop", description: "AMD Ryzen 5, 8GB RAM, 512GB SSD, 15.6-inch FHD IPS display, budget-friendly for students", category: "laptops", brand: "HP", price: 54999, rating: 4.3, reviews: 15600, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
  { name: "Lenovo ThinkPad X1 Carbon Gen 11", description: "Intel Core i7 vPro, 14-inch 2.8K OLED, 1.12kg ultralight, military-grade durability", category: "laptops", brand: "Lenovo", price: 174999, rating: 4.8, reviews: 5300, image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=400&fit=crop" },
  { name: "Acer Nitro V Gaming Laptop", description: "Intel Core i5-13420H, RTX 4050, 16GB RAM, 144Hz FHD display, killer WiFi 6", category: "laptops", brand: "Acer", price: 72999, rating: 4.4, reviews: 9800, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop" },
  { name: "MSI Stealth 16 Studio Laptop", description: "Intel Core i9-13900H, RTX 4070, 32GB RAM, 16-inch QHD+ 240Hz, creator and gaming beast", category: "laptops", brand: "MSI", price: 199999, rating: 4.7, reviews: 3200, image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop" },

  // ──── GAMING ACCESSORIES (8) ────
  { name: "Logitech MX Master 3S Wireless Mouse", description: "8000 DPI sensor, MagSpeed electromagnetic scroll, ergonomic design, USB-C, quiet clicks", category: "gaming accessories", brand: "Logitech", price: 8995, rating: 4.8, reviews: 14300, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop" },
  { name: "Razer BlackWidow V4 Mechanical Keyboard", description: "Razer Green mechanical switches, RGB Chroma backlighting, multi-function roller, wrist rest", category: "gaming accessories", brand: "Razer", price: 11999, rating: 4.6, reviews: 6400, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop" },
  { name: "Corsair K70 RGB PRO Mechanical Keyboard", description: "Cherry MX Red switches, PBT double-shot keycaps, dynamic per-key RGB, tournament toggle", category: "gaming accessories", brand: "Corsair", price: 13500, rating: 4.7, reviews: 5100, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop" },
  { name: "Razer DeathAdder V3 Gaming Mouse", description: "30000 DPI Focus Pro sensor, ultra-lightweight 59g, optical Gen-3 switches, speedflex cable", category: "gaming accessories", brand: "Razer", price: 7499, rating: 4.7, reviews: 9200, image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=400&fit=crop" },
  { name: "SteelSeries Arctis Nova Pro Headset", description: "Hi-Res audio, active noise cancellation, hot-swappable battery, retractable mic, premium build", category: "gaming accessories", brand: "SteelSeries", price: 24999, rating: 4.6, reviews: 4800, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop" },
  { name: "Logitech G Pro X Superlight 2", description: "LIGHTFORCE hybrid switches, LIGHTSPEED wireless, 60g ultralight, HERO 2 sensor 32K DPI", category: "gaming accessories", brand: "Logitech", price: 12999, rating: 4.8, reviews: 7100, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop" },
  { name: "HyperX Cloud III Wireless Gaming Headset", description: "DTS Spatial Audio, 53mm drivers, 120hr battery, detachable mic, memory foam earpads", category: "gaming accessories", brand: "HyperX", price: 10999, rating: 4.5, reviews: 8300, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
  { name: "Xbox Elite Series 2 Wireless Controller", description: "Adjustable tension thumbsticks, shorter hair trigger locks, wrap-around rubberised grip, 40hr battery", category: "gaming accessories", brand: "Microsoft", price: 14999, rating: 4.6, reviews: 11200, image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=400&fit=crop" },

  // ──── MONITORS (5) ────
  { name: "Samsung 27-inch 4K UHD IPS Monitor", description: "UHD 4K IPS panel, HDR10, USB-C 65W charging, sRGB 99%, borderless design", category: "monitors", brand: "Samsung", price: 27999, rating: 4.6, reviews: 3800, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop" },
  { name: "LG UltraGear 27-inch 144Hz Gaming Monitor", description: "Full HD IPS, 1ms response time, G-Sync compatible, HDR10, tilt/height/pivot adjustable", category: "monitors", brand: "LG", price: 22999, rating: 4.7, reviews: 7600, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=400&h=400&fit=crop" },
  { name: "Dell UltraSharp 27 4K USB-C Hub Monitor", description: "4K IPS Black panel, 100% sRGB, USB-C 90W PD, RJ45, built-in KVM switch, factory calibrated", category: "monitors", brand: "Dell", price: 52999, rating: 4.8, reviews: 2900, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&h=400&fit=crop" },
  { name: "BenQ EW3280U 32-inch 4K HDR Monitor", description: "32-inch 4K IPS, HDRi technology, treVolo speakers, USB-C 60W, eye-care tech", category: "monitors", brand: "BenQ", price: 44999, rating: 4.6, reviews: 4100, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop" },
  { name: "Asus ProArt PA278QV 27-inch WQHD Monitor", description: "2560x1440 IPS, 100% sRGB and Rec.709, factory pre-calibrated Delta E < 2, 75Hz", category: "monitors", brand: "Asus", price: 31999, rating: 4.7, reviews: 3500, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=400&h=400&fit=crop" },

  // ──── STORAGE (5) ────
  { name: "SanDisk Extreme 1TB Portable SSD", description: "Up to 1050MB/s read, IP65 rated water and dust resistant, compact carabiner design", category: "storage", brand: "SanDisk", price: 8499, rating: 4.7, reviews: 18900, image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&h=400&fit=crop" },
  { name: "Samsung 990 Pro 1TB NVMe M.2 SSD", description: "PCIe Gen 4x4, 7450MB/s read, ideal for PS5 and gaming PCs, Samsung Magician software", category: "storage", brand: "Samsung", price: 9999, rating: 4.8, reviews: 16700, image: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=400&h=400&fit=crop" },
  { name: "WD Black SN850X 2TB NVMe SSD", description: "PCIe Gen 4, 7300MB/s read, Game Mode 2.0, heatsink included, predictive loading", category: "storage", brand: "WD", price: 14999, rating: 4.7, reviews: 8400, image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&h=400&fit=crop" },
  { name: "Seagate One Touch 2TB Portable HDD", description: "USB 3.0, password protection, Rescue Data Recovery Services, slim metal design", category: "storage", brand: "Seagate", price: 5499, rating: 4.4, reviews: 27600, image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=400&fit=crop" },
  { name: "Samsung T7 Shield 1TB Portable SSD", description: "IP65 rated, 1050MB/s read, USB 3.2, shock resistant rubber exterior, compact design", category: "storage", brand: "Samsung", price: 7999, rating: 4.6, reviews: 13200, image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&h=400&fit=crop" },

  // ──── WEARABLES (4) ────
  { name: "Apple Watch Series 9 GPS 45mm", description: "S9 chip, double tap gesture, crash detection, always-on Retina display, blood oxygen sensor", category: "wearables", brand: "Apple", price: 44900, rating: 4.8, reviews: 19800, image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop" },
  { name: "Samsung Galaxy Watch6 Classic 47mm", description: "Rotating bezel, BioActive sensor, sapphire crystal, sleep coaching, body composition analysis", category: "wearables", brand: "Samsung", price: 33999, rating: 4.6, reviews: 8900, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop" },
  { name: "Xiaomi Smart Band 8 Pro", description: "1.74-inch AMOLED, 200+ workout modes, SpO2, 14-day battery, GPS, always-on display", category: "wearables", brand: "Xiaomi", price: 3499, rating: 4.4, reviews: 42000, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop" },
  { name: "Garmin Venu 3 Smartwatch", description: "AMOLED display, body battery energy monitor, sleep coach, wheelchair mode, 14-day battery", category: "wearables", brand: "Garmin", price: 49990, rating: 4.7, reviews: 5600, image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop" },

  // ──── ACCESSORIES (3) ────
  { name: "Anker 7-in-1 USB-C Hub Adapter", description: "4K HDMI, 100W Power Delivery, 3x USB-A 3.0, SD and microSD card reader, aluminium body", category: "computer accessories", brand: "Anker", price: 2499, rating: 4.5, reviews: 31000, image: "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400&h=400&fit=crop" },
  { name: "Logitech C920 HD Pro Webcam", description: "Full 1080p 30fps, stereo audio, auto light correction, Zoom and Teams certified", category: "computer accessories", brand: "Logitech", price: 6999, rating: 4.6, reviews: 27500, image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop" },
  { name: "Belkin BoostCharge Pro 3-in-1 Wireless Charger", description: "Charges iPhone, Apple Watch and AirPods simultaneously, MagSafe compatible, 15W fast charge", category: "computer accessories", brand: "Belkin", price: 12999, rating: 4.5, reviews: 6800, image: "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400&h=400&fit=crop" },
]

export default async function handler(req, res) {
  try {
    const db = await getDB()

    // Clear old products
    await db.collection("products").deleteMany({})

    // Embed each product using Gemini Embedding model, then insert
    let embedded = 0, failed = 0
    for (const p of products) {
      const text = `${p.name} ${p.description} ${p.category} ${p.brand}`

      let embedding = []
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "models/gemini-embedding-001",
              content: { parts: [{ text }] },
            }),
          }
        )
        const data = await response.json()
        if (data.embedding?.values) {
          embedding = data.embedding.values
          embedded++
        } else {
          console.warn(`Embedding failed for "${p.name}":`, data.error?.message || "unknown")
          failed++
        }
      } catch (e) {
        console.warn(`Embedding error for "${p.name}":`, e.message)
        failed++
      }

      await db.collection("products").insertOne({ ...p, embedding })

      // Small delay to respect rate limits on free tier
      await new Promise(r => setTimeout(r, 200))
    }

    res.json({
      message: `Seeded ${products.length} products! Embedded: ${embedded}, Failed: ${failed}`,
      total: products.length,
      embedded,
      failed,
    })
  } catch (err) {
    console.error("seed error:", err)
    res.status(500).json({ error: err.message })
  }
}
