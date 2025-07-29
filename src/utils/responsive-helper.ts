import { useMediaQuery } from 'react-responsive'

export const useScreen = () => {
  const xs = useMediaQuery({ minWidth: 0 })
  const sm = useMediaQuery({ minWidth: 576 })
  const md = useMediaQuery({ minWidth: 768 })
  const lg = useMediaQuery({ minWidth: 992 })
  const xl = useMediaQuery({ minWidth: 1200 })
  const xxl = useMediaQuery({ minWidth: 1600 })

  const isMobile = useMediaQuery({ maxWidth: 575 })
  const isTablet = useMediaQuery({ minWidth: 576, maxWidth: 768 })
  const isDesktop = useMediaQuery({ minWidth: 992 })
  const isIpadPro = useMediaQuery({ minWidth: 992, orientation: 'portrait' })

  return {
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    isMobile,
    isTablet,
    isDesktop,
    isIpadPro,
  }
}
