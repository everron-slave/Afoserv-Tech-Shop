import { create } from 'zustand';
import { productService } from '../services/productService';

// Backend API Product interface
interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  specifications: Array<{label: string, value: string}>;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  features?: string[];
  inStock?: boolean;
  warranty?: string;
  shipping?: string;
  // Backend fields that we need to map
  stock?: number;
  featured?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string, category?: string) => Product[];
}

// Helper function to parse spec file format into specifications array
const parseSpecifications = (specText: string): Array<{label: string, value: string}> => {
  const lines = specText.split('\n');
  const specifications: Array<{label: string, value: string}> = [];
  
  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      const label = lines[i].trim();
      const value = lines[i + 1].trim();
      if (label && value) {
        specifications.push({ label, value });
      }
    }
  }
  
  return specifications;
};

// Transform API product to frontend product
const transformApiProduct = (apiProduct: ApiProduct): Product => {
  // Get category-specific specifications
  let specifications: Array<{label: string, value: string}> = [];
  
  // Map category to appropriate specifications
  if (apiProduct.category.toLowerCase().includes('phone') || apiProduct.category.toLowerCase().includes('smartphone')) {
    specifications = parseSpecifications(`Screen
Pixel density
516 pixels per inch
Screen size
6.7 in
Screen shape
Flat
Display the name of the technology marketing
Dynamic AMOLED 2X
Screen glass type
Gorilla Glass
Gorilla Glass screen
Gorilla Glass Victus 2
Screen brightness
1500 CDM2
Brand-specific technologies
Always-on display
Number of colors displayed
16 million colors
Maximum discount rate
120,000
Screen resolution
3120 x 1440`);
  } else if (apiProduct.category.toLowerCase().includes('hdd')) {
    specifications = parseSpecifications(`Capacity
2 TB
Interface
SATA 6 Gb/s
Rotational speed
7200 RPM
Cache
256 MB
Form factor
3.5 inches
Warranty
5 years`);
  } else if (apiProduct.category.toLowerCase().includes('ssd')) {
    specifications = parseSpecifications(`Capacity
1 TB
Interface
NVMe PCIe Gen4
Read speed
7000 MB/s
Write speed
5000 MB/s
Form factor
M.2 2280
Warranty
5 years`);
  } else if (apiProduct.category.toLowerCase().includes('switch') || apiProduct.category.toLowerCase().includes('hpe')) {
    specifications = parseSpecifications(`Ports
48 x 1GbE, 4 x 10Gb SFP+
Switching capacity
176 Gbps
Forwarding rate
131 Mpps
Power over Ethernet
Yes (PoE+)
Management
Fully managed
Warranty
Lifetime`);
  } else {
    // Default specifications for other categories
    specifications = [
      { label: 'Category', value: apiProduct.category },
      { label: 'Stock', value: apiProduct.stock.toString() },
      { label: 'Status', value: apiProduct.active ? 'Active' : 'Inactive' },
    ];
  }
  
  // Calculate rating based on price (just for demo)
  const rating = apiProduct.price > 1000 ? 4.8 : apiProduct.price > 500 ? 4.5 : 4.0;
  const reviewCount = Math.floor(Math.random() * 100) + 10;
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    category: apiProduct.category,
    imageUrl: apiProduct.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    description: apiProduct.description,
    specifications,
    rating,
    reviewCount,
    images: [apiProduct.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    features: ['High quality', 'Durable', 'Warranty included'],
    inStock: apiProduct.stock > 0,
    warranty: '1 year manufacturer warranty',
    shipping: 'Free shipping on orders over $50',
    stock: apiProduct.stock,
    featured: apiProduct.featured,
    active: apiProduct.active,
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
  };
};

// Transform frontend product to API product for create/update
const transformToApiProduct = (product: Omit<Product, 'id'> | Partial<Product>): Partial<ApiProduct> => {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    stock: product.stock || 0,
    featured: product.featured || false,
    active: product.active !== undefined ? product.active : true,
  };
};

