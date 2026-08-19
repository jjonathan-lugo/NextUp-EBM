import styles from './Button.module.css'

// variant: 'primary' (default) | 'ghost' | 'success' | 'danger' — lets
// callers give an action its actual meaning (Mark done vs. Delete vs.
// Edit) instead of every button being the same blue regardless of what
// it does. See Button.module.css for what each variant looks like.
export default function Button({ variant = 'primary', className, ...props }) {
  const variantClass = variant === 'primary' ? '' : ` ${styles[variant] || ''}`
  return <button type="button" className={`${styles.btn}${variantClass}${className ? ` ${className}` : ''}`} {...props} />
}
