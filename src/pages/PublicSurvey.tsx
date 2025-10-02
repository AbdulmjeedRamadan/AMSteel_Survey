import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  FileText,
  Star,
  Calendar
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'


// Mock survey data
const mockSurvey = {
  id: '1',
  title: 'استطلاع رضا العملاء - Q1 2024',
  description: 'نقدر وقتك في ملء هذا الاستطلاع. هدفنا هو تحسين خدماتنا بناءً على آرائك القيمة.',
  welcome_message: 'مرحباً بك في استطلاع رضا العملاء. سيستغرق هذا الاستطلاع حوالي 10 دقائق.',
  thank_you_message: 'شكراً لك على وقتك! آراؤك مهمة جداً لنا.',
  survey_type: 'external',
  client_name: 'شركة النخيل',
  status: 'active',
  total_responses: 45,
  completed_responses: 42,
  total_views: 67,
  created_at: '2024-01-15T10:30:00Z',
  end_date: '2024-02-15T23:59:59Z',
  estimated_time: '10 دقائق',
  show_progress_bar: true,
  has_password: false,
}

const mockQuestions = [
  {
    id: '1',
    question_text: 'ما هو تقييمك العام لخدماتنا؟',
    question_type: 'rating',
    is_required: true,
    order_index: 1,
    options: { min: 1, max: 5, labels: ['سيء جداً', 'ممتاز'] }
  },
  {
    id: '2',
    question_text: 'ما هي الخدمة التي استخدمتها مؤخراً؟',
    question_type: 'single_choice',
    is_required: true,
    order_index: 2,
    options: {
      choices: [
        'الخدمات التقنية',
        'الدعم الفني',
        'الاستشارات',
        'التدريب',
        'أخرى'
      ]
    }
  },
  {
    id: '3',
    question_text: 'ما هي نقاط القوة في خدماتنا؟ (يمكن اختيار أكثر من خيار)',
    question_type: 'multiple_choice',
    is_required: false,
    order_index: 3,
    options: {
      choices: [
        'سرعة الاستجابة',
        'جودة الخدمة',
        'الأسعار المناسبة',
        'الموظفين المهنيين',
        'سهولة الوصول',
        'الدعم المستمر'
      ]
    }
  },
  {
    id: '4',
    question_text: 'ما هي اقتراحاتك لتحسين خدماتنا؟',
    question_type: 'textarea',
    is_required: false,
    order_index: 4,
    options: {}
  },
  {
    id: '5',
    question_text: 'هل تنصح الآخرين بخدماتنا؟',
    question_type: 'yes_no',
    is_required: true,
    order_index: 5,
    options: {}
  }
]

export default function PublicSurvey() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [survey, setSurvey] = useState(mockSurvey)
  const [questions, setQuestions] = useState(mockQuestions)
  const [isPreview, setIsPreview] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    // Check if this is a preview
    const previewData = searchParams.get('data')
    if (previewData) {
      try {
        const surveyData = JSON.parse(decodeURIComponent(previewData))
        setSurvey(surveyData)
        setQuestions(surveyData.questions || [])
        setIsPreview(true)
      } catch (error) {
        console.error('Error parsing preview data:', error)
      }
    }
  }, [searchParams])


  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    // Validate required question
    if (currentQuestion.is_required) {
      const answer = answers[currentQuestion.id]
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        alert('هذا السؤال مطلوب، يرجى الإجابة عليه')
        return
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Submit survey
      console.log('Survey submitted with answers:', answers)
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleStart = () => {
    setIsStarted(true)
  }

  const renderQuestion = (question: any) => {
    const answer = answers[question.id] || ''

    switch (question.question_type) {
      case 'text':
        return (
          <Input
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="اكتب إجابتك هنا..."
          />
        )

      case 'textarea':
        return (
          <textarea
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            className="w-full p-3 border rounded-md"
            rows={4}
          />
        )

      case 'rating':
        return (
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                  answer === rating
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        )

      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options.choices.map((choice: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice}
                  checked={answer === choice}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="h-4 w-4"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options.choices.map((choice: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={Array.isArray(answer) && answer.includes(choice)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(answer) ? answer : []
                    if (checked) {
                      handleAnswerChange(question.id, [...currentAnswers, choice])
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter((a: string) => a !== choice))
                    }
                  }}
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        )

      case 'yes_no':
        return (
          <div className="flex justify-center space-x-8">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="yes"
                checked={answer === 'yes'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-lg">نعم</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="no"
                checked={answer === 'no'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-lg">لا</span>
            </label>
          </div>
        )

      default:
        return <div>نوع السؤال غير مدعوم</div>
    }
  }


  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">شكراً لك!</h2>
            <p className="text-muted-foreground mb-6">
              {survey.thank_you_message}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>تم حفظ إجاباتك بنجاح</p>
              <p>نقدر وقتك في ملء هذا الاستطلاع</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        {isPreview && (
          <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50">
            <span className="font-medium">🔍 وضع المعاينة - هذا ليس استطلاعاً حقيقياً</span>
          </div>
        )}
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <CardDescription className="text-base">
              {survey.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {survey.welcome_message && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{survey.welcome_message}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>الوقت المتوقع: {survey.estimated_time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>{questions.length} أسئلة</span>
              </div>
              {survey.end_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>ينتهي: {formatDate(survey.end_date)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{survey.completed_responses} ردود</span>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" onClick={handleStart}>
                بدء الاستطلاع
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50">
          <span className="font-medium">🔍 وضع المعاينة - هذا ليس استطلاعاً حقيقياً</span>
        </div>
      )}
      <div className="max-w-2xl mx-auto" style={{ marginTop: isPreview ? '3rem' : '0' }}>
        {/* No Questions Message for Preview */}
        {isPreview && questions.length === 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">لا توجد أسئلة بعد</h3>
              <p className="text-muted-foreground">
                قم بإضافة أسئلة في منشئ الاستطلاعات لرؤية المعاينة
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        {survey.show_progress_bar && questions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                السؤال {currentQuestionIndex + 1} من {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Question */}
        {questions.length > 0 && currentQuestion && (
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium mb-2">
                    {currentQuestion.question_text}
                    {currentQuestion.is_required && (
                      <span className="text-red-500 mr-1">*</span>
                    )}
                  </h2>
                  {currentQuestion.question_type === 'rating' && currentQuestion.options.labels && (
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{currentQuestion.options.labels[0]}</span>
                      <span>{currentQuestion.options.labels[1]}</span>
                    </div>
                  )}
                </div>

                <div className="min-h-[200px] flex items-center">
                  {renderQuestion(currentQuestion)}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            السابق
          </Button>

          <div className="flex items-center space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : index < currentQuestionIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={
              currentQuestion.is_required && 
              (!answers[currentQuestion.id] || 
               (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0))
            }
          >
            {currentQuestionIndex === questions.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                إرسال
              </>
            ) : (
              <>
                التالي
                <ArrowRight className="h-4 w-4 mr-2" />
              </>
            )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