// Phone specifications from phone_spec.txt
const phoneSpecs = parseSpecifications(`Screen
Pixel density 
516 pixels per inch
Screen size 
6.7 in
Screen shape 
Flat
Display the name of the technology marketing 
Dynamic AMOLED 2X
Screen glass type 
Gorilla Glass
Gorilla Glass screen 
Gorilla Glass Victus 2
Screen brightness 
1500 CDM2
Brand-specific technologies 
Always-on display
Number of colors displayed 
16 million colors
Maximum discount rate 
120,000
Screen resolution 
3120 x 1440
Connectivity
USB version 
3.2 Gen 1 (3.1 Gen 1)
Headset connection 
USB_Type_C
USB connector 
USB Type-C
Autonomy
Battery life per cycle 
2405 m
Battery life in cycles 
2000
Repeated free-fall reliability class 
HAS
Repairability index 
C
Energy efficiency range 
A to G
Energy efficiency class 
HAS
Code (IP) International Protection 
IP68
representation / realization
Wireless charging 
Yes
Fingerprint reader 
Yes
Fast charging 
Yes
Processor
Processor family 
Snapdragon
Processor model 
8 Elite
Turbo processor frequency 
4.47 GHz
Number of processor cores 
8
Network
Mobile network generation 
5G
SIM card capacity 
Dual SIM
3G Standards 
UMTS
4G standard 
TD-LTE & FDD-LTE
Wi-Fi standard 
Wi-Fi 7 (802.11be)
5G Standard 
Sub6 FDD, Sub6 SDL, Sub6 TDD
Wi-Fi standards 
802.11a, 802.11b, 802.11g, Wi-Fi 5 (802.11ac), Wi-Fi 6E (802.11ax), Wi-Fi 6 (802.11ax), Wi-Fi 7 (802.11be)
Compatible 5G bands 
700, 850, 900, 1900, 2100, 2300, 2500, 2600, 3500, 3700
Bluetooth 
Yes
MIMO (multiple inputs, multiple outputs) 
Yes
Wi-Fi Direct 
Yes
Modulation 
4096-QAM
Supported 3G bands 
850, 900, 1900, 2100
4G support 
700, 850, 900, 1500, 1800, 1900, 2100, 2300, 2500, 2600
SIM card type 
NanoSIM + eSIM
Contactless payment 
Yes
Bluetooth model 
5.4
Camera
Rear camera sensor size 
1/1.3"
Rear camera second sensor size 
1/2.55"
Resolution of the second rear camera (digital) 
12 MP
Rear camera opening number 
1.7
Opening number of the second rear camera 
2.2
Rear camera pixel size 
0.6 µm
Pixel size of the second rear camera 
1.4 µm
Rear camera field of view angle 
85°
Field of view angle of the second rear camera 
120°
Front camera type 
Single camera
Front camera sensor size 
1/3.2"
Front camera opening number 
2.2
Front camera pixel size 
1.12 µm
Front camera field of view angle 
85°
Rear camera flash 
Yes
Rear camera type 
Dual camera
Maximum cadence 
240 fps
Rear camera resolution (digital) 
200 MP
Flash type 
LED
Video capture resolution 
4320 x 7680
Front camera resolution (digital) 
12 MP
Optical zoom 
2x
Digital zoom 
10x
Image stabilizer type 
Optical Image Stabilization (OIS)
Auto focus 
Yes
Image stabilizer 
Yes
Night mode 
Yes
Panorama 
Yes
Portrait Mode 
Yes
Idle speed 
240fps in FHD, 120fps in FHD, 120fps in UHD
Slow motion 
Yes
Storage media
Internal storage capacity 
512 GB
RAM capacity 
12 GB
Compatible memory cards 
Not covered
multimedia
Supported video format 
3G2, 3GP, AVI, FLV, M4A, MKV, WEBM
Supported audio formats 
3GA, AAC, AMR, APE, AWB, DFF, DSF, FLAC, IMY, M4A, MID, MIDI, MP3, MXMF, OGA, OGG, OTA, RTTTL, RTX, WAV, XMF
Navigation
GPS (satellite) 
Yes
GLONASS 
Yes
BeiDou 
Yes
Galileo 
Yes
Quasi-Zenith Satellite System (QZSS) 
Yes
Location of position 
Yes
Design
Product color 
Blue
Format 
Rod
Color name 
Titanium Icyblue
Code (IP) International Protection 
IP68
Battery
Battery technology 
Lithium-Ion (Li-Ion)
Battery capacity 
3900 mAh
ADR classification 
Li-ion < 300 Wh
Package contents
AC adapter included 
No
Detectors
Accelerometer 
Yes
Ambient light sensor 
Yes
Gyroscope 
Yes
Proximity sensor 
Yes
Hall sensor 
Yes
Barometer 
Yes
Geomagnetic sensor 
Yes
Software
Platform 
Android
Operating system range 
One UI 7.0
Operating system installed 
Android 15
Power
USB power capacity 
Yes
USB Type-C charging port 
Yes
Charging power required (min) 
10.0000
Maximum charging power required 
25,000
Weight and dimensions
Depth 
5.8 mm
Width 
75.6 mm
Height 
158.2 mm
Weight 
163 g
Basic Data
Series 
Galaxy S25 Edge`);

