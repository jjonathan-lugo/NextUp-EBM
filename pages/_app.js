import '../global.css'
import AppHeader from '../components/shared/AppHeader'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <AppHeader />
      <Component {...pageProps} />
    </>
  )
}
