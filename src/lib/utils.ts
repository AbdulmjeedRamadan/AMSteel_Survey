import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  // Use English numbers with Arabic month names
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/January/g, 'يناير')
    .replace(/February/g, 'فبراير')
    .replace(/March/g, 'مارس')
    .replace(/April/g, 'أبريل')
    .replace(/May/g, 'مايو')
    .replace(/June/g, 'يونيو')
    .replace(/July/g, 'يوليو')
    .replace(/August/g, 'أغسطس')
    .replace(/September/g, 'سبتمبر')
    .replace(/October/g, 'أكتوبر')
    .replace(/November/g, 'نوفمبر')
    .replace(/December/g, 'ديسمبر')
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  // Use English numbers
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'منذ لحظات'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `منذ ${minutes} دقيقة`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `منذ ${hours} ساعة`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `منذ ${days} يوم`
  } else {
    return formatDate(date)
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getSurveyStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100'
    case 'draft':
      return 'text-gray-600 bg-gray-100'
    case 'paused':
      return 'text-yellow-600 bg-yellow-100'
    case 'closed':
      return 'text-red-600 bg-red-100'
    case 'expired':
      return 'text-orange-600 bg-orange-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getSurveyStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'نشط'
    case 'draft':
      return 'مسودة'
    case 'paused':
      return 'متوقف'
    case 'closed':
      return 'مغلق'
    case 'expired':
      return 'منتهي الصلاحية'
    default:
      return 'غير محدد'
  }
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت'
  
  const k = 1024
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