// HDD specifications from hdd_spec.txt
const hddSpecs = parseSpecifications(`Features
Kind 
HDD
component for 
Surveillance system
Hard drive capacity 
10000 GB
Storage drive buffer size 
512 MB
Hard drive interface transfer speed 
6 Gbit/s
Average hard drive transfer rate 
272 Mbyte/s
Interface 
ATA Series III
Hard drive rotation speed 
7200
Hard drive size 
3.5
Packaging information
Quantity 
1.0000
Environmental conditions
Off-temperature 
-40 - 70
Operating temperature 
0 - 60
Weight and dimensions
Depth 
147 mm
Width 
101.6 mm
Height 
26.1 mm
Weight 
750 g
Other features
Certification 
BSMI, ICES-003/NMB-003, CE, FCC, KC, Maghreb, RCM, UKCA, VCCI, CB-Scheme, TUV, UL
Basic Data
Series 
Purple Pro`);

// SSD specifications from ssd_spec.txt
const ssdSpecs = parseSpecifications(`Features
Average time between breakdowns 
2,000,000 h
component for 
Server
SSD form factor 
2.5"
Reading speed 
550 Mbyte/s
Writing speed 
380 Mbyte/s
NVMe 
No
Hardware encryption 
Yes
Random reading (4KB) 
98000 IOPS
Random writing (4KB) 
15000 IOPS
TRIM support 
Yes
SMART Support 
Yes
Supported security algorithm 
256-bit AES
Interface 
SATA
Solid State Drive (SSD) capacity 
240 GB
Disk recordings per day (DWPD) 
1
Data transfer rate 
6 Gbit/s
Memory type 
V-NAND TLC
Environmental conditions
Off-temperature 
-40 - 85
Operating relative humidity (HH) 
5 - 95
Vibrations not functioning 
20 G
Shock, out of order 
1500 G
Operating temperature 
0 - 70
Technical details
Warranty period 
5 years
Power
Consumption (max) 
1.5000
Power consumption (Reading) 
2,2000
Power consumption (Writing) 
2.7000
Weight and dimensions
Depth 
7 mm
Width 
100.2 mm
Height 
69.85 mm
Other features
Warranty period 
5 years
Logistics data
Quantity 
1.0000
Basic Data
Series 
PM893`);

// HPE Aruba switches specifications from hpe-aruba-switches.txt
const hpeSwitchSpecs = parseSpecifications(`Management characteristics
Switch type 
Managed
Switch bank 
L2/L3/L4
Web-based management 
Yes
Quality of Service (QoS) 
Yes
Managed in the Cloud 
Yes
ARP Inspection 
Yes
System event log 
Yes
Security
DHCP Functions 
DHCP client, DHCP snooping
Access Control List (ACL) 
Yes
IGMP filtering 
Yes
BPDU filtering/protection 
Yes
SSH/SSL support 
Yes
Loop protection 
Yes
Multicasting features
Support for multi-channel distribution 
Yes
PoE (Power over Ethernet)
Ethernet connection, supporting power delivery via this port (PoE) 
No
Connectivity
Number of basic switching RJ-45 Ethernet ports 
24
Basic switching RJ-45 Ethernet port type 
Gigabit Ethernet (10/100/1000)
Number of SFP+ module slots 
4
Number of SFP module slots 
4
representation / realization
Flash memory 
256 MB
Internal memory 
512 MB
Processor frequency 
800 MHz
Processor model 
ARM Cortex-A9
Fanless 
Yes
Memory type 
SDRAM / Flash
Integrated into the processor 
Yes
Network
10G support 
No
Ethernet LAN: data transfer rate 
10, 1000, 100 Mbit/s
Copper Ethernet cabling technology 
1000BASE-T
Flow control assistance 
Yes
Port mirroring 
Yes
IP Routing 
Yes
Full duplex 
Yes
Input routing 
32
Active bond detection 
Yes
VLAN support 
Yes
Link aggregation 
Yes
Automatic detection 
Yes
Flow rate limitation 
Yes
Spanning Tree Protocols (STP) 
Yes
Number of VLANs 
4093
Design
Mounting grid 
Yes
Product color 
White
Stackable 
Yes
Format 
1U
Environmental conditions
Relative humidity level (storage) 
15 - 95
Off-temperature 
-40 - 70
Operating altitude 
0 - 3000
Operating relative humidity (HH) 
15 - 95
Operating temperature 
0 - 40
Data transmission
Switching capacity 
176 Gbit/s
Speed 
130.95 Mpps
MAC address book 
16,000 entries
Latency (10-100 Mbps) 
4.5 µs
Latency (1 Gbps) 
2.2 µs
Latency (10 Gbps) 
1.2 µs
Support for Jumbo Frames 
Yes
Giant frames 
9216
Packet cache memory 
1.5 MB
Power
Consumption (max) 
36.9000
AC input voltage 
200-240 V
Power supply included 
Yes
Power source 
Sector
Input current 
0.2 A
AC input frequency 
50-60 Hz
Weight and dimensions
Depth 
442.5 mm
Width 
43.9 mm
Height 
282.4 mm
Weight 
3130 g`);

