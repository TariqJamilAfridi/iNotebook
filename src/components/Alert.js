import React from 'react';

function Alert({ alert }) {
    if (!alert) return null;

    const icons = {
        success: 'fa-solid fa-circle-check',
        danger:  'fa-solid fa-circle-xmark',
        warning: 'fa-solid fa-triangle-exclamation',
        info:    'fa-solid fa-circle-info',
    };

    const icon = icons[alert.type] || icons.info;

    return (
        <div className="alert-wrapper" role="alert" aria-live="polite">
            <div className={`custom-alert custom-alert-${alert.type}`}>
                <i className={`${icon} alert-icon`}></i>
                <span className="alert-text">{alert.message}</span>
                <div className="alert-progress-bar"></div>
            </div>
        </div>
    );
}

export default Alert;
