import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { AR } from '../../../strings';
import { APP_VERSION } from '../../../version';

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: '300px',
  },
  emblem: { fontSize: '36px', textAlign: 'center' },
  center: { textAlign: 'center' },
  ministry: { color: tokens.colorNeutralForeground2, textAlign: 'center' },
  rows: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  row: { display: 'flex', justifyContent: 'space-between', gap: tokens.spacingHorizontalM },
  label: { color: tokens.colorNeutralForeground3 },
  value: { fontWeight: tokens.fontWeightSemibold },
  credit: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    marginBlockStart: tokens.spacingVerticalS,
  },
  actions: { display: 'flex', justifyContent: 'flex-end' },
});

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

/** About dialog: app identity, version and (unobtrusive) authorship credit. */
export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const styles = useStyles();
  return (
    <Dialog open={open} onOpenChange={(_e, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{AR.about}</DialogTitle>
          <DialogContent>
            <div className={styles.body}>
              <div className={styles.emblem} role="img" aria-label="ميزان العدل">
                ⚖️
              </div>
              <Text as="h3" size={500} weight="semibold" className={styles.center}>
                {AR.appName}
              </Text>
              <Text className={styles.ministry}>{AR.ministry}</Text>
              <Text className={styles.center}>{AR.aboutDescription}</Text>

              <div className={styles.rows}>
                <div className={styles.row}>
                  <Text className={styles.label}>{AR.version}</Text>
                  <Text className={styles.value}>{APP_VERSION}</Text>
                </div>
                <div className={styles.row}>
                  <Text className={styles.label}>{AR.developer}</Text>
                  <Text className={styles.value}>محمد المعبدي</Text>
                </div>
                <div className={styles.row}>
                  <Text className={styles.label}>{AR.email}</Text>
                  <Text className={styles.value}>
                    <a href={`mailto:${AR.developerEmail}`}>{AR.developerEmail}</a>
                  </Text>
                </div>
              </div>

              <Text size={200} className={styles.credit}>
                {AR.developedBy}
              </Text>

              <div className={styles.actions}>
                <Button appearance="secondary" onClick={onClose}>
                  {AR.close}
                </Button>
              </div>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
