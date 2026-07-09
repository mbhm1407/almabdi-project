import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import { formatDuration } from '@smj/shared';
import { apiClient } from '../../../services/apiClient';
import { formatBytes } from '../../../services/format';
import { toFriendlyError } from '../../../services/errorMessages';
import type { RecordingInfo } from '../hooks/useTranscription';

const useStyles = makeStyles({
  body: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  meta: { display: 'flex', gap: tokens.spacingHorizontalL, color: tokens.colorNeutralForeground2 },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  metaValue: { fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  player: { width: '100%' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS },
  center: { display: 'flex', justifyContent: 'center', paddingBlock: tokens.spacingVerticalL },
});

interface RecordingsPanelProps {
  open: boolean;
  sessionId: string | null;
  recording: RecordingInfo | null;
  onClose: () => void;
}

/**
 * Recording playback panel: play/pause via the native audio controls, plus the
 * recording duration, size and a download action. The audio streams from a
 * short-lived SAS URL minted by the backend.
 */
export function RecordingsPanel({ open, sessionId, recording, onClose }: RecordingsPanelProps) {
  const styles = useStyles();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !sessionId) return;
    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);
    apiClient
      .getRecordingUrl(sessionId)
      .then((res) => {
        if (!cancelled) setUrl(res.url);
      })
      .catch((err) => {
        if (!cancelled) setErrorMsg(toFriendlyError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, sessionId]);

  return (
    <Dialog open={open} onOpenChange={(_e, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>تسجيل الجلسة الصوتي</DialogTitle>
          <DialogContent>
            <div className={styles.body}>
              {recording && (
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <Text size={200}>المدة</Text>
                    <Text className={styles.metaValue}>{formatDuration(recording.durationMs)}</Text>
                  </div>
                  <div className={styles.metaItem}>
                    <Text size={200}>الحجم</Text>
                    <Text className={styles.metaValue}>{formatBytes(recording.bytes)}</Text>
                  </div>
                </div>
              )}

              {loading && (
                <div className={styles.center}>
                  <Spinner label="جارٍ تحميل التسجيل…" />
                </div>
              )}
              {errorMsg && <Text>{errorMsg}</Text>}
              {url && !loading && (
                <>
                  <audio className={styles.player} controls src={url} preload="metadata" />
                  <div className={styles.actions}>
                    <Button
                      as="a"
                      href={url}
                      download
                      appearance="primary"
                      icon={<ArrowDownloadRegular />}
                    >
                      تنزيل التسجيل
                    </Button>
                    <Button appearance="secondary" onClick={onClose}>
                      إغلاق
                    </Button>
                  </div>
                </>
              )}
              {!url && !loading && !errorMsg && <Text>لا يتوفّر تسجيل صوتي لهذه الجلسة بعد.</Text>}
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
