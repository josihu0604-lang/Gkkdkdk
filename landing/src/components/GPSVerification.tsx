'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type VerificationStatus = 
  | 'loading' 
  | 'success' 
  | 'low-accuracy' 
  | 'permission-denied' 
  | 'unsupported' 
  | 'error';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GPSVerificationProps {
  targetLocation?: { lat: number; lng: number };
  radiusMeters?: number;
  onSuccess?: (position: GPSPosition) => void;
  onError?: (error: string) => void;
}

export function GPSVerification({
  targetLocation,
  radiusMeters = 50,
  onSuccess,
  onError
}: GPSVerificationProps) {
  const t = useTranslations('gps');
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setErrorMessage(t('errors.unsupported'));
      onError?.(t('errors.unsupported'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy: posAccuracy } = position.coords;
      
      setAccuracy(posAccuracy);

      // Check accuracy threshold
      if (posAccuracy > 50) {
        setStatus('low-accuracy');
        setErrorMessage(t('errors.low_accuracy', { accuracy: Math.round(posAccuracy) }));
        return;
      }

      // Verify distance if target location provided
      if (targetLocation) {
        const distance = calculateDistance(
          latitude,
          longitude,
          targetLocation.lat,
          targetLocation.lng
        );

        if (distance > radiusMeters) {
          setStatus('error');
          setErrorMessage(t('errors.too_far', { distance: Math.round(distance) }));
          onError?.(t('errors.too_far', { distance: Math.round(distance) }));
          return;
        }
      }

      setStatus('success');
      const gpsData: GPSPosition = {
        latitude,
        longitude,
        accuracy: posAccuracy,
        timestamp: Date.now()
      };
      onSuccess?.(gpsData);
    };

    const handleError = (error: GeolocationPositionError) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setStatus('permission-denied');
          setErrorMessage(t('errors.permission_denied'));
          onError?.(t('errors.permission_denied'));
          break;
        case error.POSITION_UNAVAILABLE:
          setStatus('error');
          setErrorMessage(t('errors.position_unavailable'));
          onError?.(t('errors.position_unavailable'));
          break;
        case error.TIMEOUT:
          setStatus('error');
          setErrorMessage(t('errors.timeout'));
          onError?.(t('errors.timeout'));
          break;
        default:
          setStatus('error');
          setErrorMessage(t('errors.unknown'));
          onError?.(t('errors.unknown'));
      }
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, [targetLocation, radiusMeters, onSuccess, onError, t]);

  const openLocationSettings = () => {
    // iOS
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      alert(t('settings.ios_instruction'));
    }
    // Android
    else if (navigator.userAgent.match(/Android/i)) {
      alert(t('settings.android_instruction'));
    }
    // Desktop
    else {
      alert(t('settings.desktop_instruction'));
    }
  };

  return (
    <div className="gps-verification">
      {status === 'loading' && (
        <div className="verification-loading">
          <div className="spinner" />
          <p>{t('status.loading')}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="verification-success">
          <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>{t('status.success')}</h3>
          {accuracy && (
            <p className="accuracy-info">
              {t('status.accuracy', { accuracy: Math.round(accuracy) })}
            </p>
          )}
        </div>
      )}

      {status === 'low-accuracy' && (
        <div className="verification-warning">
          <svg className="icon-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>{t('status.low_accuracy_title')}</h3>
          <p>{errorMessage}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            {t('actions.retry')}
          </button>
          <p className="tip">{t('tips.improve_accuracy')}</p>
        </div>
      )}

      {status === 'permission-denied' && (
        <div className="verification-error">
          <svg className="icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>{t('status.permission_denied_title')}</h3>
          <p>{errorMessage}</p>
          <button onClick={openLocationSettings} className="btn-settings">
            {t('actions.open_settings')}
          </button>
        </div>
      )}

      {status === 'unsupported' && (
        <div className="verification-error">
          <svg className="icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>{t('status.unsupported_title')}</h3>
          <p>{errorMessage}</p>
          <p className="tip">{t('tips.use_mobile')}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="verification-error">
          <svg className="icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>{t('status.error_title')}</h3>
          <p>{errorMessage}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            {t('actions.retry')}
          </button>
        </div>
      )}
    </div>
  );
}

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
