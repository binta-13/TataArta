import {
  Baby,
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  BusFront,
  Car,
  Cat,
  Cigarette,
  CircleDollarSign,
  Coffee,
  Dog,
  Droplet,
  Dumbbell,
  Film,
  FileText,
  Flower2,
  Footprints,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandHeart,
  HeartPulse,
  House,
  Key,
  Landmark,
  Laptop,
  Lightbulb,
  Music,
  Package,
  Palette,
  ParkingMeter,
  PawPrint,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  ReceiptText,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sofa,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Ticket,
  Trophy,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  coffee: Coffee,
  pizza: Pizza,
  car: Car,
  bus: Bus,
  'bus-front': BusFront,
  plane: Plane,
  fuel: Fuel,
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  shirt: Shirt,
  'gamepad-2': Gamepad2,
  film: Film,
  music: Music,
  ticket: Ticket,
  'receipt-text': ReceiptText,
  'file-text': FileText,
  zap: Zap,
  droplet: Droplet,
  wifi: Wifi,
  smartphone: Smartphone,
  laptop: Laptop,
  house: House,
  sofa: Sofa,
  wrench: Wrench,
  lightbulb: Lightbulb,
  pill: Pill,
  'heart-pulse': HeartPulse,
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  palette: Palette,
  sparkles: Sparkles,
  gift: Gift,
  'flower-2': Flower2,
  trophy: Trophy,
  star: Star,
  target: Target,
  key: Key,
  wallet: Wallet,
  banknote: Banknote,
  'piggy-bank': PiggyBank,
  landmark: Landmark,
  'hand-heart': HandHeart,
  'circle-dollar-sign': CircleDollarSign,
  'parking-meter': ParkingMeter,
  footprints: Footprints,
  baby: Baby,
  cat: Cat,
  dog: Dog,
  'paw-print': PawPrint,
  cigarette: Cigarette,
  briefcase: Briefcase,
  'building-2': Building2,
  package: Package,
};

export const DEFAULT_CATEGORY_ICON = 'package';

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export const EMOJI_TO_ICON: Record<string, string> = {
  '🍔': 'utensils',
  '🚗': 'car',
  '🛒': 'shopping-cart',
  '🎮': 'gamepad-2',
  '📄': 'receipt-text',
  '💊': 'pill',
  '🏠': 'house',
  '✈️': 'plane',
  '📚': 'book-open',
  '👕': 'shirt',
  '⚡': 'zap',
  '💰': 'banknote',
  '🎬': 'film',
  '☕': 'coffee',
  '🎵': 'music',
  '📦': 'package',
  '🏋️': 'dumbbell',
  '💻': 'laptop',
  '🍕': 'pizza',
  '🚌': 'bus',
  '🎨': 'palette',
  '🏥': 'heart-pulse',
  '🎓': 'graduation-cap',
  '🐕': 'dog',
  '🌟': 'sparkles',
  '🔧': 'wrench',
  '💡': 'lightbulb',
  '🎁': 'gift',
  '🌺': 'flower-2',
  '⚽': 'trophy',
  '🎯': 'target',
  '🔑': 'key',
};

export function isCategoryIconName(name?: string): boolean {
  return !!name && name in CATEGORY_ICONS;
}

export function resolveCategoryIcon(name?: string): LucideIcon {
  if (isCategoryIconName(name)) {
    return CATEGORY_ICONS[name as string];
  }
  return CATEGORY_ICONS[DEFAULT_CATEGORY_ICON];
}

export function normalizeCategoryIcon(icon?: string): string {
  if (isCategoryIconName(icon)) return icon as string;
  if (icon && icon in EMOJI_TO_ICON) return EMOJI_TO_ICON[icon];
  return DEFAULT_CATEGORY_ICON;
}

export function CategoryIcon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
}: {
  name?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Icon = resolveCategoryIcon(name);
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