// Mock initial data with detailed specifications
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S25 Edge',
    price: 1299,
    category: 'PHONES',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    description: 'Flagship smartphone with Dynamic AMOLED 2X display, 200MP camera, and Snapdragon 8 Elite processor',
    specifications: phoneSpecs,
    rating: 4.8,
    reviewCount: 124,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&q=60'
    ],
    features: [
      'Dynamic AMOLED 2X display with 120Hz refresh rate',
      '200MP camera with advanced AI processing',
      'Snapdragon 8 Elite processor for maximum performance',
      '5G connectivity with multiple band support',
      'Wireless charging and fast charging support',
      'IP68 water and dust resistance'
    ],
    inStock: true,
    warranty: '2-year manufacturer warranty',
    shipping: 'Free express shipping'
  },
  {
    id: '2',
    name: 'WD Purple Pro 10TB Surveillance HDD',
    price: 299,
    category: 'HDD',
    imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&h=300&fit=crop',
    description: '10TB surveillance hard drive designed for 24/7 operation in security systems',
    specifications: hddSpecs,
    rating: 4.6,
    reviewCount: 89,
    images: [
      'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&h=600&fit=crop&q=80'
    ],
    features: [
      'Designed for 24/7 surveillance systems',
      '10TB capacity for extended recording',
      '7200 RPM for fast data access',
      'AllFrame AI technology for smooth video playback',
      '3-year limited warranty',
      'Low power consumption design'
    ],
    inStock: true,
    warranty: '3-year limited warranty',
    shipping: 'Free standard shipping'
  },
  {
    id: '3',
    name: 'Samsung PM893 240GB Enterprise SSD',
    price: 89,
    category: 'SSD',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=300&fit=crop',
    description: 'Enterprise-grade 2.5" SATA SSD with hardware encryption and 5-year warranty',
    specifications: ssdSpecs,
    rating: 4.7,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop&q=80'
    ],
    features: [
      'Enterprise-grade reliability with 2M hours MTBF',
      'Hardware encryption with 256-bit AES',
      '5-year limited warranty',
      'Power-loss protection for data integrity',
      'V-NAND TLC technology for endurance',
      'SATA 6Gb/s interface'
    ],
    inStock: true,
    warranty: '5-year limited warranty',
    shipping: 'Free standard shipping'
  },
  {
    id: '4',
    name: 'HPE Aruba 2930F 24G Switch',
    price: 899,
    category: 'HPE AURA SWITCHES',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    description: '24-port managed Gigabit Ethernet switch with Layer 2/3/4 features',
    specifications: hpeSwitchSpecs,
    rating: 4.5,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&q=80'
    ],
    features: [
      '24 Gigabit Ethernet ports with 4 SFP+ slots',
      'Layer 2/3/4 switching capabilities',
      'Fanless design for silent operation',
      'Cloud-managed with Aruba Central',
      'Advanced security features',
      'Energy efficient design'
    ],
    inStock: true,
    warranty: 'Lifetime warranty',
    shipping: 'Free express shipping'
  },
  {
    id: '5',
    name: 'Ubiquiti UniFi Dream Machine Pro',
    price: 379,
    category: 'UBIQUITI',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
    description: 'Enterprise security gateway with integrated network controller and 8-port switch',
    specifications: [
      { label: 'Processor', value: 'Quad-core 1.7 GHz' },
      { label: 'Memory', value: '4GB DDR4' },
      { label: 'Storage', value: '128GB eMMC' },
      { label: 'Network Ports', value: '8x Gigabit Ethernet, 1x SFP+' },
      { label: 'Throughput', value: '3.5 Gbps' },
      { label: 'VPN Throughput', value: '1 Gbps' },
      { label: 'IDS/IPS Throughput', value: '850 Mbps' },
      { label: 'Power Consumption', value: '33W max' },
      { label: 'Dimensions', value: '442.4 x 43.9 x 285.6 mm' },
      { label: 'Weight', value: '3.13 kg' }
    ],
    rating: 4.8,
    reviewCount: 203,
    images: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&q=80'
    ],
    features: [
      'Integrated UniFi Network Controller',
      'Intrusion Detection and Prevention System',
      'Deep Packet Inspection',
      'Site-to-site VPN capabilities',
      '8-port Gigabit switch with PoE support',
      '1.3" touchscreen for status monitoring'
    ],
    inStock: true,
    warranty: '1-year limited warranty',
    shipping: 'Free standard shipping'
  },
  {
    id: '6',
    name: 'MacBook Pro 16" M3 Pro',
    price: 2499,
    category: 'APPLE',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    description: 'Apple M3 Pro chip with 12‑core CPU, 18‑core GPU, 36GB unified memory, 1TB SSD storage',
    specifications: [
      { label: 'Processor', value: 'Apple M3 Pro (12-core)' },
      { label: 'Memory', value: '36GB Unified Memory' },
      { label: 'Storage', value: '1TB SSD' },
      { label: 'Display', value: '16.2-inch Liquid Retina XDR' },
      { label: 'Resolution', value: '3456 x 2234 pixels' },
      { label: 'Graphics', value: '18-core GPU' },
      { label: 'Battery', value: 'Up to 22 hours' },
      { label: 'Weight', value: '2.1 kg (4.7 pounds)' },
      { label: 'Ports', value: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3' },
      { label: 'Wireless', value: 'Wi-Fi 6E, Bluetooth 5.3' }
    ],
    rating: 4.9,
    reviewCount: 312,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=60'
    ],
    features: [
      'Liquid Retina XDR display with ProMotion',
      'M3 Pro chip for exceptional performance',
      'Up to 22 hours of battery life',
      'Studio-quality three-mic array',
      'Six-speaker sound system with spatial audio',
      'Advanced thermal system for sustained performance'
    ],
    inStock: true,
    warranty: '1-year limited warranty with AppleCare+ option',
    shipping: 'Free express shipping'
  },
];

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [...initialProducts],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Real API call
      const response = await productService.getProducts({ limit: 100 });
      console.log('API Response:', response);
      
      // API returns { success: true, data: products[], pagination: {...} }
      // Extract products array from response
      let apiProducts = [];
      if (response && response.success && Array.isArray(response.data)) {
        apiProducts = response.data;
      } else if (Array.isArray(response)) {
        apiProducts = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        apiProducts = response.data;
      }
      
      console.log('Extracted products:', apiProducts.length);
      
      // Transform API products to frontend format
      const transformedProducts = apiProducts.map(transformApiProduct);
      
      set({ products: transformedProducts, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ error: 'Failed to fetch products', isLoading: false });
    }
  },

  getProduct: (id: string) => {
    return get().products.find(product => product.id === id);
  },

  addProduct: async (productData: Omit<Product, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      // Transform to API format
      const apiProductData = transformToApiProduct(productData);
      
      // Real API call
      const response = await productService.createProduct(apiProductData as any);
      const newApiProduct = response.data || response;
      
      // Transform the response to frontend format
      const newProduct = transformApiProduct(newApiProduct);
      
      // Update state
      set(state => ({
        products: [...state.products, newProduct],
        isLoading: false,
      }));
      
      return newProduct.id;
    } catch (error) {
      console.error('Failed to add product:', error);
      set({ error: 'Failed to add product', isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      // Transform to API format
      const apiProductData = transformToApiProduct(productData);
      
      // Real API call
      const response = await productService.updateProduct(id, apiProductData as any);
      const updatedApiProduct = response.data || response;
      
      // Transform the response to frontend format
      const updatedProduct = transformApiProduct(updatedApiProduct);
      
      // Update state
      set(state => ({
        products: state.products.map(product =>
          product.id === id ? updatedProduct : product
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update product:', error);
      set({ error: 'Failed to update product', isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Real API call
      await productService.deleteProduct(id);
      
      // Update state
      set(state => ({
        products: state.products.filter(product => product.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete product:', error);
      set({ error: 'Failed to delete product', isLoading: false });
      throw error;
    }
  },

  searchProducts: (query: string, category?: string) => {
    const { products } = get();
    
    return products.filter(product => {
      const matchesQuery =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || product.category === category;
      
      return matchesQuery && matchesCategory;
    });
  },
}));
