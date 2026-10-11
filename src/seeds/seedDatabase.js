const mongoose = require("mongoose");
const env = require("../config/env");

const Admin = require("../models/Admin");
const Section = require("../models/Section");
const Workshop = require("../models/Workshop");
const Batch = require("../models/Batch");
const Product = require("../models/Product");
const Registration = require("../models/Registration");
const ProductOrder = require("../models/ProductOrder");
const Inquiry = require("../models/Inquiry");

// ─────────────────────────────────────────────────────────────
//  1. SEED DATA DEFINITIONS (Master / Catalog Data Only)
// ─────────────────────────────────────────────────────────────

const SEED_ADMIN = {
  name: "Sushmitha (Sushii)",
  email: "admin@shashstudios.com",
  password: "admin123",
  role: "superadmin",
  isActive: true,
};

const SEED_SECTIONS = [
  {
    slug: "yoga",
    name: "Yoga & Strength",
    nameKn: "ಯೋಗ ಮತ್ತು ಶಕ್ತಿ",
    icon: "spa",
    emoji: "🪷",
    tagline: "Authentic Mysuru Vinyasa, Hatha Yoga, Strength Training & Daily Sadhana",
    taglineKn: "ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಶೈಲಿಯ ಹಠ ಯೋಗ, ವಿನ್ಯಾಸ ಮತ್ತು ಶಕ್ತಿ ತರಬೇತಿ",
    badge: "Mysuru Lineage",
    badgeKn: "ಮೈಸೂರು ಪರಂಪರೆ",
    accentColor: "#1C3325",
    lightBg: "bg-[#F4F8F5]",
    order: 1,
  },
  {
    slug: "music",
    name: "Music & Sound Therapy",
    nameKn: "ಸಂಗೀತ ಮತ್ತು ನಾದ ಚಿಕಿತ್ಸೆ",
    icon: "graphic_eq",
    emoji: "🎵",
    tagline: "Carnatic classical, Devara Nama, acoustic flute resonance, and Sushii Nights",
    taglineKn: "ಕರ್ನಾಟಕ ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ, ದೇವರನಾಮ, ಬಿದಿರಿನ ಕೊಳಲು ಮತ್ತು ನಿದ್ರಾ ಧ್ಯಾನ",
    badge: "Sound Sanctuary",
    badgeKn: "ನಾದ ಚಿಕಿತ್ಸೆ",
    accentColor: "#C26D38",
    lightBg: "bg-[#FBF6EE]",
    order: 2,
  },
  {
    slug: "other",
    name: "Other Activities & Retreats",
    nameKn: "ಇತರ ಚಟುವಟಿಕೆಗಳು & ಶಿಬಿರಗಳು",
    icon: "hiking",
    emoji: "🌿",
    tagline: "Postpartum Maathru Samskaara, Fit & Flow, Chamundi walks, and retreats",
    taglineKn: "ಮಾತೃ ಸಂಸ್ಕಾರ, ಫಿಟ್ & ಫ್ಲೋ, ಚಾಮುಂಡಿ ಬೆಟ್ಟದ ನಡಿಗೆ ಮತ್ತು ವಿಶೇಷ ತರಬೇತಿ",
    badge: "Holistic Lifestyle",
    badgeKn: "ಸಮಗ್ರ ಜೀವನಶೈಲಿ",
    accentColor: "#2D4A37",
    lightBg: "bg-[#F0F5F2]",
    order: 3,
  },
];

