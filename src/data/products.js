// Product data for LuxCart â€” local fallback (main data comes from MongoDB)
export const collections = [
  {
    id: 'c1',
    name: 'Gaming Gear',
    count: 248,
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'c2',
    name: 'Audio',
    count: 186,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&q=80',
  },
  {
    id: 'c3',
    name: 'Wearables',
    count: 145,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop&q=80',
  },
  {
    id: 'c4',
    name: 'Storage & Drives',
    count: 97,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop&q=80',
  },
  {
    id: 'c5',
    name: 'Creative Tools',
    count: 120,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=400&fit=crop&q=80',
  },
];

export const products = [
  {
    id: 1, name: 'Logitech G102 Gaming Mouse', category: 'gaming accessories', brand: 'Logitech',
    price: 1200, originalPrice: 1600, rating: 4.6, reviews: 12450, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=650&fit=crop&q=80',
    description: 'RGB wired gaming mouse with high precision sensor for PC gaming',
    sizes: ['One Size'], colors: ['#1a1a2e', '#2d3436', '#e74c3c'], isNew: false,
  },
  {
    id: 2, name: 'Sony WH-CH520 Wireless Headphones', category: 'audio', brand: 'Sony',
    price: 4500, originalPrice: 5500, rating: 4.5, reviews: 8900, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=650&fit=crop&q=80',
    description: 'Bluetooth headphones with deep bass and long battery life',
    sizes: ['One Size'], colors: ['#1a1a2e', '#f5f0e1'], isNew: false,
  },
  {
    id: 3, name: 'Mechanical RGB Gaming Keyboard', category: 'gaming accessories', brand: 'Redragon',
    price: 3200, originalPrice: null, rating: 4.4, reviews: 5200, badge: 'new',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=650&fit=crop&q=80',
    description: 'Mechanical keyboard with blue switches and RGB lighting',
    sizes: ['One Size'], colors: ['#1a1a2e', '#2d3436'], isNew: true,
  },
  {
    id: 4, name: 'Samsung 27 inch 4K Monitor', category: 'monitors', brand: 'Samsung',
    price: 24000, originalPrice: 28000, rating: 4.7, reviews: 3600, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=650&fit=crop&q=80',
    description: 'Ultra HD monitor ideal for coding and design',
    sizes: ['27 inch'], colors: ['#1a1a2e'], isNew: false,
  },
  {
    id: 5, name: 'Noise Cancelling Earbuds', category: 'audio', brand: 'Boat',
    price: 3500, originalPrice: null, rating: 4.3, reviews: 10800, badge: 'new',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&h=650&fit=crop&q=80',
    description: 'Wireless earbuds with active noise cancellation',
    sizes: ['One Size'], colors: ['#1a1a2e', '#f5f0e1', '#c9a96e'], isNew: true,
  },
  {
    id: 6, name: 'Ergonomic Office Chair', category: 'office furniture', brand: 'GreenSoul',
    price: 8500, originalPrice: 12000, rating: 4.5, reviews: 2800, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=650&fit=crop&q=80',
    description: 'Comfortable office chair with lumbar support',
    sizes: ['Standard'], colors: ['#1a1a2e', '#2d3436'], isNew: false,
  },
  {
    id: 7, name: 'USB-C Multiport Hub', category: 'computer accessories', brand: 'Anker',
    price: 1500, originalPrice: null, rating: 4.4, reviews: 6500, badge: 'new',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=650&fit=crop&q=80',
    description: '7 in 1 USB-C hub with HDMI and USB ports',
    sizes: ['One Size'], colors: ['#808080'], isNew: true,
  },
  {
    id: 8, name: 'Portable SSD 1TB', category: 'storage', brand: 'SanDisk',
    price: 9000, originalPrice: 11000, rating: 4.7, reviews: 5400, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=650&fit=crop&q=80',
    description: 'High speed external SSD for backups and gaming',
    sizes: ['1TB'], colors: ['#1a1a2e', '#c9a96e'], isNew: false,
  },
  {
    id: 9, name: 'Laptop Cooling Pad', category: 'laptop accessories', brand: 'Cosmic Byte',
    price: 1800, originalPrice: null, rating: 4.3, reviews: 2100, badge: 'new',
    image: 'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=500&h=650&fit=crop&q=80',
    description: 'Cooling stand with high speed fans for gaming laptops',
    sizes: ['15.6 inch', '17 inch'], colors: ['#1a1a2e'], isNew: true,
  },
  {
    id: 10, name: 'HD Webcam 1080p', category: 'streaming gear', brand: 'Logitech',
    price: 2500, originalPrice: 3200, rating: 4.6, reviews: 7900, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70e0?w=500&h=650&fit=crop&q=80',
    description: 'Full HD webcam for meetings and streaming',
    sizes: ['One Size'], colors: ['#1a1a2e'], isNew: false,
  },
  {
    id: 11, name: 'Bluetooth Portable Speaker', category: 'audio', brand: 'JBL',
    price: 2800, originalPrice: null, rating: 4.5, reviews: 9600, badge: 'new',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=650&fit=crop&q=80',
    description: 'Water resistant speaker with powerful bass',
    sizes: ['One Size'], colors: ['#1a1a2e', '#e74c3c', '#3498db'], isNew: true,
  },
  {
    id: 12, name: 'Samsung T7 Portable SSD', category: 'storage', brand: 'Samsung',
    price: 10500, originalPrice: 13000, rating: 4.8, reviews: 4200, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500&h=650&fit=crop&q=80',
    description: 'Ultra fast portable SSD for professionals',
    sizes: ['500GB', '1TB', '2TB'], colors: ['#3498db', '#808080', '#e74c3c'], isNew: false,
  },
];

