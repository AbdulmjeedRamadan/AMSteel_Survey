import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import QuestionTypeSelector from '@/components/survey/QuestionTypeSelector'
import QuestionEditor from '@/components/survey/QuestionEditor'
import SurveySettings from '@/components/survey/SurveySettings'
import { useTranslation } from '@/hooks/useTranslation'
import {
  Plus,
  Save,
  Eye,
  Settings,
  Trash2,
  GripVertical,
  FileText,
  Users,
  Clock,
  Shield,
  BarChart3,
  Play,
  Pause,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Copy,
  Move
} from 'lucide-react'
import { Question } from '@/types'

export default function SurveyBuilder() {
  const { t } = useTranslation()

  const [survey, setSurvey] = useState({
    id: '1',
    title: t('surveys.newSurvey'),
    description: '',
    type: 'internal',
    status: 'draft',
    unique_slug: 'new-survey',
    welcome_message: '',
    thank_you_message: '',
    duration_type: 'unlimited',
    start_date: null,
    end_date: null,
    max_responses: null,
    is_anonymous: false,
    allow_multiple: false,
    allow_editing: false,
    requires_auth: false,
    show_progress_bar: true,
    redirect_url: '',
    track_ip: false,
    track_location: false,
    questions: []
  })
  
  const [activeTab, setActiveTab] = useState('questions')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [selectedQuestionType, setSelectedQuestionType] = useState('')
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  const generateQuestionId = () => {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const hasValidQuestions = () => {
    return survey.questions.some(question => {
      // Check if question has text
      if (!question.question_text?.trim()) return false
      
      // Check if choice questions have at least 2 options
      if (['single_choice', 'multiple_choice', 'dropdown'].includes(question.question_type)) {
        const choices = question.options?.choices || []
        const validChoices = choices.filter(choice => choice?.trim())
        return validChoices.length >= 2
      }
      
      return true
    })
  }

  const validateAllQuestions = () => {
    const errors: Array<{questionIndex: number, questionText: string, errors: string[]}> = []

    survey.questions.forEach((question, index) => {
      const questionErrors: string[] = []

      // Check question text
      if (!question.question_text?.trim()) {
        questionErrors.push(t('surveys.questionTextRequired'))
      }

      // Check choice questions
      if (['single_choice', 'multiple_choice', 'dropdown'].includes(question.question_type)) {
        const choices = question.options?.choices || []
        const validChoices = choices.filter(choice => choice?.trim())
        if (validChoices.length < 2) {
          questionErrors.push(t('surveys.atLeastTwoChoices'))
        }
      }

      // Check rating questions
      if (question.question_type === 'rating') {
        if (!question.options?.max || question.options.max < 2) {
          questionErrors.push(t('surveys.atLeastTwoChoices'))
        }
      }

      if (questionErrors.length > 0) {
        errors.push({
          questionIndex: index + 1,
          questionText: question.question_text || t('surveys.question'),
          errors: questionErrors
        })
      }
    })

    return errors
  }

  const handleAddQuestion = (type: string) => {
    const newQuestion: Question = {
      id: generateQuestionId(),
      survey_id: survey.id,
      question_text: '',
      question_type: type as any,
      description: '',
      is_required: false,
      order_index: survey.questions.length + 1,
      options: {
        choices: type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown' 
          ? ['خيار 1', 'خيار 2'] 
          : undefined,
        max: type === 'rating' ? 5 : undefined,
        min: type === 'rating' ? 1 : undefined,
        labels: type === 'rating' ? ['سيء جداً', 'ممتاز'] : undefined
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
    setIsAddingQuestion(false)
    setSelectedQuestionType('')
    // Automatically activate the new question for editing
    setActiveQuestionId(newQuestion.id)
  }

  const handleUpdateQuestion = (questionId: string, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }))
    
    // Reset validation errors when user starts fixing questions
    if (showValidationErrors) {
      setShowValidationErrors(false)
    }
  }

  const handleDeleteQuestion = (questionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
  }

  const handleDuplicateQuestion = (questionId: string) => {
    const question = survey.questions.find(q => q.id === questionId)
    if (question) {
      const duplicatedQuestion: Question = {
        ...question,
        id: generateQuestionId(),
        question_text: `${question.question_text} (نسخة)`,
        order_index: survey.questions.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setSurvey(prev => ({
        ...prev,
        questions: [...prev.questions, duplicatedQuestion]
      }))
    }
  }

  const handleMoveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const questionIndex = survey.questions.findIndex(q => q.id === questionId)
    if (questionIndex === -1) return

    const newIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1
    if (newIndex < 0 || newIndex >= survey.questions.length) return

    const newQuestions = [...survey.questions]
    const [movedQuestion] = newQuestions.splice(questionIndex, 1)
    newQuestions.splice(newIndex, 0, movedQuestion)

    // Update order indices
    newQuestions.forEach((q, index) => {
      q.order_index = index + 1
    })

    setSurvey(prev => ({
      ...prev,
      questions: newQuestions
    }))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(survey.questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order indexes
    items.forEach((q, index) => {
      q.order_index = index + 1
    })

    setSurvey(prev => ({
      ...prev,
      questions: items
    }))
  }

  const handleSave = () => {
    // Check if there are valid questions
    if (!hasValidQuestions()) {
      alert(`${t('surveys.needOneValidQuestion')} ${t('surveys.beforeSave')}`)
      return
    }

    // Validate client name for external surveys before saving
    if (survey.type === 'external' && !survey.client_name?.trim()) {
      alert(t('surveys.clientNameRequired'))
      return
    }

    console.log('Saving survey as draft:', survey)
    // Set status to draft when saving
    setSurvey(prev => ({ ...prev, status: 'draft' }))
    // In real app, this would save to backend
    alert(t('surveys.savedAsDraft'))
  }

  const handlePreview = () => {
    // Check if there are valid questions
    if (!hasValidQuestions()) {
      alert(`${t('surveys.needOneValidQuestion')} ${t('surveys.beforePreview')}`)
      return
    }

    console.log('Previewing survey:', survey)
    // Create preview URL with survey data
    const previewData = encodeURIComponent(JSON.stringify(survey))
    window.open(`/survey/preview?data=${previewData}`, '_blank')
  }

  const handlePublish = () => {
    // Check basic survey info
    if (!survey.title.trim()) {
      alert(t('surveys.surveyTitleRequired'))
      return
    }

    // Validate client name for external surveys
    if (survey.type === 'external' && !survey.client_name?.trim()) {
      alert(t('surveys.clientNameRequired'))
      return
    }

    // Check if there are any questions
    if (survey.questions.length === 0) {
      alert(`${t('surveys.needOneValidQuestion')} ${t('surveys.beforePublish')}`)
      return
    }

    // Validate all questions
    const validationErrors = validateAllQuestions()
    if (validationErrors.length > 0) {
      // Show validation errors in UI
      setShowValidationErrors(true)

      let errorMessage = `${t('surveys.pleaseFixErrors')}:\n\n`
      validationErrors.forEach(error => {
        errorMessage += `${t('surveys.question')} ${error.questionIndex}: ${error.questionText}\n`
        error.errors.forEach(err => {
          errorMessage += `  • ${err}\n`
        })
        errorMessage += '\n'
      })
      errorMessage += t('surveys.fixErrorsBeforePublish')

      alert(errorMessage)
      return
    }

    console.log('Publishing survey:', survey)
    setSurvey(prev => ({ ...prev, status: 'active' }))
    alert(t('surveys.publishedSuccessfully'))
  }

  const handleSurveyUpdate = (updates: any) => {
    setSurvey(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('surveys.surveyBuilder')}</h1>
          <p className="text-muted-foreground">
            {t('surveys.addEditQuestions')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={survey.status === 'draft' ? 'secondary' : 'default'}>
            {survey.status === 'draft' ? t('surveys.draft') : t('surveys.active')}
          </Badge>
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!hasValidQuestions()}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('surveys.preview')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasValidQuestions()}
          >
            <Save className="h-4 w-4 mr-2" />
            {t('common.save')}
          </Button>
          {survey.status === 'draft' && (
            <Button
              onClick={handlePublish}
              className="bg-green-600 hover:bg-green-700"
              disabled={!hasValidQuestions()}
            >
              <Play className="h-4 w-4 mr-2" />
              {t('surveys.publish')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">{t('surveys.questions')}</TabsTrigger>
          <TabsTrigger value="settings">{t('surveys.settings')}</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          {/* Survey Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('surveys.basicInfo')}</CardTitle>
              <CardDescription>
                {t('surveys.enterSurveyDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('surveys.surveyTitle')} *</Label>
                  <Input
                    id="title"
                    value={survey.title}
                    onChange={(e) => handleSurveyUpdate({ title: e.target.value })}
                    placeholder={t('surveys.enterSurveyTitle')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('surveys.surveyType')}</Label>
                  <Select
                    value={survey.type}
                    onValueChange={(value) => handleSurveyUpdate({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">{t('surveys.internalEmployees')}</SelectItem>
                      <SelectItem value="external">{t('surveys.externalClients')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('surveys.surveyDescription')}</Label>
                <Textarea
                  id="description"
                  value={survey.description}
                  onChange={(e) => handleSurveyUpdate({ description: e.target.value })}
                  placeholder={t('surveys.enterSurveyDescription')}
                  rows={3}
                />
              </div>
              {survey.type === 'external' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">{t('surveys.clientName')} *</Label>
                    <Input
                      id="client_name"
                      value={survey.client_name || ''}
                      onChange={(e) => handleSurveyUpdate({ client_name: e.target.value })}
                      placeholder={t('surveys.enterClientName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_company">{t('surveys.clientCompany')}</Label>
                    <Input
                      id="client_company"
                      value={survey.client_company || ''}
                      onChange={(e) => handleSurveyUpdate({ client_company: e.target.value })}
                      placeholder={t('surveys.enterCompanyName')}
                    />
                  </div>
                </div>
              )}
              
              {/* Duration Settings */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">{t('surveys.durationSettings')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_type">{t('surveys.durationType')}</Label>
                    <Select 
                      value={survey.duration_type} 
                      onValueChange={(value) => handleSurveyUpdate({ duration_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unlimited">{t('surveys.unlimited')}</SelectItem>
                        <SelectItem value="limited">{t('surveys.limited')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {survey.duration_type === 'limited' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="start_date">{t('surveys.startDate')}</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={survey.start_date || ''}
                          onChange={(e) => handleSurveyUpdate({ start_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">{t('surveys.endDate')}</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={survey.end_date || ''}
                          onChange={(e) => handleSurveyUpdate({ end_date: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('surveys.manageQuestions')}</CardTitle>
                  <CardDescription>
                    {t('surveys.addEditQuestions')}
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingQuestion(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('surveys.addQuestion')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Question Type Selector */}
              {isAddingQuestion && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{t('surveys.selectQuestionType')}</h3>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingQuestion(false)
                        setSelectedQuestionType('')
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                  <QuestionTypeSelector
                    onSelect={(type) => {
                      handleAddQuestion(type)
                      setIsAddingQuestion(false)
                    }}
                  />
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {survey.questions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('surveys.noQuestionsAdded')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('surveys.startAddingQuestion')}
                    </p>
                    <Button onClick={() => setIsAddingQuestion(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('surveys.addQuestion')}
                    </Button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="questions">
                      {(provided, snapshot) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                          className={`min-h-[100px] transition-colors duration-200 ${
                            snapshot.isDraggingOver 
                              ? 'bg-primary/5 border-2 border-dashed border-primary rounded-lg' 
                              : ''
                          }`}
                        >
                          {survey.questions.map((question, index) => (
                            <Draggable key={question.id} draggableId={question.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`mb-4 transition-all duration-200 ${
                                    snapshot.isDragging 
                                      ? 'opacity-75 rotate-2 scale-105 shadow-lg z-50' 
                                      : ''
                                  }`}
                                >
                                  <QuestionEditor
                                    question={question}
                                    onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
                                    onDelete={() => handleDeleteQuestion(question.id)}
                                    onDuplicate={() => handleDuplicateQuestion(question.id)}
                                    onMove={(direction) => handleMoveQuestion(question.id, direction)}
                                    canMoveUp={index > 0}
                                    canMoveDown={index < survey.questions.length - 1}
                                    dragHandleProps={provided.dragHandleProps}
                                    isActive={activeQuestionId === question.id}
                                    onActivate={() => setActiveQuestionId(question.id)}
                                    onDeactivate={() => setActiveQuestionId(null)}
                                    showValidationErrors={showValidationErrors}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <SurveySettings
            survey={survey}
            onUpdate={handleSurveyUpdate}
            onSave={handleSave}
            onPreview={handlePreview}
            onPublish={handlePublish}
            hasValidQuestions={hasValidQuestions()}
          />
        </TabsContent>


      </Tabs>
    </div>
  )
}