const SEED_WORKSHOPS = [
  {
    slug: "21day",
    title: "21-Day Holistic Challenge",
    titleKn: "21 ದಿನಗಳ ಸಂಪೂರ್ಣ ಆರೋಗ್ಯ ಸವಾಲು",
    section: "yoga",
    sectionLabel: "Yoga",
    sectionLabelKn: "ಯೋಗ",
    category: "holistic",
    categoryLabel: "Holistic Health",
    description: "Our flagship habit reset program. Taught in Kannada, covering morning rising, daily yoga, diet recipes, early dinner, and water therapy.",
    descriptionKn: "ನಮ್ಮ ಪ್ರಮುಖ ಅಭ್ಯಾಸ ಮರುಹೊಂದಿಸುವ ಕಾರ್ಯಕ್ರಮ. ಮುಂಜಾನೆ ಏಳುವುದು, ದೈನಂದಿನ ಯೋಗ, ಆಹಾರ ಪಾಕವಿಧಾನಗಳು, ಆರಂಭಿಕ ಊಟ ಮತ್ತು ಜಲ ಚಿಕಿತ್ಸೆ.",
    price: 499,
    originalPrice: 999,
    duration: "4 Batches Daily",
    timingSlot: "5:30 AM or 6:30 AM IST",
    timingIcon: "alarm",
    badge: "BATCH 1 · 21-DAY CHALLENGE",
    batchSchedule: "Batch 1 · Daily Dawn",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeW6X-Xbnzzibn5vBblDaMOKZ9I5pN1IM06R4zDRuOdkD-9Wo6S3m7m_J0dK0qdWJGyueyVkmQmwzk5BxGQIVpWVDXZhXVm80sJovk1mFz71N5ZhVHUenH4R4_9Bk3eTDTvbBT952IM8xLqwXcNFPzE8Fzq9jksT6GmEJpllQ1Vja4PrcRzI8jJaqJDwQsP41wdO6-Hd03gbX80NkyitBR2PCUNesuc1Hu0ObZ1sat3JWb4IooqiCC",
    features: [
      "Morning rising routine",
      "Sattvic Mysore diet guide",
      "24-Hr Zoom recordings",
      "Private WhatsApp support",
    ],
    spotsLeft: 5,
    order: 1,
    isActive: true,
  },
  {
    slug: "kids-yoga",
    title: "Kids Yoga Class",
    titleKn: "ಮಕ್ಕಳ ಏಕಾಗ್ರತೆ ಮತ್ತು ನೆನಪಿನ ಶಕ್ತಿ",
    section: "other",
    sectionLabel: "Other Activities",
    sectionLabelKn: "ಇತರ ಚಟುವಟಿಕೆಗಳು",
    category: "kids",
    categoryLabel: "Ages 6 – 14",
    description: "Gamified movement storytelling and posture challenges to build focus, cognitive attention, and healthy early rising routines before school.",
    descriptionKn: "ಏಕಾಗ್ರತೆ, ಜ್ಞಾಪಕ ಶಕ್ತಿ ಮತ್ತು ಶಾಲೆಯ ಮುನ್ನ ಆರೋಗ್ಯಕರ ಮುಂಜಾನೆ ದಿನಚರಿಯನ್ನು ರೂಪಿಸಲು ಕಥೆಗಳ ಮೂಲಕ ಕಲಿಸುವ ಯೋಗ.",
    price: 239,
    originalPrice: 499,
    duration: "60 Mins Daily",
    timingSlot: "5:30 – 6:30 AM IST",
    timingIcon: "child_care",
    badge: "BATCH 2 · KIDS YOGA",
    batchSchedule: "Batch 2 · Mon – Fri",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWx2WuINFmClRF4E05mMQnZ18XYMu2qyyyVug6WRymBZxnnLaCi-Q-PQyA5YioQydeiOQC4EUJc72ZBDanMUddS_23DBNt846OpI8NwtJFOaLS1QhUnSj_nRj-ySad5LvxScOmD1RBvr4mHaQPdnMEtXHQFMh7RwAmk4GbB1kYK_A3QTnI_dam6pMiapE_z0ikK8UlPb2pfC6SE4dBufHXlsAoAThTQ3YSbuOA_AF9dj17DRhSEQe7",
    features: [
      "Posture alignment for young bones",
      "Focus & memory exercises",
      "Playful animal asanas",
      "Early morning discipline",
    ],
    spotsLeft: 6,
    order: 2,
    isActive: true,
  },
  {
    slug: "strength-training",
    title: "Strength Training & Calisthenics",
    titleKn: "ದೇಹದ ಶಕ್ತಿ ಮತ್ತು ದೃಢತೆ ತರಬೇತಿ",
    section: "other",
    sectionLabel: "Other Activities",
    sectionLabelKn: "ಇತರ ಚಟುವಟಿಕೆಗಳು",
    category: "strength",
    categoryLabel: "Core & Muscle",
    description: "Daily bodyweight training, conditioning planks, and high-intensity stamina finishers. 100% equipment-free workouts.",
    descriptionKn: "ದೈನಂದಿನ ಶಾರೀರಿಕ ತೂಕದ ವ್ಯಾಯಾಮ, ಪ್ಲಾಂಕ್‌ಗಳು ಮತ್ತು ಸ್ಟ್ಯಾಮಿನಾ ಹೆಚ್ಚಿಸುವ ತರಬೇತಿ. ಶೇಕಡಾ 100 ರಷ್ಟು ಸಲಕರಣೆ ರಹಿತ ಅಭ್ಯಾಸ.",
    price: 419,
    originalPrice: 799,
    duration: "60 Mins Daily",
    timingSlot: "6:30 – 7:30 AM IST",
    timingIcon: "fitness_center",
    badge: "BATCH 3 · STRENGTH",
    batchSchedule: "Batch 3 · Mon, Wed, Fri",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaovdrEA20fBsc8MNpN-IdZDWOFWmudRa9ddQIjXQ7wMhhLMS1Yefql3G2_DFQylnazjCgFhrkLPNdVSp0D2lHEYomxs-_83swuj_ICLr05ERYZOqB8l2MR8Za_wEkptlPYSM5P168n3dzLA-QG-1HhCqmfP6xb_J6Mr3ogsTUGGUsTqHnclCjc5fu93WQCNAwEi2wwORK4JwObRB92bMPAXi04hpKBgywcVc3iQ4K_t497e2NdEfh",
    features: [
      "Bodyweight calisthenics",
      "Core compression strength",
      "Spine resilience drills",
      "Metabolism boosting finishers",
    ],
    spotsLeft: 4,
    order: 3,
    isActive: true,
  },
  {
    slug: "ladies-yoga",
    title: "Ladies Yoga Batch",
    titleKn: "ಮಹಿಳೆಯರ ವಿಶೇಷ ಯೋಗ ಅಭ್ಯಾಸ",
    section: "yoga",
    sectionLabel: "Yoga",
    sectionLabelKn: "ಯೋಗ",
    category: "women",
    categoryLabel: "Women’s Health",
    description: "Women-only batch focusing on pelvic floor strength, core conditioning, thyroid health, and hormonal balance.",
    descriptionKn: "ಪೆಲ್ವಿಕ್ ಫ್ಲೋರ್ ಬಲ, ಕೋರ್ ಕಂಡೀಷನಿಂಗ್, ಥೈರಾಯ್ಡ್ ಆರೋಗ್ಯ ಮತ್ತು ಹಾರ್ಮೋನ್ ಸಮತೋಲನದ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸುವ ಮಹಿಳೆಯರಿಗೆ ಮಾತ್ರ ಮೀಸಲಾದ ಬ್ಯಾಚ್.",
    price: 179,
    originalPrice: 399,
    duration: "60 Mins Daily",
    timingSlot: "11:30 AM – 12:30 PM IST",
    timingIcon: "sunny",
    badge: "BATCH 4 · LADIES",
    batchSchedule: "Batch 4 · Women Only",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEOt2PxOnG_oLgwz0XPk14P5RknxKLUrYQllO9WXA6YojXJ28wzsk5wquzc5VLuSvph2mnDFLBkoPVcK6H91NdTx09v-jHqTwbp2827W3CRCiqGpBvJC4oxhoauU9cUb4Ge4q8j-wr6JodXzCP3mvmguwxhQMewz7VqUqblbg1oh2VSNUik8Nt4qCforORq3FRV33a47BhPN--31GttinC2ZsczJoHuaqxSCWmv0ThpBlUoU6KLCvU",
    features: [
      "Hormonal balancing asanas",
      "PCOD / PCOS gentle modifications",
      "Pelvic floor rehabilitation",
      "Supportive women cohort",
    ],
    spotsLeft: 4,
    order: 4,
    isActive: true,
  },
  {
    slug: "ashtanga-yoga",
    title: "Traditional Ashtanga Yoga",
    titleKn: "ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಶೈಲಿಯ ಯೋಗ",
    section: "yoga",
    sectionLabel: "Yoga",
    sectionLabelKn: "ಯೋಗ",
    category: "vinyasa",
    categoryLabel: "Traditional Vinyasa",
    description: "Traditional Mysore-style dynamic Vinyasa flow, Ujjayi breathing, and focus point (Tristhana) integration. Systematically taught.",
    descriptionKn: "ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಶೈಲಿಯ ಡೈನಾಮಿಕ್ ವಿನ್ಯಾಸ, ಉಜ್ಜಾಯೀ ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ತ್ರಿಸ್ಥಾನ ತತ್ವಗಳೊಂದಿಗೆ ಕ್ರಮಬದ್ಧ ಬೋಧನೆ.",
    price: 419,
    originalPrice: 899,
    duration: "60 Mins Daily",
    timingSlot: "5:30 – 6:30 AM IST",
    timingIcon: "spa",
    badge: "BATCH 5 · ADVANCED",
    batchSchedule: "Batch 5 · Tues & Thurs",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwnGj6pKZVyj-nq1nUw4LlIBES-tMfCjP7DKKyaqFYd72ASHCZGIy5zhDwwKdBx1QpV_9-cd4RD3xSBEgEU8zTZhkGboliDpvUZZBdmS2QvMJU3wyDdLBKH-81-sVLg56VbNuaYfGBaoKcbhPy5X1nDmwfPE2K69BaDyz1PZ_oE-0jlA8G1EqDdz5m82UOqe8lrKbnxZ7SEoWi-xBgiHLigTWHtcdhQxL_KmcpOdaOerCMfY8j4JZ_",
    features: [
      "Mysore Primary Series foundations",
      "Tristhana focus methodology",
      "Ujjayi pranayama breathwork",
      "Safe physical alignment",
    ],
    spotsLeft: 3,
    order: 5,
    isActive: true,
  },
  {
    slug: "sushii-nights",
    title: "Sushii Nights",
    titleKn: "ಸುಶಿ ನೈಟ್ಸ್ — ನಿದ್ರಾ ಧ್ಯಾನ ಮತ್ತು ವಿಶ್ರಾಂತಿ",
    section: "music",
    sectionLabel: "Music & Sound",
    sectionLabelKn: "ಸಂಗೀತ ಮತ್ತು ನಾದ",
    category: "sleep",
    categoryLabel: "Sleep & Wind Down",
    description: "30-minute bedtime unwind, pranayama, and guided Yoga Nidra to dissolve screen fatigue, insomnia, and nervous system tension.",
    descriptionKn: "ಕಂಪ್ಯೂಟರ್ ಕೆಲಸದ ದಣಿವು ಮತ್ತು ನಿದ್ರಾಹೀನತೆಯನ್ನು ಹೋಗಲಾಡಿಸಲು 30 ನಿಮಿಷಗಳ ಮಲಗುವ ಮುನ್ನ ವಿಶ್ರಾಂತಿ, ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಧ್ಯಾನ.",
    price: 49,
    originalPrice: 149,
    duration: "30 Mins Daily",
    timingSlot: "9:30 – 10:00 PM IST",
    timingIcon: "bedtime",
    badge: "BATCH 6 · SUSHII NIGHTS",
    batchSchedule: "Batch 6 · Daily 9:30 PM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbaKT0sNCQtBXCG914Q1xqI0ZEX1A9U4K4nvafTXroWHLO5wFb7XjYz5UZyvyIDiZsmupXuCISTZqp3TrS3a4jPXwGVETNqkjQFWu8qcvGJONOCoqwAuA5yKatfyEeo_yf-A5DlsYwCHl1Ctry7uXEuI__lku9QLSkPuhAVHN3MrmAKU1nm7v_UJspEUd24msZ9TyGIA-XReVaVeQJy7J7CIP6PZFhI1frD8pUdecxjhbAg0grQ3T3",
    features: [
      "Bedtime hip openers",
      "Nadi Shodhana Pranayama",
      "Guided Yoga Nidra",
      "Insomnia recovery",
    ],
    spotsLeft: 8,
    order: 6,
    isActive: true,
  },
  {
    slug: "combo-pass",
    title: "All-Access Combo Pass",
    titleKn: "ಸಂಪೂರ್ಣ ಆರೋಗ್ಯ ಕಾಂಬೋ ಪಾಸ್",
    section: "yoga",
    sectionLabel: "Yoga",
    sectionLabelKn: "ಯೋಗ",
    category: "combo",
    categoryLabel: "All Access",
    description: "Ultimate daily wellness system. Get Zoom links to all our classes. Join active Ashtanga/Strength in the morning and wind down with Sushii Nights before sleeping. Save ₹300/month.",
    descriptionKn: "ಸಂಪೂರ್ಣ ದೈನಂದಿನ ಆರೋಗ್ಯ ವ್ಯವಸ್ಥೆ. ನಮ್ಮ ಎಲ್ಲಾ ಲೈವ್ ತರಗತಿಗಳ ಜೂಮ್ ಲಿಂಕ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ. ಮುಂಜಾನೆ ಅಷ್ಟಾಂಗ/ಶಕ್ತಿ ತರಬೇತಿ ಮತ್ತು ಮಲಗುವ ಮುನ್ನ ಸುಶಿ ನೈಟ್ಸ್ ಅಭ್ಯಾಸ ಮಾಡಿ.",
    price: 599,
    originalPrice: 899,
    duration: "All Daily Batches",
    timingSlot: "All Daily Batches Access",
    timingIcon: "all_inclusive",
    badge: "ALL-ACCESS PASS",
    batchSchedule: "All 6 Daily Batches",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeW6X-Xbnzzibn5vBblDaMOKZ9I5pN1IM06R4zDRuOdkD-9Wo6S3m7m_J0dK0qdWJGyueyVkmQmwzk5BxGQIVpWVDXZhXVm80sJovk1mFz71N5ZhVHUenH4R4_9Bk3eTDTvbBT952IM8xLqwXcNFPzE8Fzq9jksT6GmEJpllQ1Vja4PrcRzI8jJaqJDwQsP41wdO6-Hd03gbX80NkyitBR2PCUNesuc1Hu0ObZ1sat3JWb4IooqiCC",
    features: [
      "All 6 Daily Batches Included",
      "24-Hour Zoom Class Recordings",
      "Private Community Access",
      "Direct Q&A with Sushii",
    ],
    spotsLeft: 12,
    order: 7,
    isActive: true,
  },
];

