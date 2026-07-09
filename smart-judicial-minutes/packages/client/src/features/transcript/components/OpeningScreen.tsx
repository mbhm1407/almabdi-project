import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Field,
  Input,
  Text,
  Title1,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { RecordRegular } from '@fluentui/react-icons';
import { v4 as uuid } from 'uuid';
import { AR } from '../../../strings';
import type { Participant, SessionSetup } from '../types';

const useStyles = makeStyles({
  scroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    marginBlock: tokens.spacingVerticalXXXL,
    marginInline: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    alignItems: 'stretch',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
    textAlign: 'center',
  },
  ministry: { color: tokens.colorNeutralForeground2, letterSpacing: '0.5px' },
  emblem: { fontSize: '48px', lineHeight: 1 },
  fields: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  readonlyRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
  },
  readonly: { flex: 1 },
  startButton: {
    marginBlockStart: tokens.spacingVerticalM,
    height: '64px',
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
});

interface OpeningScreenProps {
  defaultTitle: string;
  clerkName: string;
  busy: boolean;
  onStart: (setup: SessionSetup) => void;
}

/**
 * The official opening screen. Presents the hearing's identity (case number,
 * circuit, judge, clerk, date and time) and one large "بدء التوثيق" button —
 * nothing else — echoing an internal Ministry-of-Justice application.
 */
export function OpeningScreen({ defaultTitle, clerkName, busy, onStart }: OpeningScreenProps) {
  const styles = useStyles();
  const [caseNumber, setCaseNumber] = useState('');
  const [circuitName, setCircuitName] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [clerk, setClerk] = useState(clerkName);

  const now = useMemo(() => new Date(), []);
  const hearingDate = now.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const startTime = now.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleStart = () => {
    const participants: Participant[] = [];
    if (judgeName.trim()) participants.push({ id: uuid(), name: judgeName.trim(), role: 'judge' });
    if (clerk.trim()) participants.push({ id: uuid(), name: clerk.trim(), role: 'clerk' });
    onStart({
      meetingTitle: defaultTitle,
      caseNumber: caseNumber.trim(),
      circuitName: circuitName.trim(),
      judgeName: judgeName.trim(),
      participants,
    });
  };

  return (
    <div className={styles.scroll}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.emblem} role="img" aria-label="ميزان العدل">
            ⚖️
          </span>
          <Title1>{AR.appName}</Title1>
          <Text className={styles.ministry} size={300}>
            {AR.ministry}
          </Text>
        </div>

        <div className={styles.fields}>
          <Field label={AR.caseNumber}>
            <Input
              value={caseNumber}
              onChange={(_e, d) => setCaseNumber(d.value)}
              placeholder="مثال: ٤٣٥/٢/ق"
              size="large"
            />
          </Field>
          <Field label={AR.circuit}>
            <Input
              value={circuitName}
              onChange={(_e, d) => setCircuitName(d.value)}
              placeholder="مثال: الدائرة الحقوقية الأولى"
              size="large"
            />
          </Field>
          <Field label={AR.judge}>
            <Input
              value={judgeName}
              onChange={(_e, d) => setJudgeName(d.value)}
              placeholder="اسم القاضي"
              size="large"
            />
          </Field>
          <Field label={AR.clerk}>
            <Input value={clerk} onChange={(_e, d) => setClerk(d.value)} size="large" />
          </Field>
          <div className={styles.readonlyRow}>
            <Field label={AR.hearingDate} className={styles.readonly}>
              <Input value={hearingDate} readOnly size="large" />
            </Field>
            <Field label={AR.startTime} className={styles.readonly}>
              <Input value={startTime} readOnly size="large" />
            </Field>
          </div>
        </div>

        <Button
          className={styles.startButton}
          appearance="primary"
          size="large"
          icon={<RecordRegular />}
          disabled={busy}
          onClick={handleStart}
        >
          {AR.startDocumentation}
        </Button>
      </Card>
    </div>
  );
}
