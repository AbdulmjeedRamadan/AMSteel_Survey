import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
  onClick?: () => void
}

export default function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = true,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer')}
    >
      <Card
        className={cn(
          'transition-shadow duration-300',
          hover && 'hover:shadow-lg',
          className
        )}
      >
        {children}
      </Card>
    </motion.div>
  )
}

export function AnimatedStatCard({
  children,
  className,
  delay = 0,
  index = 0,
}: AnimatedCardProps & { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: delay || index * 0.1,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <Card className={cn('transition-all duration-300 hover:shadow-lg', className)}>
        {children}
      </Card>
    </motion.div>
  )
}

export function AnimatedListItem({
  children,
  className,
  delay = 0,
  index = 0,
}: AnimatedCardProps & { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay || index * 0.05 }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
