import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  Settings, 
  Eye,
  Copy,
  Move,
  AlertCircle,
  CheckCircle,
  Star,
  BarChart3,
  List,
  Type,
  Calendar,
  Mail,
  Phone,
  Hash,
  Link,
  FileText,
  ToggleLeft,
  Sliders,
  DollarSign,
  Image,
  Grid3X3,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react'
import { Question, QuestionType } from '@/types'

interface QuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
  onDuplicate: () => void
  onMove: (direction: 'up' | 'down') => void
  canMoveUp: boolean
  canMoveDown: boolean
  isPreview?: boolean
  dragHandleProps?: any
  isActive?: boolean
  onActivate?: () => void
  onDeactivate?: () => void
  showValidationErrors?: boolean
}

const questionTypeIcons = {
  text: <Type className="h-4 w-4" />,
  textarea: <FileText className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  url: <Link className="h-4 w-4" />,
  single_choice: <List className="h-4 w-4" />,
  multiple_choice: <List className="h-4 w-4" />,
  dropdown: <List className="h-4 w-4" />,
  yes_no: <ToggleLeft className="h-4 w-4" />,
  rating: <Star className="h-4 w-4" />,
  rating_scale: <BarChart3 className="h-4 w-4" />,
  nps: <TrendingUp className="h-4 w-4" />,
  slider: <Sliders className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  time: <Calendar className="h-4 w-4" />,
  datetime: <Calendar className="h-4 w-4" />,
  matrix: <Grid3X3 className="h-4 w-4" />,
  ranking: <Target className="h-4 w-4" />,
  file_upload: <Image className="h-4 w-4" />,
  currency: <DollarSign className="h-4 w-4" />,
  signature: <Zap className="h-4 w-4" />,
}

