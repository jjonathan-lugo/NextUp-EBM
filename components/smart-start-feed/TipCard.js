// Owner: Grace
import styles from '../../styles/smart-start-feed.module.css'

export default function TipCard({ tip }) {
  return (
    <div className={styles.tipCard}>
      <h3>{tip.title}</h3>
      <p>{tip.body}</p>
    </div>
  );
}
