import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Type, 
  List, 
  CheckSquare, 
  Star, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  BarChart3,
  ToggleLeft,
  Link,
  Image
} from 'lucide-react'

interface QuestionType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'text' | 'choice' | 'rating' | 'input'
  isPopular?: boolean
  isNew?: boolean
}

const questionTypes: QuestionType[] = [
  // Text Questions
  {
    id: 'text',
    name: 'نص قصير',
    description: 'إجابة نصية قصيرة',
    icon: <Type className="h-5 w-5" />,
    category: 'text',
    isPopular: true
  },
  {
    id: 'textarea',
    name: 'نص طويل',
    description: 'إجابة نصية مفصلة',
    icon: <FileText className="h-5 w-5" />,
    category: 'text',
    isPopular: true
  },

  // Choice Questions
  {
    id: 'single_choice',
    name: 'اختيار واحد',
    description: 'اختيار خيار واحد من عدة خيارات',
    icon: <List className="h-5 w-5" />,
    category: 'choice',
    isPopular: true
  },
  {
    id: 'multiple_choice',
    name: 'اختيار متعدد',
    description: 'اختيار عدة خيارات',
    icon: <CheckSquare className="h-5 w-5" />,
    category: 'choice',
    isPopular: true
  },
  {
    id: 'dropdown',
    name: 'قائمة منسدلة',
    description: 'قائمة منسدلة للاختيار',
    icon: <List className="h-5 w-5" />,
    category: 'choice'
  },

  // Rating Questions
  {
    id: 'rating',
    name: 'تقييم بالنجوم',
    description: 'تقييم من 1 إلى 5 نجوم',
    icon: <Star className="h-5 w-5" />,
    category: 'rating',
    isPopular: true
  },
  {
    id: 'rating_scale',
    name: 'مقياس رقمي',
    description: 'تقييم على مقياس من 1 إلى 10',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'rating'
  },

  // Date & Time
  {
    id: 'date',
    name: 'تاريخ',
    description: 'اختيار تاريخ',
    icon: <Calendar className="h-5 w-5" />,
    category: 'input'
  },
  {
    id: 'datetime',
    name: 'تاريخ ووقت',
    description: 'اختيار تاريخ ووقت',
    icon: <Calendar className="h-5 w-5" />,
    category: 'input'
  },

  // Contact Questions
  {
    id: 'email',
    name: 'بريد إلكتروني',
    description: 'عنوان بريد إلكتروني',
    icon: <Mail className="h-5 w-5" />,
    category: 'input'
  },
  {
    id: 'phone',
    name: 'رقم هاتف',
    description: 'رقم الهاتف',
    icon: <Phone className="h-5 w-5" />,
    category: 'input'
  },
  {
    id: 'url',
    name: 'رابط موقع',
    description: 'رابط موقع إلكتروني',
    icon: <Link className="h-5 w-5" />,
    category: 'input'
  },

  // Special Types
  {
    id: 'yes_no',
    name: 'نعم/لا',
    description: 'سؤال بنعم أو لا',
    icon: <ToggleLeft className="h-5 w-5" />,
    category: 'choice'
  },
  {
    id: 'file_upload',
    name: 'رفع ملف',
    description: 'رفع ملف أو صورة',
    icon: <Image className="h-5 w-5" />,
    category: 'input'
  }
]

interface QuestionTypeSelectorProps {
  onSelect: (type: string) => void
  className?: string
}

export default function QuestionTypeSelector({ onSelect, className }: QuestionTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'الكل', count: questionTypes.length },
    { id: 'text', name: 'نص', count: questionTypes.filter(q => q.category === 'text').length },
    { id: 'choice', name: 'اختيار', count: questionTypes.filter(q => q.category === 'choice').length },
    { id: 'rating', name: 'تقييم', count: questionTypes.filter(q => q.category === 'rating').length },
    { id: 'input', name: 'إدخال', count: questionTypes.filter(q => q.category === 'input').length },
  ]

  const filteredTypes = selectedCategory === 'all' 
    ? questionTypes 
    : questionTypes.filter(q => q.category === selectedCategory)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center space-x-2"
          >
            <span>{category.name}</span>
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Question Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTypes.map((type) => (
          <Card
            key={type.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
            onClick={() => onSelect(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-sm">{type.name}</h3>
                    {type.isPopular && (
                      <Badge variant="default" className="text-xs">
                        شائع
                      </Badge>
                    )}
                    {type.isNew && (
                      <Badge variant="secondary" className="text-xs">
                        جديد
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            لا توجد أنواع أسئلة في هذه الفئة
          </div>
        </div>
      )}
    </div>
  )
}
