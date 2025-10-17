import styles from '@/styles/WelcomeMessage.module.css';

const WelcomeMessageComponent = ({ organisationWelcome }) => {

    return (
        <div>
            <p className={styles.greeting}>{organisationWelcome.greeting}</p>
            {/* */}
            {organisationWelcome.messages.map((str, index) => (
                <p className={styles.standard}>{str}</p>
            ))}
            <p className={styles.welcome}>{organisationWelcome.additionalMessage}</p>
        </div>
    )
}

export default WelcomeMessageComponent;