export const newArrivals = [
  {
    id: 13, name: 'Graphic Drawing Tablet', category: 'creative tools', brand: 'Wacom',
    price: 5200, originalPrice: null, rating: 4.7, reviews: 3300, badge: 'new',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&h=650&fit=crop&q=80',
    description: 'Digital tablet for artists and designers',
    sizes: ['Small', 'Medium'], colors: ['#1a1a2e'], isNew: true,
  },
  {
    id: 14, name: 'Gaming Headset with Mic', category: 'gaming accessories', brand: 'HyperX',
    price: 3000, originalPrice: 4000, rating: 4.5, reviews: 4700, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500&h=650&fit=crop&q=80',
    description: 'Surround sound gaming headset with microphone',
    sizes: ['One Size'], colors: ['#1a1a2e', '#e74c3c'], isNew: true,
  },
  {
    id: 15, name: 'Smart Fitness Watch', category: 'wearables', brand: 'Amazfit',
    price: 5500, originalPrice: null, rating: 4.4, reviews: 6800, badge: 'new',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=650&fit=crop&q=80',
    description: 'Smartwatch with heart rate and sleep tracking',
    sizes: ['One Size'], colors: ['#1a1a2e', '#2d3436', '#c9a96e'], isNew: true,
  },
  {
    id: 16, name: 'USB Streaming Microphone', category: 'streaming gear', brand: 'Fifine',
    price: 4200, originalPrice: 5000, rating: 4.5, reviews: 3600, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&h=650&fit=crop&q=80',
    description: 'Professional microphone for podcasts and streaming',
    sizes: ['One Size'], colors: ['#1a1a2e'], isNew: true,
  },
  {
    id: 17, name: 'VR Gaming Headset', category: 'gaming hardware', brand: 'Meta',
    price: 15000, originalPrice: 18000, rating: 4.6, reviews: 2900, badge: 'sale',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=650&fit=crop&q=80',
    description: 'Virtual reality headset for immersive gaming',
    sizes: ['One Size'], colors: ['#f5f0e1'], isNew: true,
  },
  {
    id: 18, name: 'WiFi 6 Router', category: 'networking', brand: 'TP-Link',
    price: 6500, originalPrice: null, rating: 4.5, reviews: 5700, badge: 'new',
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500&h=650&fit=crop&q=80',
    description: 'High speed router for gaming and streaming',
    sizes: ['One Size'], colors: ['#1a1a2e', '#f5f0e1'], isNew: true,
  },
];

