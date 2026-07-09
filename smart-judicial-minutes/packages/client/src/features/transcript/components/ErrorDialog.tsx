import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';
import { ErrorCircleRegular } from '@fluentui/react-icons';
import type { FriendlyError } from '../../../services/errorMessages';

interface ErrorDialogProps {
  error: FriendlyError | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

/** Presents a friendly, actionable error in a Fluent dialog. */
export function ErrorDialog({ error, onDismiss, onRetry }: ErrorDialogProps) {
  return (
    <Dialog open={error !== null} onOpenChange={(_e, data) => !data.open && onDismiss()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <ErrorCircleRegular style={{ verticalAlign: 'middle', marginInlineEnd: 8 }} />
            {error?.title}
          </DialogTitle>
          <DialogContent>{error?.message}</DialogContent>
          <DialogActions>
            {error?.recoverable && onRetry && (
              <Button
                appearance="primary"
                onClick={() => {
                  onDismiss();
                  onRetry();
                }}
              >
                إعادة المحاولة
              </Button>
            )}
            <Button appearance="secondary" onClick={onDismiss}>
              إغلاق
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