export default function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  canMoveUp,
  canMoveDown,
  isPreview = false,
  dragHandleProps,
  isActive = false,
  onActivate,
  onDeactivate,
  showValidationErrors = false
}: QuestionEditorProps) {
  // Use isActive prop instead of local isExpanded state
  const [localQuestion, setLocalQuestion] = useState(question)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setLocalQuestion(question)
  }, [question])

  const validateQuestion = (q: Question) => {
    const errors: Record<string, string> = {}
    
    // Check question text
    if (!q.question_text?.trim()) {
      errors.question_text = 'نص السؤال مطلوب'
    }
    
    // Check choice questions
    if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.question_type)) {
      const choices = q.options?.choices || []
      const validChoices = choices.filter(choice => choice?.trim())
      if (validChoices.length < 2) {
        errors.choices = 'يجب إضافة خيارين على الأقل'
      }
    }
    
    // Check rating questions
    if (q.question_type === 'rating') {
      if (!q.options?.max || q.options.max < 2) {
        errors.rating = 'يجب أن يكون المقياس 2 على الأقل'
      }
    }
    
    return errors
  }

  useEffect(() => {
    const errors = validateQuestion(localQuestion)
    setValidationErrors(errors)
  }, [localQuestion])

  const handleUpdate = (updates: Partial<Question>) => {
    const updated = { ...localQuestion, ...updates }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const handleAddChoice = () => {
    const choices = localQuestion.options?.choices || []
    const newChoices = [...choices, `خيار ${choices.length + 1}`]
    handleUpdate({
      options: { ...localQuestion.options, choices: newChoices }
    })
  }

  const handleUpdateChoice = (index: number, value: string) => {
    const choices = localQuestion.options?.choices || []
    const newChoices = [...choices]
    newChoices[index] = value
    handleUpdate({
      options: { ...localQuestion.options, choices: newChoices }
    })
  }

  const handleRemoveChoice = (index: number) => {
    const choices = localQuestion.options?.choices || []
    const newChoices = choices.filter((_, i) => i !== index)
    handleUpdate({
      options: { ...localQuestion.options, choices: newChoices }
    })
  }

  const renderQuestionPreview = () => {
    const { question_type, question_text, is_required, options } = localQuestion

    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {question_text || 'نص السؤال'}
            {is_required && <span className="text-red-500 mr-1">*</span>}
          </span>
        </div>

        {/* Question Type Specific Preview */}
        {question_type === 'text' && (
          <Input placeholder="اكتب إجابتك هنا..." disabled />
        )}

        {question_type === 'textarea' && (
          <Textarea placeholder="اكتب إجابتك هنا..." rows={3} disabled />
        )}

        {question_type === 'single_choice' && (
          <div className="space-y-2">
            {options?.choices?.map((choice, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="radio" disabled className="h-4 w-4" />
                <span className="text-sm">{choice}</span>
              </label>
            ))}
          </div>
        )}

        {question_type === 'multiple_choice' && (
          <div className="space-y-2">
            {options?.choices?.map((choice, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="h-4 w-4" />
                <span className="text-sm">{choice}</span>
              </label>
            ))}
          </div>
        )}

        {question_type === 'rating' && (
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} disabled className="w-8 h-8 text-muted-foreground">
                <Star className="h-6 w-6" />
              </button>
            ))}
          </div>
        )}

        {question_type === 'yes_no' && (
          <div className="flex justify-center space-x-8">
            <label className="flex items-center space-x-2">
              <input type="radio" disabled className="h-4 w-4" />
              <span>نعم</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" disabled className="h-4 w-4" />
              <span>لا</span>
            </label>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={`group hover:shadow-md transition-all duration-200 ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader 
        className="pb-3 cursor-pointer" 
        onClick={() => isActive ? onDeactivate?.() : onActivate?.()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div 
                {...dragHandleProps} 
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
                title="اسحب لإعادة ترتيب السؤال"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-muted-foreground">
                {question.order_index}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {questionTypeIcons[question.question_type as keyof typeof questionTypeIcons]}
              <span className="text-sm font-medium">
                {question.question_text || 'سؤال جديد'}
              </span>
              {question.is_required && (
                <Badge variant="destructive" className="text-xs">
                  مطلوب
                </Badge>
              )}
              {showValidationErrors && Object.keys(validationErrors).length > 0 && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  يحتاج مراجعة
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                isActive ? onDeactivate?.() : onActivate?.()
              }}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isActive && (
        <CardContent className="space-y-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text" className="flex items-center">
              نص السؤال
              <span className="text-red-500 mr-1">*</span>
            </Label>
            <Textarea
              id="question-text"
              value={localQuestion.question_text}
              onChange={(e) => handleUpdate({ question_text: e.target.value })}
              placeholder="أدخل نص السؤال..."
              rows={3}
              className={showValidationErrors && validationErrors.question_text ? 'border-red-500' : ''}
            />
            {showValidationErrors && validationErrors.question_text && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationErrors.question_text}
              </p>
            )}
          </div>

          {/* Question Description */}
          <div className="space-y-2">
            <Label htmlFor="question-description">وصف السؤال (اختياري)</Label>
            <Input
              id="question-description"
              value={localQuestion.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="وصف إضافي للسؤال..."
            />
          </div>

          {/* Question Type Specific Options */}
          {['single_choice', 'multiple_choice', 'dropdown'].includes(question.question_type) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  خيارات الإجابة
                  <span className="text-red-500 mr-1">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChoice}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة خيار
                </Button>
              </div>
              
              <div className="space-y-2">
                {localQuestion.options?.choices?.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={choice}
                      onChange={(e) => handleUpdateChoice(index, e.target.value)}
                      placeholder={`خيار ${index + 1}`}
                      className={showValidationErrors && validationErrors.choices && !choice?.trim() ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveChoice(index)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {showValidationErrors && validationErrors.choices && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.choices}
                </p>
              )}
            </div>
          )}

          {/* Rating Options */}
          {question.question_type === 'rating' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>عدد النجوم</Label>
                <Select
                  value={localQuestion.options?.max?.toString() || '5'}
                  onValueChange={(value) => handleUpdate({
                    options: { ...localQuestion.options, max: parseInt(value) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 نجوم</SelectItem>
                    <SelectItem value="5">5 نجوم</SelectItem>
                    <SelectItem value="10">10 نجوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نص التقييم</Label>
                <Input
                  value={localQuestion.options?.labels?.[0] || ''}
                  onChange={(e) => handleUpdate({
                    options: { 
                      ...localQuestion.options, 
                      labels: [e.target.value, localQuestion.options?.labels?.[1] || '']
                    }
                  })}
                  placeholder="مثال: سيء جداً"
                />
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={localQuestion.is_required}
              onCheckedChange={(checked) => handleUpdate({ is_required: checked as boolean })}
            />
            <Label htmlFor="required">سؤال مطلوب</Label>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>معاينة السؤال</Label>
            {renderQuestionPreview()}
          </div>
        </CardContent>
      )}

      {/* Move Buttons */}
      <div className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMove('up')}
            disabled={!canMoveUp}
          >
            <Move className="h-4 w-4 mr-1" />
            أعلى
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMove('down')}
            disabled={!canMoveDown}
          >
            <Move className="h-4 w-4 mr-1" />
            أسفل
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {question.is_required && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              مطلوب
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {question.question_type}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
