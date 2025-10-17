import React from "react";
import styles from '@/styles/PageHeader.module.css';

const PageHeaderComponent = (props) => {
    return (
        <div className={styles.pageheader}>
            <div className={styles.textlabel}>{props.organisationName || 'Open Word'}</div>
            <div className={styles.sessionstatus}>
                <div className={styles.brandtext}>Open Word</div>
                <div className={styles.livestreamrow}>
                    <div className={styles.sessiontext}>Livestream:</div>
                    <div className={styles.sessionindicator}>
                        <div className={props.sessionStatus === 'ON' ? styles.sessionon : styles.sessionoff}>{props.sessionStatus}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PageHeaderComponent;