const SEED_PRODUCTS = [
  {
    slug: "cotton-mat",
    title: "Mysuru Heritage Handloom Cotton & Jute Yoga Mat",
    titleKn: "ಮೈಸೂರು ಸಾಂಪ್ರದಾಯಿಕ ಹತ್ತಿ ಮತ್ತು ಸೆಣಬಿನ ಯೋಗ ಚಾಪೆ",
    subtitle: "Eco-friendly handwoven mat with natural anti-slip ribbed weave",
    subtitleKn: "ನೈಸರ್ಗಿಕ ಸಾವಯವ ಹತ್ತಿ ಹಾಗೂ ಸೆಣಬಿನ ಕೈಮಗ್ಗದ ಪರಿಸರಸ್ನೇಹಿ ಚಾಪೆ",
    category: "mats",
    badge: "Bestseller Studio Mat",
    badgeKn: "ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಚಾಪೆ",
    badgeColor: "bg-[#1C3325]",
    image: "/src/assets/mysuru_organic_cotton_mat.jpg",
    price: 1499,
    originalPrice: 2299,
    inStock: true,
    rating: 4.9,
    reviewCount: 142,
    leadTime: "Dispatched within 24 hours · Free Shipping",
    leadTimeKn: "೨೪ ಗಂಟೆಗಳಲ್ಲಿ ರವಾನೆ · ಉಚಿತ ಡೆಲಿವರಿ",
    features: [
      "100% GOTS certified organic handloom cotton & Mysore jute",
      "Breathable sweat-absorbing texture perfect for hot & humid Mysore mornings",
      "Natural rubberized grip backing preventing unwanted bunching or skidding",
      "Free high-tensile cotton studio travel carry-sling included",
    ],
  },
  {
    slug: "progrip-mat",
    title: "SHASH Pro-Grip Asana Alignment Eco-Rubber Mat",
    titleKn: "ಶಶ್ ಪ್ರೋ-ಗ್ರಿಪ್ ಆಸನ ಜೋಡಣೆ ಪರಿಸರ ರಬ್ಬರ್ ಚಾಪೆ",
    subtitle: "Laser-etched anatomical Mysore alignment grid with instant dry grip",
    subtitleKn: "ಲೇಸರ್ ಮುದ್ರಿತ ಆಸನ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಜಾರದ ಹಿಡಿತ",
    category: "mats",
    badge: "Master Ashtanga Series",
    badgeKn: "ಅಷ್ಟಾಂಗ ವಿಶೇಷ",
    badgeColor: "bg-[#0E6848]",
    image: "/src/assets/progrip_rubber_yoga_mat.jpg",
    price: 2199,
    originalPrice: 3199,
    inStock: true,
    rating: 4.95,
    reviewCount: 98,
    leadTime: "Dispatched within 24 hours · Free Shipping",
    leadTimeKn: "೨೪ ಗಂಟೆಗಳಲ್ಲಿ ರವಾನೆ · ಉಚಿತ ಡೆಲಿವರಿ",
    features: [
      "Engineered natural tree-rubber base with polyurethane top layer",
      "Laser-etched Mysore Tristhana alignment lines for precision hand & foot placement",
      "Zero-slip dry & wet traction even during vigorous Surya Namaskara flows",
      "5mm ultra-dense joint protection cushion for sensitive knees and spine",
    ],
  },
  {
    slug: "cork-props-kit",
    title: "Mysuru Natural Cork Yoga Blocks & Alignment Strap Duo",
    titleKn: "ಮೈಸೂರು ನೈಸರ್ಗಿಕ ಕಾರ್ಕ್ ಬ್ಲಾಕ್‌ಗಳು ಮತ್ತು ಸ್ಟ್ರ್ಯಾಪ್ ಸೆಟ್",
    subtitle: "High-density antimicrobial cork duo with 8-foot organic cotton strap",
    subtitleKn: "ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಕಾರ್ಕ್ ಬ್ಲಾಕ್‌ಗಳು ಮತ್ತು ಹತ್ತಿ ಬೆಲ್ಟ್",
    category: "props",
    badge: "Essential Alignment Kit",
    badgeKn: "ಅಗತ್ಯ ಪರಿಕರಗಳ ಕಿಟ್",
    badgeColor: "bg-[#C26D38]",
    image: "/src/assets/cork_yoga_blocks_strap_set.jpg",
    price: 899,
    originalPrice: 1499,
    inStock: true,
    rating: 4.88,
    reviewCount: 76,
    leadTime: "Dispatched within 24 hours · Free Shipping",
    leadTimeKn: "೨೪ ಗಂಟೆಗಳಲ್ಲಿ ರವಾನೆ · ಉಚಿತ ಡೆಲಿವರಿ",
    features: [
      "Two high-density bevelled oak cork blocks for restorative grounding support",
      "Solid, non-spongy stability providing confidence in balancing postures",
      "8-foot heavy-duty unbleached cotton strap with reinforced metal D-rings",
      "Naturally moisture-resistant, antimicrobial and easily wiped clean",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  2. SEED FUNCTION
// ─────────────────────────────────────────────────────────────

async function seedDatabase(options = { cleanTransactional: true }) {
  console.log("🌱 Starting SHASH Studios Master Database Seeding...");

  // Connect to MongoDB
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB:", env.MONGODB_URI.replace(/:[^:]*@/, ":****@"));
  }

  // 1. Clear Transactional Data (Always clean so you start fresh!)
  if (options.cleanTransactional) {
    console.log("🧹 Clearing transactional tables (Registrations, Orders, Inquiries)...");
    await Registration.deleteMany({});
    await ProductOrder.deleteMany({});
    await Inquiry.deleteMany({});
    console.log("✅ Transactional data cleared: 0 registrations, 0 orders, 0 inquiries.");
  }

  // 2. Seed Admin
  console.log("👤 Seeding Administrator...");
  await Admin.deleteMany({});
  const admin = await Admin.create(SEED_ADMIN);
  console.log(`✅ Superadmin created: ${admin.email} (Password: admin123)`);

  // 3. Seed Sections
  console.log("📂 Seeding Curriculum Sections...");
  await Section.deleteMany({});
  const createdSections = await Section.insertMany(SEED_SECTIONS);
  console.log(`✅ Seeded ${createdSections.length} sections.`);

  // 4. Seed Workshops
  console.log("🧘 Seeding Workshops...");
  await Workshop.deleteMany({});
  const createdWorkshops = await Workshop.insertMany(SEED_WORKSHOPS);
  console.log(`✅ Seeded ${createdWorkshops.length} workshops.`);

  // Workshop mapping for Batches
  const workshopMap = {};
  createdWorkshops.forEach((w) => {
    workshopMap[w.slug] = w;
  });

  // 5. Seed Real Batches (Linked to Workshops)
  console.log("📅 Seeding Batches for all Workshops...");
  await Batch.deleteMany({});

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const BATCH_DEFINITIONS = [
    {
      workshopSlug: "21day",
      batchCode: "SHASH-2026-AUG-21DAY-DAWN",
      title: "August Morning Dawn Batch",
      titleKn: "ಆಗಸ್ಟ್ ಮುಂಜಾನೆ ಉಷಃಕಾಲ ಬ್ಯಾಚ್",
      section: "yoga",
      slotTime: "5:30 AM – 6:30 AM IST",
      capacity: 25,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-1",
    },
    {
      workshopSlug: "21day",
      batchCode: "SHASH-2026-AUG-21DAY-SURYA",
      title: "August Morning Surya Flow",
      titleKn: "ಆಗಸ್ಟ್ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಬ್ಯಾಚ್",
      section: "yoga",
      slotTime: "6:30 AM – 7:30 AM IST",
      capacity: 25,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-2",
    },
    {
      workshopSlug: "ladies-yoga",
      batchCode: "SHASH-2026-AUG-LADIES-NOON",
      title: "Ladies Hormonal Balance Midday",
      titleKn: "ಮಹಿಳೆಯರ ಮಧ್ಯಾಹ್ನದ ಯೋಗ ಬ್ಯಾಚ್",
      section: "yoga",
      slotTime: "11:30 AM – 12:30 PM IST",
      capacity: 20,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-3",
    },
    {
      workshopSlug: "strength-training",
      batchCode: "SHASH-2026-AUG-STR-EVE",
      title: "Evening Calisthenics & Stamina",
      titleKn: "ಸಂಜೆಯ ಶಕ್ತಿ ತರಬೇತಿ ಮತ್ತು ಸ್ಟ್ಯಾಮಿನಾ",
      section: "other",
      slotTime: "6:30 PM – 7:30 PM IST",
      capacity: 20,
      instructorName: "Sushii & Team",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-4",
    },
    {
      workshopSlug: "kids-yoga",
      batchCode: "SHASH-2026-AUG-KIDS-DAWN",
      title: "Kids Mindful Morning Routine",
      titleKn: "ಮಕ್ಕಳ ಮುಂಜಾನೆ ಏಕಾಗ್ರತೆ ತರಗತಿ",
      section: "other",
      slotTime: "5:30 AM – 6:30 AM IST",
      capacity: 15,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-5",
    },
    {
      workshopSlug: "ashtanga-yoga",
      batchCode: "SHASH-2026-AUG-ASHTANGA-DAWN",
      title: "Mysore Ashtanga Primary Series",
      titleKn: "ಮೈಸೂರು ಅಷ್ಟಾಂಗ ಪ್ರೈಮರಿ ಸೀರೀಸ್",
      section: "yoga",
      slotTime: "5:30 AM – 6:30 AM IST",
      capacity: 20,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-6",
    },
    {
      workshopSlug: "sushii-nights",
      batchCode: "SHASH-2026-AUG-NIGHTS-BED",
      title: "Sushii Nights Bedtime Yoga Nidra",
      titleKn: "ಸುಶಿ ನೈಟ್ಸ್ ನಿದ್ರಾ ಧ್ಯಾನ",
      section: "music",
      slotTime: "9:30 PM – 10:00 PM IST",
      capacity: 50,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-7",
    },
    {
      workshopSlug: "combo-pass",
      batchCode: "SHASH-2026-AUG-COMBO-ALL",
      title: "All-Access Mysore Sanctuary Pass",
      titleKn: "ಸಂಪೂರ್ಣ ಪ್ರವೇಶ ಮೈಸೂರು ಕಾಂಬೋ ಪಾಸ್",
      section: "yoga",
      slotTime: "All Daily Batches Access",
      capacity: 100,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-all",
    },
  ];

  const batchesToInsert = BATCH_DEFINITIONS.map((b) => {
    const parentWorkshop = workshopMap[b.workshopSlug];
    return {
      workshopId: parentWorkshop ? parentWorkshop._id : new mongoose.Types.ObjectId(),
      batchCode: b.batchCode,
      title: b.title,
      titleKn: b.titleKn,
      section: b.section,
      slotTime: b.slotTime,
      startDate: nextMonth,
      endDate: nextMonthEnd,
      capacity: b.capacity,
      enrolledCount: 0,
      zoomLink: b.zoomLink,
      instructorName: b.instructorName,
      status: "upcoming",
    };
  });

  const createdBatches = await Batch.insertMany(batchesToInsert);
  console.log(`✅ Seeded ${createdBatches.length} active batches linked to workshops.`);

  // 6. Seed Products
  console.log("🛍️ Seeding Studio Store Products...");
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(SEED_PRODUCTS);
  console.log(`✅ Seeded ${createdProducts.length} store products.`);

  console.log("\n=========================================================");
  console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("Master / Catalog Data:");
  console.log(`  - Admins      : 1 (admin@shashstudios.com / admin123)`);
  console.log(`  - Sections    : ${createdSections.length}`);
  console.log(`  - Workshops   : ${createdWorkshops.length}`);
  console.log(`  - Batches     : ${createdBatches.length}`);
  console.log(`  - Products    : ${createdProducts.length}`);
  console.log("Transactional Data (Fresh & Empty):");
  console.log(`  - Bookings/Registrations : 0`);
  console.log(`  - Product Orders         : 0`);
  console.log(`  - Inquiries              : 0`);
  console.log("=========================================================\n");
}

// Auto-run if executed directly via CLI: node seedDatabase.js
if (require.main === module) {
  seedDatabase()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seeding Error:", err);
      mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = seedDatabase;
