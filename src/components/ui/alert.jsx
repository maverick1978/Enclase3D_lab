import * as React from "react"

const Alert = React.forwardRef(({
  variant = "default",
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${
      variant === "destructive" 
        ? "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500"
        : "text-gray-900"
    } ${className}`}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }